const SessionStage = require("./SessionStage");
const SelectionStage = require("./SelectionStage");

class RevisionStage extends SessionStage {
    canTransitionTo(nextStage) {
        return nextStage instanceof SelectionStage;
    }

    closeStage() {
        this._Session.transitionTo(new SelectionStage(this._Session), this);
    }

    enterReview(paper, reviewer, review, score) {
        if (!this._Session.assigmentExistsFor(paper, reviewer)) {
            throw new Error("Reviewer no autorizado.");
        }

        if (paper.reviewExistsFor(reviewer)) {
            throw new Error("El reviewer ya ingreso una review para este paper.");
        }

        paper.addReview(reviewer, review, score);
    }
}

module.exports = RevisionStage;
