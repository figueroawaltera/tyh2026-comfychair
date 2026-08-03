const SessionStage = require("./SessionStage");
const SelectionStage = require("./SelectionStage");

class RevisionStage extends SessionStage {
    canTransitionTo(nextStage) {
        return nextStage instanceof SelectionStage;
    }

    closeStage() {
        this._session.transitionTo(new SelectionStage(this._session), this);
    }

    enterReview(paper, reviewer, review, score) {
        if (!this._session.assignmentExistsFor(paper, reviewer)) {
            throw new Error("Reviewer no autorizado.");
        }

        if (paper.reviewExistsFor(reviewer)) {
            throw new Error("El reviewer ya ingresó una review para este paper.");
        }

        paper.addReview(reviewer, review, score);
    }
}

module.exports = RevisionStage;
