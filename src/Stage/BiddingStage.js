const SessionStage = require("./SessionStage");
const AssignmentStage = require("./AssignmentStage");
const { Bid } = require("../Bid");

class BiddingStage extends SessionStage {
    canTransitionTo(nextStage) {
        return nextStage instanceof AssignmentStage;
    }

    closeStage() {
        this._session.transitionTo(new AssignmentStage(this._session), this);
    }

    enterBid(paper, reviewer, interest) {
        if (this._session.bidExistsFor(paper, reviewer)) {
            const existingBid = this._session.bidFor(paper, reviewer);
            existingBid.setInterest(interest);
        } else {
            this._session.bids().push(new Bid(paper, reviewer, interest));
        }
    }
}

module.exports = BiddingStage;
