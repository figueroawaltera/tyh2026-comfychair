const Interests = {
    Interested: Symbol("Interested"),
    Maybe: Symbol("Maybe"),
    NotInterested: Symbol("NotInterested"),
    Conflict: Symbol("Conflict")
};

class Bid {
    constructor(paper, reviewer, interest) {
        this._paper = paper;
        this._reviewer = reviewer;
        this._interest = interest;
    }

    static priorityFor(interest) {
        if (interest === Interests.Interested) return 2;
        if (interest === Interests.Maybe) return 1;
        return 0;
    }

    matches(paper, reviewer) {
        return this._paper === paper && this._reviewer === reviewer;
    }

    priority() {
        return Bid.priorityFor(this._interest);
    }

    hasConflict() {
        return this._interest === Interests.Conflict;
    }

    paper() {
        return this._paper;
    }

    reviewer() {
        return this._reviewer;
    }

    interest() {
        return this._interest;
    }

    setInterest(interest) {
        this._interest = interest;
    }
}

module.exports = { Bid, Interests };
