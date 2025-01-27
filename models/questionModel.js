const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question_text: {
      type: String,
      required: true,
    }, // نص السؤال
    topic: {
      type: String,
      required: true,
    }, // الموضوع (مثل JavaScript)
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    }, // level of difficulty

    options: {
      type: [String],
      required: true,
    }, // list of options
    correct_answer: {
      type: String,
      required: true,
    }, // the correct answer
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
