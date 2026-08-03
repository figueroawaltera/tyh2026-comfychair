const { Bid, Interests } = require("../src/Bid");
const Paper = require("../src/Paper");
const Reviewer = require("../src/Reviewer");
const User = require("../src/User");

describe("Bid", () => {
    const buildBid = (interest = Interests.Interested) => {
        const author = new User("Autor", "Universidad", "author@mail.com", "pass");
        const reviewer = new Reviewer(
            "Reviewer", "Universidad", "reviewer@mail.com", "pass"
        );
        const paper = new Paper("Paper", [author], author);

        return { bid: new Bid(paper, reviewer, interest), paper, reviewer };
    };

    test("expone los participantes y el interés del bid", () => {
        const { bid, paper, reviewer } = buildBid(Interests.Maybe);

        expect(bid.paper()).toBe(paper);
        expect(bid.reviewer()).toBe(reviewer);
        expect(bid.interest()).toBe(Interests.Maybe);
    });

    test("reconoce la pareja paper-reviewer que representa", () => {
        const { bid, paper, reviewer } = buildBid();

        expect(bid.matches(paper, reviewer)).toBe(true);
        expect(bid.matches(paper, new Reviewer("Otro", "U", "o@mail.com", "p")))
            .toBe(false);
    });

    test("calcula la prioridad según el interés", () => {
        expect(buildBid(Interests.Interested).bid.priority()).toBe(2);
        expect(buildBid(Interests.Maybe).bid.priority()).toBe(1);
        expect(buildBid(Interests.NotInterested).bid.priority()).toBe(0);
        expect(buildBid(Interests.Conflict).bid.priority()).toBe(0);
    });

    test("identifica conflictos y permite actualizar el interés", () => {
        const { bid } = buildBid(Interests.Conflict);

        expect(bid.hasConflict()).toBe(true);

        bid.setInterest(Interests.Maybe);

        expect(bid.hasConflict()).toBe(false);
        expect(bid.interest()).toBe(Interests.Maybe);
        expect(bid.priority()).toBe(1);
    });
});
