const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
    answer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
    },
  },
  { timestamps: true }
);

commentSchema.pre("validate", function (next) {
  if (!this.question && !this.answer) {
    return next(
      new Error("A comment must be linked to either a question or an answer.")
    );
  }
  if (this.question && this.answer) {
    return next(
      new Error("A comment cannot be linked to both a question and an answer.")
    );
  }
  next();
});

module.exports = mongoose.model("Comment", commentSchema);
