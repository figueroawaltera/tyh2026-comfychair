const SessionStage = require("./SessionStage");
const BiddingStage = require("./BiddingStage");

class ReceivingStage extends SessionStage {
    canSubmit(paper) {
        return paper.isValid();
    }

    submit(paper) {
        if (!this.canSubmit(paper)) throw new Error("Cannot submit invalid paper");
        this._Session.papers().push(paper);
    }

    closeStage() {
        this._Session._changeStage(new BiddingStage(this._Session));
    }
}

module.exports = ReceivingStage;
