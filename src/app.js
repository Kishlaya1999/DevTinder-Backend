const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const http = require("http");

const authRouter = require("./routers/auth.routes");
const profileRouter = require("./routers/profile.routes");
const requestRouter = require("./routers/request.routes");
const userRouter = require("./routers/users.routes");
const cors = require("cors");
const initializeSocket = require("./utils/socket");
require('dotenv').config()

// Enable Cross-Origin Resource Sharing (CORS) for the frontend application
app.use(cors({
  origin: "http://localhost:5173", // Allow requests only from this frontend origin
  credentials: true,               // Allow cookies and credentials to be sent with requests
}));

// express.json is a middleware provided by express for converting the incomming body from request in appropriate format
// express.json() => converts JSON body --> JS object
app.use(express.json());

// Middleware for reading incoming cookies form the client
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

const server = http.createServer(app);
initializeSocket(server);

app.use("/", (err, req, res, next) => {
  if (err) {
    res.status(500).send("Route not defined");
  }
});

connectDB().then(() => {
  console.log("Database connection established...");
  server.listen(process.env.PORT, () => {
    console.log("Server is successfully listening on port 3000...");
  });
})
  .catch((err) => {
    console.error("Database cannot be connected!!");
  });

/*
CORS Middleware Explanation:
- Allows the frontend running at http://localhost:5173 to make requests to this backend.
- credentials: true enables cookies, authorization headers, or TLS client certificates to be sent.
- This is essential for authentication and session management when frontend and backend are on different ports/domains during development.
- Prevents requests from unauthorized origins, improving security.
*/