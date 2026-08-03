const crypto = require("crypto");

class User {
    constructor(fullName, affiliation, email, password) {
        const hash = crypto.createHash("sha256");
        this.fullName = fullName;
        this.affiliation = affiliation;
        this.email = email;
        this.encryptedPassword = hash.update(password).digest("base64");
    }

    getEncryptedPassword() {
        return this.encryptedPassword;
    }
}

module.exports = User;
