class SessionStage {
    constructor(session) {
        this._Session = session;
    }

    belongsTo(session) {
        return this._Session === session;
    }

    canTransitionTo(nextStage) {
        return false;
    }

    closeStage() {
        throw new Error("No existe una etapa siguiente para el estado actual.");
    }

    canSubmit(paper) {
        return false;
    }

    submit(paper) {
        throw new Error("Cannot submit papers at this stage");
    }

    enterBid(paper, reviewer, interest) {
        throw new Error("Cannot enter bids from the current stage.");
    }

    enterAssigment(paper, reviewer) {
        throw new Error("Cannot assigment from the current stage.");
    }

    asignarRevisores() {
        throw new Error("Cannot assigment from the current stage.");
    }

    enterReview(paper, reviewer, review, score) {
        throw new Error("Cannot enter review from the current stage.");
    }

    obtenerArticulosOrdenadosPorScore() {
        throw new Error("Cannot return sort papers from the current stage.");
    }

    obtenerArticulosAceptados() {
        throw new Error("Cannot return accepted papers from the current stage.");
    }
}

module.exports = SessionStage;
