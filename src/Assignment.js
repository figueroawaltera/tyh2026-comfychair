class Assignment {
    constructor(paper, reviewer) {
        this._paper = paper;
        this._reviewer = reviewer;
    }

    static create(paper, reviewer) {
        paper.assignReviewer(reviewer);
        reviewer.assignPaper();
        return new Assignment(paper, reviewer);
    }

    matches(paper, reviewer) {
        return this._paper === paper && this._reviewer === reviewer;
    }

    isForPaper(paper) {
        return this._paper === paper;
    }

    paper() {
        return this._paper;
    }

    reviewer() {
        return this._reviewer;
    }
}

module.exports = Assignment;
