const SessionStage = require("./SessionStage");
const RevisionStage = require("./RevisionStage");
const Assigment = require("../Assigment");

class AssigmentStage extends SessionStage {
    canTransitionTo(nextStage) {
        return nextStage instanceof RevisionStage;
    }

    closeStage() {
        this._Session.transitionTo(new RevisionStage(this._Session), this);
    }

    enterAssigment(paper, reviewer) {
        if (this._Session.assigmentExistsFor(paper, reviewer)) {
            throw new Error(
                "Asignación ya existe para el par (paper,reviewer) ingresado."
            );
        }

        paper.addReviewerAssigned();
        reviewer.setPapersAssigned();
        this._Session.assignments().push(new Assigment(paper, reviewer));
    }

    asignarRevisores() {
        this._Session.calculateWorkload();
        const candidates = this._Session.candidatesForAssignment()
            .sort((a, b) => b.interest - a.interest);

        for (const { paper, reviewer } of candidates) {
            if (
                paper.getReviewersAssigned() < 3 &&
                reviewer.acceptPapers() &&
                !reviewer.isAuthor(paper.authors())
            ) {
                this.enterAssigment(paper, reviewer);
            }
        }
    }
}

module.exports = AssigmentStage;
