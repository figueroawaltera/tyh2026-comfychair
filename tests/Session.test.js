const Session = require("../src/Session");
const Reviewer = require("../src/Reviewer");
const User = require("../src/User");
const Paper = require("../src/Paper");
const { Interests } = require("../src/Bid");
const AcceptanceByPercentage = require("../src/policies/AcceptanceByPercentage");
const AcceptanceByCount = require("../src/policies/AcceptanceByCount");
const AcceptanceByScoreThreshold = require("../src/policies/AcceptanceByScoreThreshold");

const reviewer = (name, id) =>
    new Reviewer(name, `Universidad ${id}`, `reviewer${id}@mail.com`, "pass");

const paper = (title = "Paper válido", author = reviewer("Autor", 99)) =>
    new Paper(title, [author], author);

const advance = (session, stages) => {
    for (let index = 0; index < stages; index++) session.closeStage();
};

function assignedScenario() {
    const session = new Session();
    const article = paper();
    const reviewers = [reviewer("R1", 1), reviewer("R2", 2), reviewer("R3", 3)];

    reviewers.forEach((candidate) => session.addReviewer(candidate));
    session.submit(article);
    session.closeStage();
    reviewers.forEach((candidate) =>
        session.enterBid(article, candidate, Interests.Interested)
    );
    session.closeStage();
    session.assignReviewers();

    return { session, article, reviewers };
}

function scoredPaper(title, scores) {
    const article = paper(title, reviewer(`${title} Autor`, title.length + 20));
    scores.forEach((score, index) =>
        article.addReview(
            reviewer(`${title} R${index}`, title.length + index + 40),
            `Review ${index}`,
            score
        )
    );
    return article;
}

describe("Session como contexto del patrón State", () => {
    test("recibe papers válidos y rechaza inválidos", () => {
        const session = new Session();
        const validPaper = paper();
        const invalidPaper = paper("", reviewer("Autor", 1));

        expect(session.canSubmit(validPaper)).toBe(true);
        session.submit(validPaper);
        expect(session.papers()).toContain(validPaper);
        expect(session.canSubmit(invalidPaper)).toBe(false);
        expect(() => session.submit(invalidPaper)).toThrow();
    });

    test("bidding registra y actualiza una única oferta", () => {
        const session = new Session();
        const article = paper();
        const candidate = reviewer("Reviewer", 1);

        session.submit(article);
        session.closeStage();
        session.enterBid(article, candidate, Interests.Interested);
        session.enterBid(article, candidate, Interests.Maybe);

        expect(session.bids()).toHaveLength(1);
        expect(session.bidFor(article, candidate).matches(article, candidate)).toBe(true);
        expect(session.interestFor(article, candidate)).toBe(Interests.Maybe);
        expect(() => session.submit(article)).toThrow();
    });

    test("assignment crea una relación y rechaza duplicados", () => {
        const session = new Session();
        const article = paper();
        const candidate = reviewer("Reviewer", 1);

        session.addReviewer(candidate);
        session.submit(article);
        advance(session, 2);

        const assignment = session.enterAssignment(article, candidate);

        expect(assignment.matches(article, candidate)).toBe(true);
        expect(session.assignmentFor(article, candidate)).toBe(assignment);
        expect(session.assignmentsForPaper(article)).toBe(1);
        expect(article.reviewersAssigned()).toBe(1);
        expect(candidate.papersAssigned()).toBe(1);
        expect(() => session.enterAssignment(article, candidate)).toThrow();
    });

    test("asigna por prioridad y excluye conflictos", () => {
        const session = new Session();
        const article = paper("Paper A", reviewer("Autor", 10));
        const reviewers = [
            reviewer("R1", 1),
            reviewer("R2", 2),
            reviewer("R3", 3),
            reviewer("R4", 4)
        ];

        reviewers.forEach((candidate) => session.addReviewer(candidate));
        session.submit(article);
        session.closeStage();
        session.enterBid(article, reviewers[0], Interests.Interested);
        session.enterBid(article, reviewers[1], Interests.Interested);
        session.enterBid(article, reviewers[2], Interests.Maybe);
        session.enterBid(article, reviewers[3], Interests.Conflict);
        session.closeStage();
        session.assignReviewers();

        expect(session.assignmentsForPaper(article)).toBe(3);
        expect(session.assignmentExistsFor(article, reviewers[0])).toBe(true);
        expect(session.assignmentExistsFor(article, reviewers[1])).toBe(true);
        expect(session.assignmentExistsFor(article, reviewers[2])).toBe(true);
        expect(session.assignmentExistsFor(article, reviewers[3])).toBe(false);
    });

    test("Paper evita asignar a sus autores", () => {
        const session = new Session();
        const author1 = reviewer("Autor 1", 1);
        const author2 = reviewer("Autor 2", 2);
        const article = new Paper("Paper", [author1, author2], author1);
        const candidates = [
            author1,
            author2,
            reviewer("R3", 3),
            reviewer("R4", 4),
            reviewer("R5", 5)
        ];

        candidates.forEach((candidate) => session.addReviewer(candidate));
        session.submit(article);
        session.closeStage();
        candidates.forEach((candidate) =>
            session.enterBid(article, candidate, Interests.Interested)
        );
        session.closeStage();
        session.assignReviewers();

        expect(session.assignmentExistsFor(article, author1)).toBe(false);
        expect(session.assignmentExistsFor(article, author2)).toBe(false);
        expect(session.assignmentsForPaper(article)).toBe(3);
    });

    test("calcula y distribuye la carga de revisiones", () => {
        const session = new Session();
        const reviewers = Array.from(
            { length: 7 },
            (_, index) => reviewer(`R${index}`, index)
        );

        reviewers.forEach((candidate) => session.addReviewer(candidate));
        Array.from({ length: 10 }, (_, index) =>
            session.submit(paper(`Paper ${index}`, reviewers[index % reviewers.length]))
        );

        session.calculateWorkload();

        expect(reviewers.map((candidate) => candidate.workload()))
            .toEqual([5, 5, 4, 4, 4, 4, 4]);
    });

    test("revision acepta solo reviews de revisores asignados", () => {
        const { session, article, reviewers } = assignedScenario();
        const outsider = reviewer("Outsider", 20);

        session.closeStage();
        session.enterReview(article, reviewers[0], "Buen trabajo", 2);

        expect(article.reviewFor(reviewers[0]).isFrom(reviewers[0])).toBe(true);
        expect(article.score()).toBe(2);
        expect(() => session.enterReview(article, outsider, "Review", 2)).toThrow();
        expect(() => session.enterReview(article, reviewers[0], "Duplicada", 1)).toThrow();
        expect(() => session.enterReview(article, reviewers[1], "Fuera de rango", 4)).toThrow();
    });

    test("selection ordena papers y rechaza reviews tardías", () => {
        const session = new Session();
        const articleA = scoredPaper("A", [1, 2, 1]);
        const articleB = scoredPaper("B", [3, 2, 3]);
        const articleC = scoredPaper("C", [0, 1, 0]);

        [articleA, articleB, articleC].forEach((item) => session.submit(item));
        advance(session, 4);

        expect(session.obtenerArticulosOrdenadosPorScore())
            .toEqual([articleB, articleA, articleC]);
        expect(() =>
            session.enterReview(articleA, reviewer("Tardío", 30), "Review", 1)
        ).toThrow();
    });
});

describe("Políticas de aceptación", () => {
    test("selecciona por porcentaje y score mínimo", () => {
        const session = new Session();
        const papers = [
            scoredPaper("A", [3, 3, 3]),
            scoredPaper("B", [2, 2, 2]),
            scoredPaper("C", [0, 0, 0]),
            scoredPaper("D", [-1, -1, -1])
        ];
        const policy = new AcceptanceByPercentage();

        papers.forEach((item) => session.submit(item));
        policy.setPercentage(50);
        session.setAcceptancePolicy(policy);
        advance(session, 4);

        expect(session.cantidadArticulosAAceptar()).toBe(2);
        expect(session.obtenerArticulosAceptados()).toEqual(papers.slice(0, 2));
    });

    test("selecciona por cantidad fija", () => {
        const session = new Session();
        const articleA = scoredPaper("A", [3, 3, 3]);
        const articleB = scoredPaper("B", [1, 1, 1]);
        const articleC = scoredPaper("C", [3, 2, 3]);
        const articleD = scoredPaper("D", [0, 0, 0]);

        [articleA, articleB, articleC, articleD].forEach((item) => session.submit(item));
        session.setAcceptancePolicy(new AcceptanceByCount(2));
        advance(session, 4);

        expect(session.obtenerArticulosAceptados()).toEqual([articleA, articleC]);
    });

    test("selecciona por umbral y permite cambiar de estrategia", () => {
        const session = new Session();
        const articleA = scoredPaper("A", [2, 2, 2]);
        const articleB = scoredPaper("B", [2, 2, 1]);
        const articleC = scoredPaper("C", [0, 0, 0]);

        [articleA, articleB, articleC].forEach((item) => session.submit(item));
        session.setAcceptancePolicy(new AcceptanceByScoreThreshold(1.5));
        advance(session, 4);

        expect(session.obtenerArticulosAceptados()).toEqual([articleA, articleB]);

        session.setAcceptancePolicy(new AcceptanceByCount(1));
        expect(session.obtenerArticulosAceptados()).toEqual([articleA]);
    });
});

describe("Usuarios que no son revisores", () => {
    test("Paper impide que participen de asignaciones", () => {
        const session = new Session();
        const author = new User("Autor", "Universidad", "author@mail.com", "pass");
        const nonReviewer = new User("No reviewer", "Universidad", "user@mail.com", "pass");
        const article = new Paper("Paper", [author], author);

        session.addReviewer(nonReviewer);
        session.submit(article);
        advance(session, 2);

        expect(article.canBeReviewedBy(nonReviewer)).toBe(false);
        expect(() => session.enterAssignment(article, nonReviewer)).toThrow();
        expect(session.assignmentExistsFor(article, nonReviewer)).toBe(false);
    });
});
