const express = require("express");
const {validateEditProfileData, validatePasswordStrenght} = require("../utils/validation");
const profileRouter = express.Router();
const User = require("../models/user"); 
const bcrypt = require("bcrypt");

const {userAuth} = require("../middleware/auth");

// Route to view the current user's profile
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    // Send the authenticated user's data as the response
    res.send(req?.user);
  } catch (error) {
    // Handle errors and send a 500 response with the error message
    res.status(500).send(error.message)
  }
});

// Route to edit the current user's profile
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    // Validate if the fields being edited are allowed
    const isEditAllowed = validateEditProfileData(req);
    if(!isEditAllowed) {
      // If not allowed, throw an error
      throw new Error("Some of the field are not allowed to edit");
    }

    // Get the currently logged-in user from the request
    const loggedInUser = req.user;
    // Update the user's fields with the new values from the request body
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    // Save the updated user object to the database
    await loggedInUser.save();

    // Send a success response with the updated user data
    res.json({
      message: `${loggedInUser.firstName}, your profile updated successfuly`,
      data: loggedInUser,
    });
  } catch (error) {
    // Handle errors and send a 500 response with the error message
    res.status(500).send(error.message);
  }
});

profileRouter.patch("/profile/edit/password", userAuth, async (req, res) => {
  try {
    // Validate the strength of the new password using a utility function
    const isPasswordStrong = validatePasswordStrenght(req);

    // If the password is not strong, throw an error with a descriptive message
    if(!isPasswordStrong) {
      throw new Error("Enter the strong passowrd! [A strong passwod must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number and 1 symbol]");
    }

    // Destructure current and updated passwords from the request body
    const {currentPassword, updatedPassword} = req.body;
    // Get the currently logged-in user from the request (set by userAuth middleware)
    const loggedInUser = req.user;

    // Validate the current password using the user's method
    const isCurrentPasswordValid = loggedInUser.validatePassword(currentPassword);

    // If the current password is invalid, throw an error
    if(!isCurrentPasswordValid) {
      throw new Error("Enter the valid current Password");
    }
    
    // Hash the new password using bcrypt with a salt round of 10
    const newUserPasswordHash = await bcrypt.hash(updatedPassword, 10);

    // Update the user's password with the new hashed password
    loggedInUser.password = newUserPasswordHash;

    // Save the updated user object to the database
    await loggedInUser.save();
    
    // Send a success response to the client
    res.send({message: "Password Updated Successfully !!", status: 200});
  } catch (error) {
    // Handle any errors and send a 500 response with the error message
    res.status(500).send(error.message);
  }
})

module.exports = profileRouter;