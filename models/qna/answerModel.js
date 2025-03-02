const mongoose = require("mongoose");

let answerSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    votesUp: [
      {
        name: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    votesDown: [
      {
        name: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isBestAnswer: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Answer", answerSchema);
