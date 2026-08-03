const Session = require("../src/Session");
const Reviewer = require("../src/Reviewer");
const Paper = require("../src/Paper");
const { Interests } = require("../src/Bid");

function createValidPaper(title = "Paper válido") {
    const author = new Reviewer("Autor", "Universidad", "autor@mail.com", "pass");
    return {
        author,
        paper: new Paper(title, [author], author)
    };
}

describe("Session como contexto del patrón State", () => {
    it("delega la recepción de artículos al estado actual", () => {
        const session = new Session();
        const { paper } = createValidPaper();

        expect(session.canSubmit(paper)).toBe(true);
        session.submit(paper);

        expect(session.papers()).toContain(paper);
    });

    it("rechaza operaciones que no corresponden al estado actual", () => {
        const session = new Session();
        const { paper } = createValidPaper();
        const reviewer = new Reviewer("Revisor", "Universidad", "reviewer@mail.com", "pass");

        expect(() => session.enterBid(paper, reviewer, Interests.Interested)).toThrow();
        expect(() => session.enterAssigment(paper, reviewer)).toThrow();
        expect(() => session.enterReview(paper, reviewer, "Review", 2)).toThrow();
    });

    it("permite avanzar de recepción a bidding sin exponer el objeto estado", () => {
        const session = new Session();
        const { paper } = createValidPaper();
        const reviewer = new Reviewer("Revisor", "Universidad", "reviewer@mail.com", "pass");

        session.submit(paper);
        session.closeStage();
        session.enterBid(paper, reviewer, Interests.Interested);

        expect(session.bidExistsFor(paper, reviewer)).toBe(true);
        expect(session.interestFor(paper, reviewer)).toBe(Interests.Interested);
        expect(session.canSubmit(paper)).toBe(false);
        expect(() => session.submit(paper)).toThrow();
    });

    it("delega la asignación de revisores solamente durante assignment", () => {
        const session = new Session();
        const { author, paper } = createValidPaper();
        const reviewer1 = new Reviewer("Revisor 1", "Universidad", "r1@mail.com", "pass");
        const reviewer2 = new Reviewer("Revisor 2", "Universidad", "r2@mail.com", "pass");
        const reviewer3 = new Reviewer("Revisor 3", "Universidad", "r3@mail.com", "pass");

        session.addReviewer(reviewer1);
        session.addReviewer(reviewer2);
        session.addReviewer(reviewer3);
        session.addReviewer(author);

        session.submit(paper);
        session.closeStage();
        session.enterBid(paper, reviewer1, Interests.Interested);
        session.enterBid(paper, reviewer2, Interests.Interested);
        session.enterBid(paper, reviewer3, Interests.Maybe);
        session.closeStage();
        session.asignarRevisores();

        expect(session.assigmentExistsFor(paper, reviewer1)).toBe(true);
        expect(session.assigmentExistsFor(paper, reviewer2)).toBe(true);
        expect(session.assigmentExistsFor(paper, reviewer3)).toBe(true);
        expect(session.assigmentExistsFor(paper, author)).toBe(false);
    });

    it("delega el ingreso de reviews solamente durante revision", () => {
        const session = new Session();
        const { paper } = createValidPaper();
        const reviewer = new Reviewer("Revisor", "Universidad", "reviewer@mail.com", "pass");

        session.addReviewer(reviewer);
        session.submit(paper);
        session.closeStage();
        session.enterBid(paper, reviewer, Interests.Interested);
        session.closeStage();
        session.enterAssigment(paper, reviewer);
        session.closeStage();
        session.enterReview(paper, reviewer, "Buen trabajo", 2);

        expect(paper.reviews()).toHaveLength(1);
    });

    it("delega la selección de artículos solamente durante selection", () => {
        const session = new Session();
        const { paper } = createValidPaper();

        session.submit(paper);
        session.closeStage();
        session.closeStage();
        session.closeStage();
        session.closeStage();

        expect(session.obtenerArticulosOrdenadosPorScore()).toEqual([paper]);
        expect(session.obtenerArticulosAceptados()).toEqual(expect.any(Array));
    });
});
