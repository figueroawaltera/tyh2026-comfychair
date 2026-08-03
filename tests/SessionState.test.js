const Session = require("../src/Session");
const Reviewer = require("../src/Reviewer");
const Paper = require("../src/Paper");
const { Interests } = require("../src/Bid");

function buildAssignmentScenario() {
    const session = new Session();
    const author = new Reviewer("Autor", "Universidad", "author@mail.com", "pass");
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

describe("Responsabilidades de Session y AssignmentStage", () => {
    test("Session expone únicamente la API corregida de asignación", () => {
        const session = new Session();

        expect(typeof session.enterAssignment).toBe("function");
        expect(typeof session.assignReviewers).toBe("function");
        expect(typeof session.assignmentExistsFor).toBe("function");
        expect(typeof session.assignmentFor).toBe("function");
        expect(typeof session.assignmentsForPaper).toBe("function");

        expect(session.enterAssigment).toBeUndefined();
        expect(session.asignarRevisores).toBeUndefined();
        expect(session.assigmentExistsFor).toBeUndefined();
        expect(session.assigmentFor).toBeUndefined();
        expect(session.assigmentsPapers).toBeUndefined();
    });

    test("la generación y prioridad de candidatos no pertenecen a Session", () => {
        const session = new Session();

        expect(session.interestPriority).toBeUndefined();
        expect(session.candidatesForAssignment).toBeUndefined();
    });

    test("AssignmentStage conserva el comportamiento de asignación", () => {
        const { session, article, reviewers } = buildAssignmentScenario();

        session.assignReviewers();

        expect(session.assignmentsForPaper(article)).toBe(3);
        reviewers.forEach((reviewer) =>
            expect(session.assignmentExistsFor(article, reviewer)).toBe(true)
        );
    });

    test("Session delega una asignación manual solo durante assignment", () => {
        const { session, article, reviewers } = buildAssignmentScenario();

        session.enterAssignment(article, reviewers[0]);
        expect(session.assignmentFor(article, reviewers[0]).paper()).toBe(article);

        session.closeStage();
        expect(() =>
            session.enterAssignment(article, reviewers[1])
        ).toThrow();
    });
});
