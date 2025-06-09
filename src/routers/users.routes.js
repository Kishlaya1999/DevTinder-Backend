const express = require("express");
const userRouter = express.Router();

const { userAuth } = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");

// Get pending connection requests
// API used for viewing the requests a user has received (i.e., someone showed interest in the receiver's profile)
userRouter.get("/user/requests/recieved", userAuth, async (req, res) => {
    try {
        // Get the currently logged-in user from the request (set by userAuth middleware)
        const loggedInUser = req.user;

        // Find all connection requests where:
        // - status is "interested"
        // - toUserId matches the logged-in user's ID
        // Use .populate() to replace the fromUserId ObjectId with the actual User document,
        // fetching only selected fields for richer response data.
        // This works because 'fromUserId' is defined with 'ref: "User"' in the schema.
        const interestedConnectionRequests = 
        await ConnectionRequest
        .find({
            status: "interested",
            toUserId: loggedInUser._id,
        })
        .populate("fromUserId", [
            "firstName", "lastName", "age", "gender", "skills", "photoUrl", "about"
        ]);

        // Respond with the list of interested connection requests
        return res.json({ message: `Connection Requests for ${loggedInUser.firstName}`, data: interestedConnectionRequests });

    } catch (error) {
        // Handle any errors and respond with a 500 status code
        return res.status(500).send("Error:", error.message);
    }
});

module.exports = userRouter;