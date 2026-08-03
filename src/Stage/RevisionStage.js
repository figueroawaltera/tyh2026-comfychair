const SessionStage = require("./SessionStage");
const SelectionStage = require("./SelectionStage");

class RevisionStage extends SessionStage {
    closeStage() {
        this._Session._changeStage(new SelectionStage(this._Session));
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
