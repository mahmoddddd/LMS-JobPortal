const mongoose = require("mongoose");

let blogSchema = new mongoose.Schema(
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
      unique: true, // Ensure slugs are unique
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId, // Changed to ObjectId for referencing
      ref: "BlogCat", // Reference to the BlogCategory model
      required: [true, "Category is required"], // Added custom error message
    },
    thumbnail: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png", // Default thumbnail
      validate: {
        validator: function (v) {
          // Validate URL format
          return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
            v
          );
        },
        message: (props) => `${props.value} is not a valid URL!`, // Custom error message
      },
    },
    description: {
      type: String,
      required: [true, "Description is required"], // Added custom error message
      trim: true,
    },
    keywords: {
      type: [String],
      required: [true, "Keywords are required"], // Added custom error message
      validate: {
        validator: function (v) {
          // Ensure keywords array is not empty
          return v.length > 0;
        },
        message: "At least one keyword is required", // Custom error message
      },
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Blog", blogSchema);
