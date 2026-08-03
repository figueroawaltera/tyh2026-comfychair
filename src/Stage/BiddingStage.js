const SessionStage = require("./SessionStage");
const AssigmentStage = require("./AssigmentStage");
const { Bid } = require("../Bid");

class BiddingStage extends SessionStage {
    closeStage() {
        this._Session._changeStage(new AssigmentStage(this._Session));
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
