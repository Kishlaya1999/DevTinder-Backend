const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error("Name is not valid!");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid!");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong Password!");
  }
};

const validateEditProfileData = (req) => {

    /**
     * This function checks if the user is trying to change any field 
     * that should not be allowed to change later (such as email).
     * It also checks if the user is trying to send any invalid fields.
     */

	const allowedEditFields = [
		"firstName",
		"lastName",
		"photoUrl",
		"gender",
		"age",
		"about",
		"skills",
	];
	const isEditAllowed = Object.keys(req.body).every((field) =>
		allowedEditFields.includes(field)
	);

    return isEditAllowed; // Returns true if all fields are allowed, false otherwise
};

const validatePasswordStrenght = (req) => {
	const { updatedPassword } = req.body;
	return validator.isStrongPassword(updatedPassword);
}

module.exports = {
	validateSignUpData,
	validateEditProfileData,
	validatePasswordStrenght,
};