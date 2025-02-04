const mongoose = require("mongoose");

let vidioSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VidioCat",
      required: [true, "Category is required"],
    },
    thumbnail: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
    description: {
      type: String,
      required: true,
    },
    video_Url: {
      type: String,
      required: true,
    },
    keywords: {
      type: [],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Vidio", vidioSchema);
