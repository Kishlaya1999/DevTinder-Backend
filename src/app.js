const express = require("express");

const app = express();

app.use("/user", (req, res) => {
  res.send("hello user");
})

app.listen(3000, () => {
  console.log("Server is sucessfully listning on PORT  3000");
});