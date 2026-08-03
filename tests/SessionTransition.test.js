const Session = require("../src/Session");
const ReceivingStage = require("../src/Stage/ReceivingStage");
const BiddingStage = require("../src/Stage/BiddingStage");
const AssignmentStage = require("../src/Stage/AssignmentStage");
const RevisionStage = require("../src/Stage/RevisionStage");
const SelectionStage = require("../src/Stage/SelectionStage");

describe("Transiciones de Session", () => {
    test("permite recorrer únicamente el flujo lineal de estados", () => {
        const session = new Session();

        expect(session._stage).toBeInstanceOf(ReceivingStage);

        session.closeStage();
        expect(session._stage).toBeInstanceOf(BiddingStage);

        session.closeStage();
        expect(session._stage).toBeInstanceOf(AssignmentStage);

        session.closeStage();
        expect(session._stage).toBeInstanceOf(RevisionStage);

        session.closeStage();
        expect(session._stage).toBeInstanceOf(SelectionStage);
    });

    test("rechaza saltar etapas y conserva el estado actual", () => {
        const session = new Session();
        const currentStage = session._stage;

        expect(() =>
            session.transitionTo(new RevisionStage(session), currentStage)
        ).toThrow("Transición no permitida");

        expect(session._stage).toBe(currentStage);
    });

    test("rechaza retroceder a una etapa anterior", () => {
        const session = new Session();
        session.closeStage();
        const currentStage = session._stage;

        expect(() =>
            session.transitionTo(new ReceivingStage(session), currentStage)
        ).toThrow("Transición no permitida");

        expect(session._stage).toBe(currentStage);
    });

    test("rechaza destinos que no son estados de Session", () => {
        const session = new Session();
        const currentStage = session._stage;

        expect(() =>
            session.transitionTo({}, currentStage)
        ).toThrow("El destino debe ser un estado válido de Session");

        expect(session._stage).toBe(currentStage);
    });

    test("rechaza estados creados para otra sesión", () => {
        const session = new Session();
        const otherSession = new Session();
        const currentStage = session._stage;

        expect(() =>
            session.transitionTo(new BiddingStage(otherSession), currentStage)
        ).toThrow("El estado de destino pertenece a otra sesión");

        expect(session._stage).toBe(currentStage);
    });

    test("solo el estado actual puede solicitar una transición", () => {
        const session = new Session();
        const stateThatWasNeverCurrent = new ReceivingStage(session);
        const currentStage = session._stage;

        expect(() =>
            session.transitionTo(
                new BiddingStage(session),
                stateThatWasNeverCurrent
            )
        ).toThrow("La transición solo puede ser solicitada por el estado actual");

        expect(session._stage).toBe(currentStage);
    });

    test("un estado anterior no puede modificar la sesión", () => {
        const session = new Session();
        const previousStage = session._stage;

        session.closeStage();
        const currentStage = session._stage;

        expect(() => previousStage.closeStage()).toThrow(
            "La transición solo puede ser solicitada por el estado actual"
        );

        expect(session._stage).toBe(currentStage);
    });

    test("la etapa de selección es terminal", () => {
        const session = new Session();

        session.closeStage();
        session.closeStage();
        session.closeStage();
        session.closeStage();
        const selectionStage = session._stage;

        expect(() => session.closeStage()).toThrow(
            "La sesión ya se encuentra en la etapa final de selección"
        );

        expect(session._stage).toBe(selectionStage);
    });
});
