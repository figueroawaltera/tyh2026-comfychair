class Assignment {
    constructor(paper, reviewer) {
        this._paper = paper;
        this._reviewer = reviewer;
    }

    paper() {
        return this._paper;
    }

    reviewer() {
        return this._reviewer;
    }
}

module.exports = Assignment;
