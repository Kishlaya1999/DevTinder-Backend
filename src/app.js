const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");

const authRouter = require("./routers/auth");
const profileRouter = require("./routers/profile");
const requestRouter = require("./routers/request");

// express.json is a middleware provided by express for converting the incomming body from request in appropriate format
// express.json() => converts JSON body --> JS object
app.use(express.json());

// Middleware for reading incoming cookies form the client
app.use(cookieParser());


app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);

app.use("/", (err, req, res, next) => {
  if (err) {
    res.status(500).send("Route not defined");
  }
});

connectDB().then(() => {
  console.log("Database connection established...");
  app.listen(3000, () => {
    console.log("Server is successfully listening on port 3000...");
  });
})
  .catch((err) => {
    console.error("Database cannot be connected!!");
  });