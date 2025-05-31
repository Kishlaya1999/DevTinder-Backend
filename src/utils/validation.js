const validator = require("validator");

const validateSignUpData = (req) => {

    const {firstName, lastName, emailId, password} = req.body;

    if(!validator.isEmail(emailId)) {
        throw new Error("Email is not valid !!");
    } 

    if(!validator.isStrongPassword(password)) {
        throw new Error("Password needs to contain at least 8 characters which should include 1 uppercase, 1 lowercase, 1 symbol and 1 number");
    }

    /* Other validations..............*/

}

module.exports = {
    validateSignUpData
};