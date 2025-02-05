const mongoose = require("mongoose");
const { MAX } = require("uuid");
const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      minLength: 3,
      maxLength: 100,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      minLength: 200,
    },
    video: {
      type: String,
    },
    free_preview: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", lessonSchema);
