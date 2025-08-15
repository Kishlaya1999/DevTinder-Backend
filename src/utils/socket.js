const socket = require("socket.io");
const crypto = require("crypto");

const getSecretRoomId = (loggedInUserId, targetUserId) => {
    return crypto.createHash('sha256').update([loggedInUserId, targetUserId].sort().join("@")).digest('hex');
}

const initializeSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: "http://localhost:5173"
        },
    });

    io.on("connection", (socket) => {
    //   handle events

        socket.on("joinChat", ({firstName ,loggedInUserId, targetUserId}) => {
            // For making the room ID unique, we can sort the user IDs and join the room with a combined string
            const roomId = getSecretRoomId(loggedInUserId, targetUserId);
            console.log(`${firstName} User ${loggedInUserId} joined chat with ${targetUserId} : ${roomId}`);
            // loggedInUserId and targetUserId are joining the same room
            socket.join(roomId)
        });

        //Catching the message from the client and broadcasting it to the room according to the roomId
        socket.on("sendMessage", ({firstName, loggedInUserId, targetUserId, text}) => {
            const roomId = getSecretRoomId(loggedInUserId, targetUserId);
            console.log(firstName + " " + text);
            io.to(roomId).emit("messageReceived", {firstName, text, loggedInUserId, targetUserId});
        });

        socket.on("disconnect", () => {});
    })
}

module.exports = initializeSocket;