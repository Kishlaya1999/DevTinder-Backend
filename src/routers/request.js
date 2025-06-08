const express = require("express");
const requestRouter = express.Router();
const ConnectionRequest = require("../models/connectionRequest");
const { userAuth } = require("../middleware/auth");
const User = require("../models/user");

// Route to send a connection request from one user to another
requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    // Get the authenticated user from the request (set by userAuth middleware)
    const user = req.user;

    const fromUserId = user._id; // Sender's user ID
    // Extract status and recipient user ID from the route parameters
    const { status, toUserId } = req.params;

    // Define allowed statuses for a connection request
    const allowedStatuses = ["ignored", "interested"];
    // Validate the status parameter
    if (!allowedStatuses.includes(status)) {
      return res.status(400).send({message: `Invalid status type: ${status}`});
    }

    // Checking if the logged-in user is trying to send a request to themselves
    if(fromUserId.equals(toUserId)) {
      return res.status(400).send({ message: "You cannot send a connection request to yourself" });
    }

    //Checking if the toUserId exists in the database
    const isToUserIdExists = await User.findOne({ _id: toUserId });

    if (!isToUserIdExists) {
      return res.status(400).send({ message: `User not found: ${toUserId}` });
    }

    /**
     * Check if a connection request already exists between the two users
     * This is done to prevent duplicate requests.
     * The request can be sent in either direction:
     * 1. fromUserId to toUserId
     * 2. toUserId to fromUserId  
     */
    
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: fromUserId, toUserId: toUserId }, 
        { fromUserId: toUserId, toUserId: fromUserId }  
      ]
    });

    if (existingRequest) {
      return res.status(400).send({ message: "Connection request already exists" });
    }

    // Create a new connection request document
    const connectionRequest = new ConnectionRequest({
      fromUserId: fromUserId,   // Sender's user ID
      toUserId: toUserId,     // Recipient's user ID
      status: status,         // Status of the request
    });

    // Save the connection request to the database
    const data = await connectionRequest.save();

    if(status === "ignored") {
      // writting the custom message for ignored status with the user's name
      return res.status(200).send({ message: `${req.user.firstName} ignored ${isToUserIdExists.firstName}`, data });
    }
    if(status === "interested") {
      return res.status(200).send({ message: `${req.user.firstName} is interested in connecting with ${isToUserIdExists.firstName}`, data });
    }

  } catch (error) {
    return res.status(500).send("Error:", error.message); 
  }
});

module.exports = requestRouter;