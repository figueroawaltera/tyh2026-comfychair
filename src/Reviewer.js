const User = require("./User");

class Reviewer extends User {
    constructor(fullName, affiliation, email, password) {
        super(fullName, affiliation, email, password);
        this._papersAssigned = 0;
        this._workload = 1;
    }

    setWorkload(workload) {
        if (!Number.isInteger(workload) || workload < 0) {
            throw new Error("La carga de revisiones debe ser un entero no negativo.");
        }
        this._workload = Math.max(1, workload);
    }

    workload() {
        return this._workload;
    }

    canAcceptAssignment() {
        return this._papersAssigned < this._workload;
    }

    assignPaper() {
        if (!this.canAcceptAssignment()) {
            throw new Error("El reviewer alcanzó su carga máxima.");
        }
        this._papersAssigned += 1;
    }

    papersAssigned() {
        return this._papersAssigned;
    }
}

module.exports = Reviewer;
