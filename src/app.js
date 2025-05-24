const express = require("express");

const app = express();

app.use("/user", (req, res, next) => {
  console.log("Response 1");
  // res.send("Hello user 1");
  next();
}, (req, res) => {
  console.log("Response 2");
  res.send("Hello user 2");
})

/** 
 * Output
 * localhost:3000/user
 * Hello User 2
 * (in express the third argument in route handler is next, if we call next in the route handler then route handler next to it will be executed)
 */

app.listen(3000, () => {
  console.log("Server is sucessfully listning on PORT  3000");
});