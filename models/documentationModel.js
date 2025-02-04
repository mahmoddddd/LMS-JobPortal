// const mongoose = require("mongoose");

// let docSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//     },
//     slug: {
//       type: String,
//       required: true,
//     },
//     type: {
//       type: String,
//       required: true,
//     },
//     author: {
//       type: String,
//       default: "Mahmoud ElSherif",
//     },

//     content: {
//       type: String,
//       required: true,
//     },
//     keywords: {
//       type: [],
//       required: true,
//     },
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     doc_image: {
//       type: String,
//       default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Doc", docSchema);
const mongoose = require("mongoose");

let docSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true, // Removes unnecessary spaces
    },
    slug: {
      type: String,
      required: true,
      unique: true, // Ensure slugs are unique
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["article", "tutorial", "news"], // Example of possible types
    },
    author: {
      type: String,
      default: "Mahmoud ElSherif",
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    keywords: {
      type: [String], // Array of strings
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doc_image: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      validate: {
        validator: function (v) {
          return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
            v
          );
        },
        message: (props) => `${props.value} is not a valid URL!`,
      },
    },
  },
  { timestamps: true }
);

docSchema.index({ slug: 1 });
docSchema.index({ userId: 1 });
docSchema.index({ type: 1 });

module.exports = mongoose.model("Doc", docSchema);
