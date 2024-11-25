const mongoose = require("mongoose");

const dbConnect = () => {
  try {
    const connection = mongoose.connect(process.env.MONGO_URL);
    console.log("Database connected Successfully");
  } catch (error) {
    console.error(error);
  }
};
module.exports = dbConnect;
