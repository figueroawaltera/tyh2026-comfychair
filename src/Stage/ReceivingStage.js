const SessionStage = require("./SessionStage");
const BiddingStage = require("./BiddingStage");

class ReceivingStage extends SessionStage {
    canTransitionTo(nextStage) {
        return nextStage instanceof BiddingStage;
    }

    canSubmit(paper) {
        return paper.isValid();
    }

    submit(paper) {
        if (!this.canSubmit(paper)) throw new Error("Cannot submit invalid paper");
        this._Session.papers().push(paper);
    }

    closeStage() {
        this._Session.transitionTo(new BiddingStage(this._Session), this);
    }
}

module.exports = ReceivingStage;
