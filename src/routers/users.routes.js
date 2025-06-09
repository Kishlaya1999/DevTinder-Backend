const express = require("express");
const userRouter = express.Router();

const { userAuth } = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const FROM_USER_DATA = [
	"firstName", "lastName", "age", "gender", "skills", "photoUrl", "about"
];

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
				.populate("fromUserId", FROM_USER_DATA);

		// Respond with the list of interested connection requests
		return res.json({ message: `Connection Requests for ${loggedInUser.firstName}`, data: interestedConnectionRequests });

	} catch (error) {
		// Handle any errors and respond with a 500 status code
		return res.status(500).send("Error:", error.message);
	}
});

// Getting the profile of the current connections
userRouter.get("/user/connections", userAuth, async (req, res) => {
	try {
		const loggedInUser = req.user;

		// Find all accepted connection requests where the logged-in user is either the sender or receiver.
		// The $or operator checks both fromUserId and toUserId for the current user.
		const existingConnections =
			await ConnectionRequest
				.find({
					$or: [
						{ toUserId: loggedInUser?._id, status: "accepted" },
						{ fromUserId: loggedInUser?._id, status: "accepted" }
					]
				})
				// .populate() replaces the ObjectId in fromUserId with the actual User document,
				// fetching only the fields specified in FROM_USER_DATA.
				.populate("fromUserId", FROM_USER_DATA)
				// .populate() also replaces the ObjectId in toUserId with the actual User document,
				// again fetching only the fields specified in FROM_USER_DATA.
				.populate("toUserId", FROM_USER_DATA);


		/** 
		 * Why:
		Since a connection can be initiated by either user, this logic ensures that the response always contains the profile of the person the logged-in user is connected to, not their own profile.
		* Intent:
		The intent is to provide the logged-in user with a list of user profiles they are connected to, regardless of who initiated the connection.
		This is useful for features like "My Connections" or "Friends List," where the user wants to see the people they are connected with, not the connection request objects themselves.
		*/

		// Map the connections to return the other user's profile for each connection.
		const data = existingConnections.map(connection => {
			// If the logged-in user is the sender, return the receiver's profile.
			if (connection.fromUserId.equals(loggedInUser?._id)) {
				return connection.toUserId;
			}
			// Otherwise, return the sender's profile.
			return connection.fromUserId;
		});

		// Respond with the list of connected users' profiles.
		return res.json({ message: `Connections for ${loggedInUser?.firstName}`, data: data });

	} catch (error) {
		// Handle any errors and respond with a 500 status code.
		return res.send("Error: ", message.error);
	}
});

userRouter.get("/feed", userAuth, async (req, res) => {
	try {
		const loggedInUser = req.user;

		/*
		Profiles that the logged-in user should NOT see in their feed:
		- Their own profile
		- Users who are already connected to the logged-in user
		- Users who have been ignored by the logged-in user
		- Users for whom the loggedIn user has already shown interest
		- Users who have ignored the logged-in user (i.e., if another user has ignored the logged-in user, their profile should not be shown)

		/*
		Example:
		Suppose Alice is the logged-in user. The following users exist in the system:
		- Bob
		- Charlie
		- Diana
		- Eve
		- Frank

		Relationships and actions:
		- Alice is already connected with Bob.
		- Alice has ignored Charlie.
		- Alice has already shown interest in Diana.
		- Eve has ignored Alice.
		- Frank has no prior interaction with Alice.

		According to the above criteria, Alice's feed should NOT show:
		- Alice (her own profile)
		- Bob (already connected)
		- Charlie (ignored by Alice)
		- Diana (Alice already showed interest)
		- Eve (ignored Alice)

		Only Frank will appear in Alice's feed, as he does not match any exclusion criteria.
		*/

		// Find all connection requests where the logged-in user is either the sender or receiver.
		// This helps us identify users who are already connected, ignored, or have pending requests with the logged-in user.
		const connectionRequests = await ConnectionRequest.find({
			$or: [{ toUserId: loggedInUser?._id }, { fromUserId: loggedInUser }]
		}).select("toUserId fromUserId");

		// Create a set to store user IDs that should be hidden from the feed
		const hideUsersFromFeed = new Set();

		// Add both sender and receiver IDs from each connection request to the exclusion set
		connectionRequests.forEach((req) => {
			hideUsersFromFeed.add(req.fromUserId.toString());
			hideUsersFromFeed.add(req.toUserId.toString());
		});

		// Query for users who are NOT in the exclusion set and are not the logged-in user
		// This ensures the feed only shows potential new connections
		const usersForLoggedInUserFeed = await User.find({
			$and: [
				{ _id: { $nin: Array.from(hideUsersFromFeed) } },
				{ _id: { $ne: loggedInUser?._id } }
			]
		}).select(FROM_USER_DATA);

		// Send the filtered user profiles as the feed
		return res.status(200).send({ data: usersForLoggedInUserFeed });
	} catch (error) {
		return res.status(500).send("Error:", error.message);
		
	}
});

module.exports = userRouter;