const express = require("express");
const requestRouter = express.Router();
const ConnectionRequest = require("../models/connectionRequest");
const { userAuth } = require("../middleware/auth");

// Route to send a connection request from one user to another
requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    // Get the authenticated user from the request (set by userAuth middleware)
    const user = req.user;
    // Extract status and recipient user ID from the route parameters
    const { status, toUserId } = req.params;

    // Define allowed statuses for a connection request
    const allowedStatuses = ["ignored", "interested"];
    // Validate the status parameter
    if (!allowedStatuses.includes(status)) {
      return res.status(400).send({message: `Invalid status type: ${status}`});
    }

    // Create a new connection request document
    const connectionRequest = new ConnectionRequest({
      fromUserId: user._id,   // Sender's user ID
      toUserId: toUserId,     // Recipient's user ID
      status: status,         // Status of the request
    });

    // Save the connection request to the database
    const data = await connectionRequest.save();
    // Respond with success message and saved data
    return res.status(200).send({ message: "Connection request sent successfully", data });

  } catch (error) {
    return res.status(500).send("Error:", error.message); 
  }
});

module.exports = requestRouter;