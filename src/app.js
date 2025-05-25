const express = require("express");

const app = express();

app.get("/user", (req, res, next) => {
 throw new Error("abc xyz");
})

app.use("/",(err, req, res, next) => {
  if(err) {
    res.status(500).send("something went wrong");
  }
} )

/**
 * Error Handling: 
 * if we get some error then the app.use("/") will handle it
 * handler function basics 
 *  if we pass 
 *  - 2 arguments: 1st => requset, 2nd => response
 *  - 3 arguments: 1st => requset, 2nd => response, 3rd => next
 *  - 4 arguments: 1st => error, 2nd => request, 3rd => response, 4th => next
 */

app.listen(3000, () => {
  console.log("Server is sucessfully listning on PORT  3000");
});