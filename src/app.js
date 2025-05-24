const express = require("express");

const app = express();

app.use("/user", (req, res) => {
  console.log("Response 1");
  // res.send("Hello user 1");
}, (req, res) => {
  console.log("Response 2");
  res.send("Hello user 2");
})

/** 
 * Output
 * localhost:3000/user
 * No response comes from the server 
 * (it seems like the response would be Hello user 2, but we will not get any response)
 */

app.listen(3000, () => {
  console.log("Server is sucessfully listning on PORT  3000");
});