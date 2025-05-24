const express = require("express");

const app = express();

app.use("/user", (req, res) => {
  console.log("Response 1");
  res.send("Hello user 1");
}, (req, res) => {
  console.log("Response 2");
  res.send("Hello user 2");
})

// Output : 
// localhost:3000/user
// Hello User 1

app.listen(3000, () => {
  console.log("Server is sucessfully listning on PORT  3000");
});