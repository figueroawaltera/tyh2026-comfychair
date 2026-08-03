const AcceptancePolicy = require("../src/policies/AcceptancePolicy");
const AcceptanceByCount = require("../src/policies/AcceptanceByCount");
const AcceptanceByPercentage = require("../src/policies/AcceptanceByPercentage");
const AcceptanceByScoreThreshold = require(
    "../src/policies/AcceptanceByScoreThreshold"
);
const Paper = require("../src/Paper");
const Reviewer = require("../src/Reviewer");
const User = require("../src/User");

function scoredPaper(title, score) {
    const author = new User(
        `${title} Autor`, "Universidad", `${title}@author.com`, "pass"
    );
    const article = new Paper(title, [author], author);

    for (let index = 0; index < 3; index++) {
        const reviewer = new Reviewer(
            `${title} R${index}`,
            "Universidad",
            `${title}-${index}@reviewer.com`,
            "pass"
        );
        article.addReview(reviewer, `Review ${index}`, score);
    }

    return article;
}

describe("AcceptancePolicy", () => {
    test("obliga a implementar la selección", () => {
        const policy = new AcceptancePolicy();

        expect(() => policy.seleccionarArticulos([])).toThrow("Método abstracto");
    });

    test("ordena por score, conserva empates y filtra aceptados", () => {
        const policy = new AcceptancePolicy();
        const high = scoredPaper("High", 2);
        const low = scoredPaper("Low", 0);
        const tied = scoredPaper("Tied", 2);

        expect(policy.ordenarArticulosPorScore([low, high])).toEqual([high, low]);
        expect(policy.ordenarArticulosPorScore([high, tied]))
            .toEqual([high, tied]);

        high.acceptPaper();
        expect(policy.obtenerAceptados([high, low])).toEqual([high]);
    });
});

describe("AcceptanceByCount", () => {
    test("expone el límite y acepta solo la cantidad configurada", () => {
        const policy = new AcceptanceByCount(1);
        const high = scoredPaper("High", 3);
        const low = scoredPaper("Low", 0);

        expect(policy.maxCount()).toBe(1);
        expect(policy.seleccionarArticulos([low, high])).toEqual([high]);
        expect(high.isAccepted()).toBe(true);
        expect(low.isAccepted()).toBe(false);
    });
});

describe("AcceptanceByPercentage", () => {
    test("expone y valida el porcentaje", () => {
        const policy = new AcceptanceByPercentage();

        expect(policy.percentage()).toBe(0);
        policy.setPercentage(50);
        expect(policy.percentage()).toBe(50);
        expect(policy.calcularCantidadAAceptar(5)).toBe(2);
        expect(() => policy.setPercentage(-1)).toThrow();
        expect(() => policy.setPercentage(101)).toThrow();
    });

    test("respeta el cupo y el score mínimo", () => {
        const byQuota = new AcceptanceByPercentage();
        const papersByQuota = [
            scoredPaper("A", 3),
            scoredPaper("B", 2),
            scoredPaper("C", 1),
            scoredPaper("D", 0)
        ];
        byQuota.setPercentage(50);

        expect(byQuota.seleccionarArticulos(papersByQuota))
            .toEqual(papersByQuota.slice(0, 2));

        const byScore = new AcceptanceByPercentage();
        const high = scoredPaper("E", 2);
        const low = scoredPaper("F", 0);
        byScore.setPercentage(100);

        expect(byScore.seleccionarArticulos([high, low])).toEqual([high]);
    });
});

describe("AcceptanceByScoreThreshold", () => {
    test("expone el umbral y acepta únicamente papers que lo alcanzan", () => {
        const policy = new AcceptanceByScoreThreshold(1.5);
        const high = scoredPaper("High", 2);
        const low = scoredPaper("Low", 1);

        expect(policy.threshold()).toBe(1.5);
        expect(policy.seleccionarArticulos([low, high])).toEqual([high]);
        expect(high.isAccepted()).toBe(true);
        expect(low.isAccepted()).toBe(false);
    });
});
