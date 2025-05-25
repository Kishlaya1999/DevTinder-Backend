const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");

// express.json is a middleware provided by express for converting the incomming body from request in appropriate format
// express.json() => converts JSON body --> JS object
app.use(express.json())

app.post("/signup",async (req, res) => {

  // console.log(req?.body);
  const userObj = req.body;
  
  const user = new User(userObj)

  try {
    await user.save();
    res.send("User Saved Successfully!!")
  } catch (error) {
    res.status(500).send("Something went wrong user can't be saved in DB")
  }

})

connectDB().then(() => {
    console.log("Database connection established...");
    app.listen(3000, () => {
      console.log("Server is successfully listening on port 3000...");
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected!!");
  });