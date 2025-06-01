const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
	try {
		/**
 			* Getting the token form the req send by the client
 			* If token not send with the request then we are throwing an error
		*/
		const { token } = req.cookies;
		if (!token) {
			throw new Error("Token Invalid!!");
		}

		/**
		 * Decoding the jwt token using the token (coming in request) and the secret key which we have send while loggin in 
		 * We would be getting the data that we have send while loggin in i.e. _id (userId)
		 * Using which we will get the user from mongdb database and return to the client 
		 * By doing this we are sending the data of currently logged in user
		*/ 
		const decodedObj = jwt.verify(token, "jwtSecretKey");

		// Extracting the _id form the decodedObj and attaching it to the request so the the handler can access it
		const { _id } = decodedObj;
		const user = await User.findById(_id);
		req.user = user;
		next();

	} catch (error) {
		res.status(400).send(error.message)
	}
}

module.exports = {
	userAuth,
};