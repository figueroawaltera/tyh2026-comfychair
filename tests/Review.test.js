const Review = require("../src/Review");
const User = require("../src/User");

describe("Review", () => {
    let reviewer;
    let review;

    beforeEach(() => {
        reviewer = new User("User 1", "Uni 1", "u1@mail.com", "pass");
        review = new Review(reviewer, "Texto de review", 0);
    });

    test("reconoce al reviewer que la realizó", () => {
        const other = new User("User 2", "Uni 2", "u2@mail.com", "pass");

        expect(review.isFrom(reviewer)).toBe(true);
        expect(review.isFrom(other)).toBe(false);
    });

    test("valida y permite actualizar el score", () => {
        review.setScore(3);
        expect(review.score()).toBe(3);

        expect(() => review.setScore(4)).toThrow("Score no permitido");
        expect(() => new Review(reviewer, "Inválida", -4)).toThrow(
            "Score no permitido"
        );
    });

    test("permite actualizar el texto", () => {
        review.setReview("Nuevo texto");
        expect(review.text()).toBe("Nuevo texto");
    });
});
