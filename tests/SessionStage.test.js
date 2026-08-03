const SessionStage = require("../src/Stage/SessionStage");

describe("Comportamiento predeterminado de SessionStage", () => {
    let session;
    let stage;

    beforeEach(() => {
        session = {};
        stage = new SessionStage(session);
    });

    test("reconoce su contexto y no permite transiciones por defecto", () => {
        expect(stage.belongsTo(session)).toBe(true);
        expect(stage.belongsTo({})).toBe(false);
        expect(stage.canTransitionTo({})).toBe(false);
    });

    test("rechaza cerrar una etapa sin sucesor", () => {
        expect(() => stage.closeStage()).toThrow(
            "No existe una etapa siguiente"
        );
    });

    test("rechaza todas las operaciones no habilitadas", () => {
        expect(stage.canSubmit({})).toBe(false);
        expect(() => stage.submit({})).toThrow();
        expect(() => stage.enterBid({}, {}, {})).toThrow();
        expect(() => stage.enterAssignment({}, {})).toThrow();
        expect(() => stage.assignReviewers()).toThrow();
        expect(() => stage.enterReview({}, {}, "Review", 1)).toThrow();
        expect(() => stage.obtenerArticulosOrdenadosPorScore()).toThrow();
        expect(() => stage.obtenerArticulosAceptados()).toThrow();
    });
});
