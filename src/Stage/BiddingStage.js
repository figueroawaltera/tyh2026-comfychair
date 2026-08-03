const SessionStage = require("./SessionStage");
const AssigmentStage = require("./AssigmentStage");
const { Bid } = require("../Bid");

class BiddingStage extends SessionStage {
    canTransitionTo(nextStage) {
        return nextStage instanceof AssigmentStage;
    }

    closeStage() {
        this._Session.transitionTo(new AssigmentStage(this._Session), this);
    }

    enterBid(paper, reviewer, interest) {
        if (this._Session.bidExistsFor(paper, reviewer)) {
            const existing = this._Session.bidFor(paper, reviewer);
            existing.setInterest(interest);
        } else {
            this._Session.bids().push(new Bid(paper, reviewer, interest));
        }
    }
}

module.exports = BiddingStage;
