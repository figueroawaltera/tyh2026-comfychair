const Reviewer = require("../src/Reviewer");

describe("Reviewer", () => {
    test("administra su propia carga y cantidad de papers", () => {
        const reviewer = new Reviewer(
            "Reviewer", "Universidad", "reviewer@mail.com", "pass"
        );

        reviewer.setWorkload(2);

        expect(reviewer.workload()).toBe(2);
        expect(reviewer.papersAssigned()).toBe(0);
        expect(reviewer.canAcceptAssignment()).toBe(true);

        reviewer.assignPaper();
        reviewer.assignPaper();

        expect(reviewer.papersAssigned()).toBe(2);
        expect(reviewer.canAcceptAssignment()).toBe(false);
        expect(() => reviewer.assignPaper()).toThrow(
            "El reviewer alcanzó su carga máxima"
        );
    });

    test("rechaza cargas inválidas y mantiene al menos una asignación", () => {
        const reviewer = new Reviewer(
            "Reviewer", "Universidad", "reviewer@mail.com", "pass"
        );

        reviewer.setWorkload(0);
        expect(reviewer.workload()).toBe(1);

        expect(() => reviewer.setWorkload(-1)).toThrow();
        expect(() => reviewer.setWorkload(1.5)).toThrow();
    });
});
