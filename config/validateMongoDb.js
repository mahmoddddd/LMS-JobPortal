const mongoose = require("mongoose");

const validateMongoDbId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }
  return true;
};

module.exports = validateMongoDbId;
