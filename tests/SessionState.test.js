const Session = require("../src/Session");
const Reviewer = require("../src/Reviewer");
const User = require("../src/User");
const Paper = require("../src/Paper");
const { Interests } = require("../src/Bid");

function buildAssignmentScenario() {
    const session = new Session();
    const author = new User("Autor", "Universidad", "author@mail.com", "pass");
    const article = new Paper("Paper", [author], author);
    const reviewers = [
        new Reviewer("R1", "Universidad", "r1@mail.com", "pass"),
        new Reviewer("R2", "Universidad", "r2@mail.com", "pass"),
        new Reviewer("R3", "Universidad", "r3@mail.com", "pass")
    ];

    reviewers.forEach((reviewer) => session.addReviewer(reviewer));
    session.submit(article);
    session.closeStage();
    reviewers.forEach((reviewer) =>
        session.enterBid(article, reviewer, Interests.Interested)
    );
    session.closeStage();

    return { session, article, reviewers };
}

describe("Distribución de responsabilidades del patrón State", () => {
    test("Session conserva coordinación y búsquedas mediante comportamiento", () => {
        const session = new Session();

        expect(typeof session.enterAssignment).toBe("function");
        expect(typeof session.assignReviewers).toBe("function");
        expect(typeof session.addAssignment).toBe("function");
        expect(typeof session.assignmentFor).toBe("function");
        expect(typeof session.bidFor).toBe("function");

        expect(session.interestPriority).toBeUndefined();
        expect(session.candidatesForAssignment).toBeUndefined();
    });

    test("AssignmentStage delega las reglas en los objetos de dominio", () => {
        const { session, article, reviewers } = buildAssignmentScenario();

        session.assignReviewers();

        expect(article.reviewersAssigned()).toBe(3);
        reviewers.forEach((reviewer) => {
            expect(reviewer.papersAssigned()).toBe(1);
            expect(session.assignmentFor(article, reviewer).matches(article, reviewer))
                .toBe(true);
        });
    });

    test("una asignación inválida no modifica los objetos", () => {
        const session = new Session();
        const author = new Reviewer(
            "Autor", "Universidad", "author@mail.com", "pass"
        );
        const article = new Paper("Paper", [author], author);

        session.addReviewer(author);
        session.submit(article);
        session.closeStage();
        session.enterBid(article, author, Interests.Interested);
        session.closeStage();

        expect(() => session.enterAssignment(article, author)).toThrow();
        expect(article.reviewersAssigned()).toBe(0);
        expect(author.papersAssigned()).toBe(0);
        expect(session.assignmentsForPaper(article)).toBe(0);
    });

    test("Session delega una asignación manual solo durante assignment", () => {
        const { session, article, reviewers } = buildAssignmentScenario();

        session.enterAssignment(article, reviewers[0]);
        session.closeStage();

        expect(() => session.enterAssignment(article, reviewers[1])).toThrow();
    });
});
