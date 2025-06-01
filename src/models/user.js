const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Schema } = mongoose;

const userSchema = new Schema({
	firstName: {
		type: String,
		required: true,
		minLength: 3,
		maxLength: 50,
	},
	lastName: {
		type: String,
	},
	emailId: {
		type: String,
		required: [true, "Enter the email to save the user!!"],
		unique: [true, "Enter some unique email Id it is alredy begin used"],
		lowercase: true,
		trim: true,
		validate(value) {
			if (!validator.isEmail(value)) {
				throw new Error("Invalid email address: " + value);
			}
		},
	},
	password: {
		type: String,
		required: true,
		validate(value) {
			if (!validator.isStrongPassword(value)) {
				throw new Error("Enter a Strong Password: " + value);
			}
		},
	},
	age: {
		type: Number,
		min: 18,
	},
	gender: {
		type: String,
		validate(value) {
			if (!["male", "female", "others"].includes(value)) {
				throw new Error("Gender data is not valid")
			}
		}
	},
	photoUrl: {
		type: String,
		default: "https://www.pnrao.com/wp-content/uploads/2023/06/dummy-user-male.jpg",
		validate(value) {
			if (!validator.isURL(value)) {
				throw new Error("Invalid Photo URL: " + value);
			}
		},
	},
	about: {
		type: String,
		default: "About Me.....",
	},
	skills: {
		type: [String],
	}

}, { timestamps: true });

// Adding the methods which are directly related to user schema
userSchema.methods.getJWToken = async function () {
	const user = this;

	// Create a JWT token
	/*
	 *While creating the token we can hide some data in it 
	 *jwt.sign takes the data object and a secret key for it and returns a JWT token 
	 *Here we are passing userId as data and a dummy secret key with it 
	 */
	const token = await jwt.sign({ _id: user._id }, "jwtSecretKey", { expiresIn: "1d" });

	return token;
};

userSchema.methods.validatePassword =  async function (passwordByUser) {
	const user = this;
	const passwordHash = user.password;

	const isPasswordValid = await bcrypt.compare(passwordByUser, passwordHash);

	return isPasswordValid;
}

module.exports = mongoose.model("User", userSchema);