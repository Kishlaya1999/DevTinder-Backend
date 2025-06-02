const express = require("express");
const authRouter = express.Router();

const User = require("../models/user");
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt");

authRouter.post("/signup", async (req, res) => {

  try {
    // Validation for data;
    validateSignUpData(req);

    // Password encryption
    const {firstName, lastName, emailId, password} = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    })
    await user.save();
    res.send("User Saved Successfully!!")
  } catch (error) {
    res.status(500).send(error.message)
  }

});

authRouter.post("/login", async (req, res) => {
  try {
    const {emailId, password} = req.body;

    const user = await User.findOne({emailId: emailId});
    
    if(!user) {
      throw new Error("Invalid Credentials");
    }

    // Using Schema method for some user specific task
    const isPasswordValid = await user.validatePassword(password);

    if(isPasswordValid) {

      const token = await user.getJWToken();
      
      // Add the token to the cookie and send the response back to the user
      res.cookie("token", token);  

      res.send("User logged in sucessfully!!");
    } else{
      throw new Error("Invalid Credentials");
    };

  } catch (error) {
    res.status(500).send(error.message)
  }
});

module.exports = authRouter;