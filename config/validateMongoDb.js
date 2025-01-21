const mongoose = require("mongoose");
const validateMongoDbId = (id) => {
  const isalid = mongoose.Types.ObjectId.isValid(id);
  if (!isalid) {
    throw new Error("This id is not Found");
  }
};
module.exports = validateMongoDbId;
