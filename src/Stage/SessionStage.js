class SessionStage {
    constructor(session) {
        this._session = session;
    }

    belongsTo(session) {
        return this._session === session;
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

    enterAssignment(paper, reviewer) {
        throw new Error("Cannot assign reviewers from the current stage.");
    }

    assignReviewers() {
        throw new Error("Cannot assign reviewers from the current stage.");
    }

    enterReview(paper, reviewer, review, score) {
        throw new Error("Cannot enter review from the current stage.");
    }

    obtenerArticulosOrdenadosPorScore() {
        throw new Error("Cannot return sorted papers from the current stage.");
    }

    obtenerArticulosAceptados() {
        throw new Error("Cannot return accepted papers from the current stage.");
    }
}

module.exports = SessionStage;
