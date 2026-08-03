const { Interests } = require("./Bid");
const SessionStage = require("./Stage/SessionStage");
const ReceivingStage = require("./Stage/ReceivingStage");
const AcceptanceByPercentage = require("./policies/AcceptanceByPercentage");

class Session {
    constructor() {
        this._name = "";
        this._programCommittee = [];
        this._papers = [];
        this._bids = [];
        this._assignments = [];
        this._stage = new ReceivingStage(this);
        this._acceptancePercentage = 0;
        this._acceptancePolicy = new AcceptanceByPercentage();
    }

    name() { return this._name; }
    programCommittee() { return this._programCommittee; }
    papers() { return this._papers; }
    bids() { return this._bids; }
    assignments() { return this._assignments; }

    /** @deprecated Usar acceptancePolicy().percentage() en su lugar. */
    acceptancePercentage() { return this._acceptancePercentage; }

    acceptancePolicy() { return this._acceptancePolicy; }

    transitionTo(nextStage, requestedBy) {
        if (requestedBy !== this._stage) {
            throw new Error(
                "La transición solo puede ser solicitada por el estado actual."
            );
        }

        if (!(nextStage instanceof SessionStage)) {
            throw new Error("El destino debe ser un estado válido de Session.");
        }

        if (!nextStage.belongsTo(this)) {
            throw new Error("El estado de destino pertenece a otra sesión.");
        }

        if (!this._stage.canTransitionTo(nextStage)) {
            throw new Error(
                `Transición no permitida: ${this._stage.constructor.name} → ` +
                `${nextStage.constructor.name}`
            );
        }

        this._stage = nextStage;
    }

    closeStage() {
        this._stage.closeStage();
    }

    canSubmit(paper) { return this._stage.canSubmit(paper); }
    submit(paper) { return this._stage.submit(paper); }

    enterBid(paper, reviewer, interest) {
        return this._stage.enterBid(paper, reviewer, interest);
    }

    enterAssignment(paper, reviewer) {
        return this._stage.enterAssignment(paper, reviewer);
    }

    assignReviewers() {
        return this._stage.assignReviewers();
    }

    enterReview(paper, reviewer, review, score) {
        return this._stage.enterReview(paper, reviewer, review, score);
    }

    obtenerArticulosOrdenadosPorScore() {
        return this._stage.obtenerArticulosOrdenadosPorScore();
    }

    obtenerArticulosAceptados() {
        return this._stage.obtenerArticulosAceptados();
    }

    /** @deprecated Usar setAcceptancePolicy() con una instancia de AcceptanceByPercentage en su lugar. */
    setAcceptancePercentage(percentage) {
        if (percentage < 0 || percentage > 100) {
            throw new Error("El porcentaje de aceptación debe estar entre 0 y 100.");
        }
        this._acceptancePercentage = percentage;
        this._acceptancePolicy.setPercentage(percentage);
    }

    setAcceptancePolicy(policy) {
        this._acceptancePolicy = policy;
    }

    addReviewer(user) {
        this._programCommittee.push(user);
    }

    addAssignment(assignment) {
        this._assignments.push(assignment);
    }

    assignmentsForPaper(paper) {
        return this._assignments.filter(
            (assignment) => assignment.isForPaper(paper)
        ).length;
    }

    bidExistsFor(paper, reviewer) {
        return typeof this.bidFor(paper, reviewer) !== "undefined";
    }

    bidFor(paper, reviewer) {
        return this._bids.find((bid) => bid.matches(paper, reviewer));
    }

    interestFor(paper, reviewer) {
        return this.bidFor(paper, reviewer).interest();
    }

    interestOrDefaultFor(paper, reviewer) {
        if (this.bidExistsFor(paper, reviewer)) {
            return this.interestFor(paper, reviewer);
        }
        return Interests.NotInterested;
    }

    assignmentExistsFor(paper, reviewer) {
        return typeof this.assignmentFor(paper, reviewer) !== "undefined";
    }

    assignmentFor(paper, reviewer) {
        return this._assignments.find(
            (assignment) => assignment.matches(paper, reviewer)
        );
    }

    calculateWorkload() {
        const totalPapers = this.papers().length;
        const totalReviewers = this.programCommittee().length;
        const totalReviews = 3 * totalPapers;
        const baseWorkload = Math.floor(totalReviews / totalReviewers);
        const remainingReviews = totalReviews % totalReviewers;

        this.programCommittee().forEach((reviewer, index) => {
            const workload = baseWorkload + (index < remainingReviews ? 1 : 0);
            reviewer.setWorkload(workload);
        });
    }

    cantidadArticulosAAceptar() {
        return this._acceptancePolicy.calcularCantidadAAceptar(this._papers.length);
    }
}

module.exports = Session;
