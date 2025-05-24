const express = require("express");

const app = express();

app.use("/user", (req, res, next) => {
  console.log("Response 1");
  next();
  res.send("Hello user 1");
}, (req, res) => {
  console.log("Response 2");
  // res.send("Hello user 2");
})

/** 
 * Output:
 * localhost:3000/user
 * Hello User 1
 * 
 * 
 * Console:
 * Response 1
 * Response 2
 * Error .........
 * .....
 * 
 * In this case we are getting an error as "Cannot set headers after they are sent to the client"
 * We are getting error because we are trying to change the response . A TCP conection is made client sends in which client sends the request and server sends the response for it then connection is close . 
 * Here server is trying to send the response after connection is closed.
 * 
 * When express see the next() then it executes the 2nd route handler and fter the exuction of 2nd route handler it tries to executes req.send() which is prseent in 1st route handler (same reason)
 */

app.listen(3000, () => {
  console.log("Server is sucessfully listning on PORT  3000");
});