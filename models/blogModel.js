const mongoose = require("mongoose");

let blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
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
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogCat",
      required: [true, "Category is required"],
    },
    thumbnail: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      validate: {
        validator: function (v) {
          // Validate URL format
          return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
            v
          );
        },
        message: (props) => `${props.value} is not a valid URL!`,
      },
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    keywords: {
      type: [String],
      required: [true, "Keywords are required"],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: "At least one keyword is required",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Blog", blogSchema);
