const SessionStage = require("./SessionStage");
const RevisionStage = require("./RevisionStage");
const Assignment = require("../Assignment");
const { Interests } = require("../Bid");

class AssignmentStage extends SessionStage {
    canTransitionTo(nextStage) {
        return nextStage instanceof RevisionStage;
    }

    closeStage() {
        this._session.transitionTo(new RevisionStage(this._session), this);
    }

    enterAssignment(paper, reviewer) {
        if (this._session.assignmentExistsFor(paper, reviewer)) {
            throw new Error(
                "La asignación ya existe para el par (paper, reviewer)."
            );
        }

        paper.addReviewerAssigned();
        reviewer.setPapersAssigned();
        this._session.assignments().push(new Assignment(paper, reviewer));
    }

    assignReviewers() {
        this._session.calculateWorkload();

        const candidates = this.candidatesForAssignment()
            .sort((a, b) => b.interestPriority - a.interestPriority);

        for (const { paper, reviewer } of candidates) {
            if (
                paper.getReviewersAssigned() < 3 &&
                reviewer.acceptPapers() &&
                !reviewer.isAuthor(paper.authors())
            ) {
                this.enterAssignment(paper, reviewer);
            }
        }
    }

    interestPriority(interest) {
        if (interest === Interests.Interested) return 2;
        if (interest === Interests.Maybe) return 1;
        return 0;
    }

    candidatesForAssignment() {
        const candidates = [];

        this._session.papers().forEach((paper) => {
            this._session.programCommittee().forEach((reviewer) => {
                candidates.push({
                    paper,
                    reviewer,
                    interestPriority: this.interestPriority(
                        this._session.interestOrDefaultFor(paper, reviewer)
                    )
                });
            });
        });

        return candidates;
    }
}

module.exports = AssignmentStage;
