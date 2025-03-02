const mongoose = require("mongoose");

let tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // كل وسم يجب أن يكون فريدًا
      trim: true,
    },
    description: {
      type: String,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tag", tagSchema);
