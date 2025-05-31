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
    res.status(500).send(error.message)
  }

});

app.get("/user", async (req, res) => {
  const {emailId}= req.body;
  console.log(emailId);
  
  try {
    const user = await User.findOne({emailId : emailId});
    
    if(user.length === 0){
      res.status(404).send("User Not found");
    } else {
      res.send(user);
    }
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
})

app.get("/feed", async (req, res) => {
  try {
  const users = await User.find();
    res.status(200).send(users);
  } catch (error) {
    req.status(500).send("Can't get users!! Something went wrong");
  }
});

// Detele a user from the database
app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await User.findByIdAndDelete({ _id: userId });
    //const user = await User.findByIdAndDelete(userId);Add commentMore actions

    res.send("User deleted successfully");
  } catch (err) {
    res.status(400).send("Something went wrong ");
  }
});

// Update data of the user
app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;

  try {
    // Only fieldNames which are there in ALLOWED_UPDATES can be updated if someother field is inclued in req.body then error would be thrown Update not allowed
    // By doing this user won't be able to update field like emailId, firstName, etc.....  
    const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills"];
    const isUpdateAllowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );
    if (!isUpdateAllowed) {
      throw new Error("Update not allowed");
    }
    if (data?.skills.length > 10) {
      throw new Error("Skills cannot be more than 10");
    }
    const user = await User.findByIdAndUpdate({ _id: userId }, data, {
      returnDocument: "after",
      runValidators: true,
    });
    res.send("User updated successfully");
  } catch (err) {
    res.status(400).send("UPDATE FAILED:" + err.message);
  }
});

app.use("/", (err, req, res, next) => {
  if(err){
    res.status(500).send("Route not defined");
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