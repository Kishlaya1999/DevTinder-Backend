const express = require("express");

const app = express();

app.get("/user", (req, res, next) => {
  try {
     throw new Error("abc xyz");

  } catch (error) {
    res.status(500).send("something went wrong (inside /user route handler)")
  }
})

app.use("/",(err, req, res, next) => {
  if(err) {
    res.status(500).send("something went wrong");
  }
} )

/**
 * Error Handling: 
 * We can also handler error using try catch block for each routeHandler function that we wrute in this case 
 * the catch will get triggred and universal error handler would not be triggred
 */

app.listen(3000, () => {
  console.log("Server is sucessfully listning on PORT  3000");
});