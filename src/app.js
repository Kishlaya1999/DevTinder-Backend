const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");

app.post("/signup",async (req, res) => {
  const user = new User({
    firstName: "Sachin",
    lastName: "Tendulkar",
    emailId: "sachin@tendulkar.com",
    password: "sachin@123",
  })

  try {
    await user.save();
    res.send("User Saved Successfully!!")
  } catch (error) {
    res.status(500).send("Something went wrong user can't be saved in DB")
  }
});

// Establishing the connection with db then starting to listen for request in port 3000
connectDB().then(() => {
    console.log("Database connection established...");
    app.listen(3000, () => {
      console.log("Server is successfully listening on port 3000...");
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected!!");
  });