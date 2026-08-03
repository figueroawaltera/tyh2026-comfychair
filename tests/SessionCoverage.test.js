const Session = require("../src/Session");
const Assignment = require("../src/Assignment");
const Paper = require("../src/Paper");
const Reviewer = require("../src/Reviewer");
const User = require("../src/User");
const { Interests } = require("../src/Bid");
const AcceptanceByPercentage = require("../src/policies/AcceptanceByPercentage");

const reviewer = (name, id) =>
    new Reviewer(name, "Universidad", `${id}@mail.com`, "pass");

const paper = (title = "Paper") => {
    const author = new User("Autor", "Universidad", "author@mail.com", "pass");
    return new Paper(title, [author], author);
};

describe("Cobertura de la API de Session", () => {
    test("expone sus valores iniciales y la política predeterminada", () => {
        const session = new Session();

        expect(session.name()).toBe("");
        expect(session.programCommittee()).toEqual([]);
        expect(session.papers()).toEqual([]);
        expect(session.bids()).toEqual([]);
        expect(session.assignments()).toEqual([]);
        expect(session.acceptancePercentage()).toBe(0);
        expect(session.acceptancePolicy()).toBeInstanceOf(AcceptanceByPercentage);
    });

    test("mantiene la compatibilidad del porcentaje y valida sus límites", () => {
        const session = new Session();

        session.setAcceptancePercentage(50);

        expect(session.acceptancePercentage()).toBe(50);
        expect(session.acceptancePolicy().percentage()).toBe(50);
        expect(() => session.setAcceptancePercentage(-1)).toThrow();
        expect(() => session.setAcceptancePercentage(101)).toThrow();
    });

    test("devuelve NotInterested cuando no existe un bid", () => {
        const session = new Session();
        const article = paper();
        const candidate = reviewer("Reviewer", 1);

        expect(session.bidFor(article, candidate)).toBeUndefined();
        expect(session.bidExistsFor(article, candidate)).toBe(false);
        expect(session.interestOrDefaultFor(article, candidate))
            .toBe(Interests.NotInterested);

        session.submit(article);
        session.closeStage();
        session.enterBid(article, candidate, Interests.Maybe);

        expect(session.bidExistsFor(article, candidate)).toBe(true);
        expect(session.interestOrDefaultFor(article, candidate))
            .toBe(Interests.Maybe);
    });

    test("administra asignaciones mediante el comportamiento de Assignment", () => {
        const session = new Session();
        const article = paper();
        const candidate = reviewer("Reviewer", 1);
        const assignment = Assignment.create(article, candidate);

        session.addAssignment(assignment);

        expect(session.assignments()).toEqual([assignment]);
        expect(session.assignmentsForPaper(article)).toBe(1);
        expect(session.assignmentExistsFor(article, candidate)).toBe(true);
        expect(session.assignmentFor(article, candidate)).toBe(assignment);
    });

    test("considera reviewers sin bid con prioridad predeterminada", () => {
        const session = new Session();
        const article = paper();
        const reviewers = [
            reviewer("R1", 1),
            reviewer("R2", 2),
            reviewer("R3", 3)
        ];

        reviewers.forEach((candidate) => session.addReviewer(candidate));
        session.submit(article);
        session.closeStage();
        session.closeStage();
        session.assignReviewers();

        expect(session.assignmentsForPaper(article)).toBe(3);
        reviewers.forEach((candidate) =>
            expect(session.assignmentExistsFor(article, candidate)).toBe(true)
        );
    });
});
