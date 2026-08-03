class Review {
    constructor(reviewer, text, score) {
        this._reviewer = reviewer;
        this._text = text;
        this._score = Review.validateScore(score);
    }

    static validateScore(score) {
        if (score < -3 || score > 3) {
            throw new Error("Score no permitido.");
        }
        return score;
    }

    isFrom(reviewer) {
        return this._reviewer === reviewer;
    }

    reviewer() {
        return this._reviewer;
    }

    text() {
        return this._text;
    }

    score() {
        return this._score;
    }

    setScore(score) {
        this._score = Review.validateScore(score);
    }

    setReview(text) {
        this._text = text;
    }
}

module.exports = Review;
