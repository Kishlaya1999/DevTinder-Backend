const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
// express.json is a middleware provided by express for converting the incomming body from request in appropriate format
// express.json() => converts JSON body --> JS object
app.use(express.json());

// Middleware for reading incoming cookies form the client
app.use(cookieParser());

app.post("/signup", async (req, res) => {

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

app.post("/login", async (req, res) => {
  try {
    const {emailId, password} = req.body;

    const user = await User.findOne({emailId: emailId});
    
    if(!user) {
      throw new Error("Invalid Credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(isPasswordValid) {

      // Add the token to the cookie and send the response back to the user
      res.cookie("token","sdiufsidncuisdnflekcnfkfsdkfncukdfsdklcmvdn");


      res.send("User logged in sucessfully!!");
    } else{
      throw new Error("Invalid Credentials");
    };

  } catch (error) {
    res.status(500).send(error.message)
  }
});

app.get("/profile", async (req, res) => {
  try {

    // getting the dummy cookie which is comming from the client
    const cookies = req.cookies;
    console.log(cookies);

    res.send("sending cookie"); //{ token: 'sdiufsidncuisdnflekcnfkfsdkfncukdfsdklcmvdn' }
    
  } catch (error) {
    res.status(500).send(error.message)
  }
})

app.get("/user", async (req, res) => {
  const { emailId } = req.body;
  console.log(emailId);

  try {
    const user = await User.findOne({ emailId: emailId });

    if (user.length === 0) {
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
    //const user = await User.findByIdAndDelete(userId);

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
    console.log(user);
    res.send("User updated successfully");
  } catch (err) {
    res.status(400).send("UPDATE FAILED:" + err.message);
  }
});

app.use("/", (err, req, res, next) => {
  if (err) {
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