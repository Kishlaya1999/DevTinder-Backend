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

/**
 * Connection Request reciever's api call
 * */ 
requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
  try {
    // Get the authenticated user from the request (set by userAuth middleware)
    const loggedInUser = req.user;
    // Extract status and requestId from the route parameters
    const {status, requestId} = req.params;

    // Define allowed statuses for reviewing a connection request
    const allowedStatuses = ["accepted", "rejected"];
    // Validate the status parameter
    if (!allowedStatuses.includes(status)) {
      return res.status(400).send({message: `Invalid status type: ${status}`});
    }

    /**
     * Find the connection request by:
     * - Its unique requestId
     * - The logged-in user being the recipient (toUserId)
     * - The request must currently have "interested" status
     * - Logged-in users profile should be able to interact with the person who is interested in him
     */
    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser?._id,  // Someone send the connection request to logged-in user
      status: "interested"          // Someone is interested in logged-in user
    });

    // If no such connection request exists, return 404
    if(!connectionRequest) {
      return res.status(404).json({message: "Connection Request not found !!"});
    }

    // Update the status of the connection request to the new status (accepted/rejected)
    connectionRequest.status = status;

    // Save the updated connection request to the database
    const data = await connectionRequest.save();

    // Respond with a success message and the updated data
    return res.status(200).json({message: `Connection request ${status}`, data});

  } catch (error) {
    // Handle any errors and respond with a 500 status code
    return res.status(500).send("Error:", error.message);
  }
});

module.exports = requestRouter;