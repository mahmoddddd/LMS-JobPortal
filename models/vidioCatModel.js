const mongoose = require("mongoose");

let vidioCatSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
    },
  },

  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("VidioCat", vidioCatSchema);
