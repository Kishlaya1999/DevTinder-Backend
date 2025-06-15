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
    const { firstName, lastName, emailId, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    })
    const savedUser = await user.save();
    console.log(savedUser);

    const token = await savedUser.getJWToken();
    console.log(token);

    res.cookie("token", token);

    res.json({ message: "User Signup Successfull", data: savedUser });
  } catch (error) {
    res.status(500).send(error.message)
  }

});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });

    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // Using Schema method for some user specific task
    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {

      const token = await user.getJWToken();

      // Add the token to the cookie and send the response back to the user
      res.cookie("token", token);

      res.json({ message: "User logged in sucessfully!!", data: user });
    } else {
      return res.status(401).json({ message: "Invalid Credentials" });
    };

  } catch (error) {
    res.status(500).send(error.message)
  }
});

authRouter.post("/logout", async (req, res) => {
  /**
   * setting the cookie token to null and also expiring it now
   * if jwt token wouldn't be availabe then user is logged out
  */
  res.cookie("token", null, { expires: new Date(Date.now()) });
  res.send("User Logged Out");
})

module.exports = authRouter;