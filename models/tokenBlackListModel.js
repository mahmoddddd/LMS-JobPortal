const mongoose = require("mongoose");

const tokenBlacklistSchema = new mongoose.Schema({
  token: String,
  expiresAt: {
    type: Date,
    expires: "1h",
  },
});

module.exports = mongoose.model("TokenBlacklist", tokenBlacklistSchema);
