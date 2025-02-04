const mongoose = require("mongoose");

let vidioCatSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"], // Added custom error message
      trim: true, // Remove unnecessary spaces
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"], // Added custom error message
    },
    slug: {
      type: String,
      required: [true, "Slug is required"], // Added custom error message
    },
  },

  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("VidioCat", vidioCatSchema);
