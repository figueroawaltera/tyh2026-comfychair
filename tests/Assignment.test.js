const Assignment = require("../src/Assignment");
const Paper = require("../src/Paper");
const Reviewer = require("../src/Reviewer");
const User = require("../src/User");

const reviewer = (name, id) =>
    new Reviewer(name, "Universidad", `${id}@mail.com`, "pass");

describe("Assignment", () => {
    test("crea la relación y actualiza a sus participantes", () => {
        const author = new User("Autor", "Universidad", "author@mail.com", "pass");
        const paper = new Paper("Paper", [author], author);
        const candidate = reviewer("Reviewer", 1);

        const assignment = Assignment.create(paper, candidate);

        expect(assignment.matches(paper, candidate)).toBe(true);
        expect(assignment.isForPaper(paper)).toBe(true);
        expect(assignment.paper()).toBe(paper);
        expect(assignment.reviewer()).toBe(candidate);
        expect(paper.reviewersAssigned()).toBe(1);
        expect(candidate.papersAssigned()).toBe(1);
    });

    test("rechaza reviewers que no pueden revisar el paper", () => {
        const author = reviewer("Autor", 1);
        const paper = new Paper("Paper", [author], author);

        expect(() => Assignment.create(paper, author)).toThrow(
            "El reviewer no puede ser asignado a este paper"
        );
        expect(paper.reviewersAssigned()).toBe(0);
        expect(author.papersAssigned()).toBe(0);
    });
});
