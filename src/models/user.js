const mongoose = require("mongoose");
const validator = require("validator");
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

module.exports = mongoose.model("User", userSchema);