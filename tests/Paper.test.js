const Paper = require("../src/Paper");
const Reviewer = require("../src/Reviewer");
const User = require("../src/User");

const reviewer = (name, id) =>
    new Reviewer(name, "Universidad", `${id}@mail.com`, "pass");

describe("Paper", () => {
    test("valida el autor correspondiente y reconoce a sus autores", () => {
        const author = new User("Autor", "Universidad", "author@mail.com", "pass");
        const coauthor = new User("Coautor", "Universidad", "co@mail.com", "pass");
        const outsider = new User("Otro", "Universidad", "other@mail.com", "pass");
        const paper = new Paper("Paper", [author, coauthor], author);

        expect(paper.hasAuthor(author)).toBe(true);
        expect(paper.hasAuthor(coauthor)).toBe(true);
        expect(paper.hasAuthor(outsider)).toBe(false);
        expect(() => new Paper("Inválido", [coauthor], author)).toThrow();
    });

    test("decide si un reviewer puede ser asignado", () => {
        const author = reviewer("Autor", 1);
        const candidate = reviewer("Reviewer", 2);
        const nonReviewer = new User("User", "Universidad", "u@mail.com", "pass");
        const paper = new Paper("Paper", [author], author);

        expect(paper.canBeReviewedBy(candidate)).toBe(true);
        expect(paper.canBeReviewedBy(author)).toBe(false);
        expect(paper.canBeReviewedBy(nonReviewer)).toBe(false);

        candidate.assignPaper();
        expect(paper.canBeReviewedBy(candidate)).toBe(false);
    });

    test("controla su propia capacidad de asignación", () => {
        const author = new User("Autor", "Universidad", "author@mail.com", "pass");
        const paper = new Paper("Paper", [author], author);
        const reviewers = [reviewer("R1", 1), reviewer("R2", 2), reviewer("R3", 3)];

        reviewers.forEach((candidate) => paper.assignReviewer(candidate));

        expect(paper.reviewersAssigned()).toBe(3);
        expect(paper.hasAssignmentCapacity()).toBe(false);
        expect(() => paper.assignReviewer(reviewer("R4", 4))).toThrow();
    });

    test("recibe hasta tres reviews y calcula sus scores", () => {
        const author = new User("Autor", "Universidad", "author@mail.com", "pass");
        const reviewers = [reviewer("R1", 1), reviewer("R2", 2), reviewer("R3", 3)];
        const paper = new Paper("Paper", [author], author);

        expect(paper.score()).toBe(0);
        expect(paper.finalScore()).toBe(-3);

        paper.addReview(reviewers[0], "Mala", -3);
        paper.addReview(reviewers[1], "Regular", 1);
        paper.addReview(reviewers[2], "Buena", 2);

        expect(paper.score()).toBe(0);
        expect(paper.finalScore()).toBe(0);
        expect(paper.reviewFor(reviewers[1]).isFrom(reviewers[1])).toBe(true);
        expect(paper.reviewExistsFor(reviewers[1])).toBe(true);
        expect(() => paper.addReview(reviewer("R4", 4), "Extra", 0)).toThrow();
    });
});
