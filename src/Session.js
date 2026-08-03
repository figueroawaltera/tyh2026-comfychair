const { Interests } = require("./Bid");
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

    _changeStage(stage) {
        this._stage = stage;
    }

    closeStage() {
        this._stage.closeStage();
    }

    canSubmit(paper) { return this._stage.canSubmit(paper); }
    submit(paper) { return this._stage.submit(paper); }
    enterBid(paper, reviewer, interest) {
        return this._stage.enterBid(paper, reviewer, interest);
    }
    enterAssigment(paper, reviewer) {
        return this._stage.enterAssigment(paper, reviewer);
    }
    asignarRevisores() { return this._stage.asignarRevisores(); }
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
        if (percentage < 0 || percentage > 100)
            throw new Error("El porcentaje de aceptación debe estar entre 0 y 100.");
        this._acceptancePercentage = percentage;
        this._acceptancePolicy.setPercentage(percentage);
    }

    setAcceptancePolicy(policy) {
        this._acceptancePolicy = policy;
    }

    addReviewer(user) {
        this._programCommittee.push(user);
    }

    assigmentsPapers(paper) {
        let nCantAssigment = 0;
        for (let i = 0; i < this._assignments.length; i++) {
            if (this._assignments[i].paper() == paper) nCantAssigment += 1;
        }
        return nCantAssigment;
    }

    bidExistsFor(paper, reviewer) {
        return typeof(this.bidFor(paper, reviewer)) != "undefined";
    }

    bidFor(paper, reviewer) {
        return this._bids.find(
            (suspect) => suspect.paper() == paper && suspect.reviewer() == reviewer
        );
    }

    interestFor(paper, reviewer) {
        return this.bidFor(paper, reviewer).interest();
    }

    interestOrDefaultFor(paper, reviewer) {
        if (this.bidExistsFor(paper, reviewer))
            return this.interestFor(paper, reviewer);
        return Interests.NotInterested;
    }

    assigmentExistsFor(paper, reviewer) {
        return typeof(this.assigmentFor(paper, reviewer)) != "undefined";
    }

    assigmentFor(paper, reviewer) {
        return this._assignments.find(
            (suspect) => suspect.paper() == paper && suspect.reviewer() == reviewer
        );
    }

    calculateWorkload() {
        const totalArticulos = this.papers().length;
        const totalRevisores = this.programCommittee().length;
        const totalRevisiones = 3 * totalArticulos;
        const base = Math.floor(totalRevisiones / totalRevisores);
        const resto = totalRevisiones % totalRevisores;

        this.programCommittee().forEach((reviewer, index) => {
            const workload = base + (index < resto ? 1 : 0);
            reviewer.setWorkload(workload);
        });
    }

    cantidadArticulosAAceptar() {
        return this._acceptancePolicy.calcularCantidadAAceptar(this._papers.length);
    }

    interestPriority(interest) {
        if (interest === Interests.Interested) return 2;
        if (interest === Interests.Maybe) return 1;
        return 0;
    }

    candidatesForAssignment() {
        const candidates = [];

        this.papers().forEach((paper) => {
            this.programCommittee().forEach((reviewer) => {
                candidates.push({
                    paper,
                    reviewer,
                    interest: this.interestPriority(
                        this.interestOrDefaultFor(paper, reviewer)
                    )
                });
            });
        });

        return candidates;
    }
}

module.exports = Session;
