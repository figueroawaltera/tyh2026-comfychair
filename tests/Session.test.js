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

const addReviewers = (session, reviewers) =>
    reviewers.forEach((candidate) => session.addReviewer(candidate));

const advance = (session, stages) => {
    for (let index = 0; index < stages; index++) session.closeStage();
};

function assignedScenario() {
    const session = new Session();
    const article = paper();
    const reviewers = [reviewer("R1", 1), reviewer("R2", 2), reviewer("R3", 3)];

    addReviewers(session, reviewers);
    session.submit(article);
    session.closeStage();

    reviewers.forEach((candidate, index) =>
        session.enterBid(
            article,
            candidate,
            index < 2 ? Interests.Interested : Interests.Maybe
        )
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
    test("inicia vacía y permite agregar revisores", () => {
        const session = new Session();
        const candidate = reviewer("Reviewer", 1);

        expect(session.name()).toBe("");
        expect(session.programCommittee()).toHaveLength(0);

        session.addReviewer(candidate);
        expect(session.programCommittee()).toEqual([candidate]);
    });

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
        expect(session.interestFor(article, candidate)).toBe(Interests.Maybe);
        expect(session.canSubmit(article)).toBe(false);
        expect(() => session.submit(article)).toThrow();
    });

    test("assignment rechaza ofertas y asignaciones duplicadas", () => {
        const session = new Session();
        const article = paper();
        const candidate = reviewer("Reviewer", 1);

        session.addReviewer(candidate);
        session.submit(article);
        advance(session, 2);
        session.enterAssignment(article, candidate);

        expect(session.assignmentExistsFor(article, candidate)).toBe(true);
        expect(session.assignmentFor(article, candidate).reviewer()).toBe(candidate);
        expect(session.assignmentsForPaper(article)).toBe(1);
        expect(() => session.enterAssignment(article, candidate)).toThrow();
        expect(() =>
            session.enterBid(article, candidate, Interests.Interested)
        ).toThrow();
    });

    test("asigna los tres revisores con mayor prioridad", () => {
        const session = new Session();
        const article = paper("Paper A", reviewer("Autor", 10));
        const reviewers = [
            reviewer("R1", 1),
            reviewer("R2", 2),
            reviewer("R3", 3),
            reviewer("R4", 4)
        ];

        addReviewers(session, reviewers);
        session.submit(article);
        session.closeStage();
        session.enterBid(article, reviewers[0], Interests.Interested);
        session.enterBid(article, reviewers[1], Interests.Interested);
        session.enterBid(article, reviewers[2], Interests.Maybe);
        session.enterBid(article, reviewers[3], Interests.NotInterested);
        session.closeStage();
        session.assignReviewers();

        expect(session.assignmentsForPaper(article)).toBe(3);
        expect(session.assignmentExistsFor(article, reviewers[0])).toBe(true);
        expect(session.assignmentExistsFor(article, reviewers[1])).toBe(true);
        expect(session.assignmentExistsFor(article, reviewers[2])).toBe(true);
        expect(session.assignmentExistsFor(article, reviewers[3])).toBe(false);
    });

    test("excluye autores durante la asignación", () => {
        const session = new Session();
        const author1 = reviewer("Autor 1", 1);
        const author2 = reviewer("Autor 2", 2);
        const article = new Paper("Paper", [author1, author2], author1);
        const reviewers = [
            author1,
            author2,
            reviewer("R3", 3),
            reviewer("R4", 4),
            reviewer("R5", 5)
        ];

        addReviewers(session, reviewers);
        session.submit(article);
        session.closeStage();
        reviewers.forEach((candidate) =>
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

        addReviewers(session, reviewers);
        Array.from({ length: 10 }, (_, index) =>
            session.submit(
                paper(`Paper ${index}`, reviewers[index % reviewers.length])
            )
        );

        session.calculateWorkload();

        expect(reviewers.map((candidate) => candidate.getWorkload()))
            .toEqual([5, 5, 4, 4, 4, 4, 4]);
    });

    test("revision acepta solo reviews válidas de revisores asignados", () => {
        const { session, article, reviewers } = assignedScenario();
        const outsider = reviewer("Outsider", 20);

        session.closeStage();
        session.enterReview(article, reviewers[0], "Buen trabajo", 2);

        expect(article.reviews()).toHaveLength(1);
        expect(article.score()).toBe(2);
        expect(() => session.enterReview(article, outsider, "Review", 2)).toThrow();
        expect(() =>
            session.enterReview(article, reviewers[0], "Duplicada", 1)
        ).toThrow();
        expect(() =>
            session.enterReview(article, reviewers[1], "Fuera de rango", 4)
        ).toThrow();
        expect(() => session.assignReviewers()).toThrow();
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

        [articleA, articleB, articleC, articleD]
            .forEach((item) => session.submit(item));
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
    test("no participan de asignaciones ni revisiones", () => {
        const session = new Session();
        const author = new User("Autor", "Universidad", "author@mail.com", "pass");
        const nonReviewer = new User(
            "No reviewer", "Universidad", "user@mail.com", "pass"
        );
        const article = new Paper("Paper", [author, nonReviewer], author);
        const reviewers = [
            reviewer("R1", 1), reviewer("R2", 2), reviewer("R3", 3)
        ];

        addReviewers(session, reviewers);
        session.submit(article);
        session.closeStage();
        reviewers.forEach((candidate) =>
            session.enterBid(article, candidate, Interests.Interested)
        );
        session.closeStage();
        session.assignReviewers();

        expect(session.assignmentExistsFor(article, nonReviewer)).toBe(false);
        expect(session.assignmentsForPaper(article)).toBe(3);

        session.closeStage();
        expect(() =>
            session.enterReview(article, nonReviewer, "Review", 1)
        ).toThrow();
    });
});
