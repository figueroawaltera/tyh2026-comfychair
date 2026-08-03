const SessionStage = require("./SessionStage");
const RevisionStage = require("./RevisionStage");
const Assignment = require("../Assignment");
const { Bid, Interests } = require("../Bid");

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

        const assignment = Assignment.create(paper, reviewer);
        this._session.addAssignment(assignment);
        return assignment;
    }

    assignReviewers() {
        this._session.calculateWorkload();

        const candidates = this.candidatesForAssignment()
            .sort((a, b) => b.priority - a.priority);

        for (const { paper, reviewer, hasConflict } of candidates) {
            if (!hasConflict && paper.canBeReviewedBy(reviewer)) {
                this.enterAssignment(paper, reviewer);
            }
        }
    }

    candidatesForAssignment() {
        const candidates = [];

        this._session.papers().forEach((paper) => {
            this._session.programCommittee().forEach((reviewer) => {
                const bid = this._session.bidFor(paper, reviewer);

                candidates.push({
                    paper,
                    reviewer,
                    priority: bid
                        ? bid.priority()
                        : Bid.priorityFor(Interests.NotInterested),
                    hasConflict: bid ? bid.hasConflict() : false
                });
            });
        });

        return candidates;
    }
}

module.exports = AssignmentStage;
