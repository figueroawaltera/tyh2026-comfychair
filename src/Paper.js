const Review = require("./Review");

class Paper {
    constructor(title, authors, correspondingAuthor) {
        if (!authors.includes(correspondingAuthor)) {
            throw new Error("Corresponding author must be an author");
        }

        this._title = title;
        this._reviews = [];
        this._authors = authors;
        this._correspondingAuthor = correspondingAuthor;
        this._accepted = false;
        this._reviewersAssigned = 0;
    }

    title() {
        return this._title;
    }

    authors() {
        return this._authors;
    }

    correspondingAuthor() {
        return this._correspondingAuthor;
    }

    reviews() {
        return this._reviews;
    }

    isValid() {
        return this._title !== "" && this._authors.length > 0;
    }

    hasAuthor(user) {
        return this._authors.includes(user);
    }

    hasAssignmentCapacity() {
        return this._reviewersAssigned < Paper.allowedReviews;
    }

    canBeReviewedBy(reviewer) {
        return Boolean(
            reviewer &&
            typeof reviewer.canAcceptAssignment === "function" &&
            this.hasAssignmentCapacity() &&
            reviewer.canAcceptAssignment() &&
            !this.hasAuthor(reviewer)
        );
    }

    assignReviewer(reviewer) {
        if (!this.canBeReviewedBy(reviewer)) {
            throw new Error("El reviewer no puede ser asignado a este paper.");
        }
        this._reviewersAssigned += 1;
    }

    reviewersAssigned() {
        return this._reviewersAssigned;
    }

    addReview(reviewer, review, score) {
        if (this.reviewsCount() >= Paper.allowedReviews) {
            throw new Error("Cannot allow any more reviews");
        }
        this._reviews.push(new Review(reviewer, review, score));
    }

    reviewsCount() {
        return this._reviews.length;
    }

    score() {
        if (this.reviewsCount() === 0) return 0;

        const sum = this._reviews.reduce(
            (partialSum, review) => partialSum + review.score(),
            0
        );
        return sum / this.reviewsCount();
    }

    finalScore() {
        let sum = this._reviews.reduce(
            (partialSum, review) => partialSum + review.score(),
            0
        );

        if (this.reviewsCount() < Paper.allowedReviews) {
            sum += (Paper.allowedReviews - this.reviewsCount()) * -3;
            return sum / Paper.allowedReviews;
        }

        return sum / this.reviewsCount();
    }

    reviewFor(reviewer) {
        return this._reviews.find((review) => review.isFrom(reviewer));
    }

    reviewExistsFor(reviewer) {
        return typeof this.reviewFor(reviewer) !== "undefined";
    }

    acceptPaper() {
        this._accepted = true;
    }

    declinePaper() {
        this._accepted = false;
    }

    isAccepted() {
        return this._accepted;
    }
}

Paper.allowedReviews = 3;

module.exports = Paper;
