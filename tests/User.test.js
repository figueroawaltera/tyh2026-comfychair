const User = require("../src/User");
const crypto = require("crypto");

describe("User", () => {
    test("almacena la clave encriptada", () => {
        const user = new User(
            "Juan Gardey", "LIFIA, UNLP", "jgardey@lifia.ar", "123"
        );
        const expectedHash = crypto
            .createHash("sha256")
            .update("123")
            .digest("base64");

        expect(user.getEncryptedPassword()).toBe(expectedHash);
    });

    test("no contiene comportamiento exclusivo de Reviewer", () => {
        const user = new User("User", "Universidad", "user@mail.com", "pass");

        expect(user.assignPaper).toBeUndefined();
        expect(user.papersAssigned).toBeUndefined();
        expect(user.canAcceptAssignment).toBeUndefined();
        expect(user.setWorkload).toBeUndefined();
    });
});
