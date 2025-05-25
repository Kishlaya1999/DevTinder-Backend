
const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://kishlaya321:H8ZArUd4X6iTY0Xz@cluster0.hwjpzfn.mongodb.net/devTinder"
  );
};



module.exports = connectDB;