const asyncHandler = require("express-async-handler");
const Review = require("../models/reviewsModel");
const validateMongoDbId = require("../config/validateMongoDb");
const Tutorial = require("../models/tutorialModel");

const postReview = asyncHandler(async (req, res) => {
  const { id } = req.user;
  validateMongoDbId(id);
  console.log(req.user);

  try {
    const { comment, color, tutorial_id } = req.body;

    // Validate required fields
    if (!comment || !color || !tutorial_id) {
      return res.status(400).json({
        status: false,
        message: "Comment, color, and tutorial_id are required",
      });
    }

    // Validate tutorial_id
    validateMongoDbId(tutorial_id);
    const tutorial = await Tutorial.findById(tutorial_id);
    if (!tutorial) {
      return res.status(404).json({
        status: false,
        message: "Tutorial not found",
      });
    }
    // Create the review object
    const newReview = await Review.create({
      user: id,
      comment,
      color,
      tutorial_id, // Tutorial ID from the request body
    });

    res.status(201).json({
      status: true,
      message: "Review created successfully",
      review: newReview,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

// Get all reviews
const getAllReviews = asyncHandler(async (req, res) => {
  try {
    const allReview = await Review.find();
    res.status(200).json(allReview);
  } catch (error) {
    res.status(404).json({
      status: false,
      message: "Reviews not found",
    });
  }
});

// Get a single review by ID
const getReview = asyncHandler(async (req, res) => {
  const { id } = req.params; // Review ID from request parameters
  validateMongoDbId(id); // Validate the ID

  try {
    const review = await Review.findById(id); // Find review by ID

    if (!review) {
      return res.status(404).json({
        status: false,
        message: "Review not found", // Review not found
      });
    }

    res.status(200).json({
      status: true,
      message: "Review found",
      review,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error fetching review: " + error.message, // Error fetching review
    });
  }
});

// Update a review by ID
const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params; // Review ID from request parameters
  validateMongoDbId(id); // Validate the ID

  try {
    const { comment, color } = req.body; // Review fields to update

    // Find the review by ID
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        status: false,
        message: "Review not found", // Review not found
      });
    }

    // Update the review's fields
    if (comment) review.comment = comment;
    if (color) review.color = color;

    const updatedReview = await review.save(); // Save the updated review

    res.status(200).json({
      status: true,
      message: "Review updated successfully",
      updatedReview,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error updating review: " + error.message, // Error updating review
    });
  }
});

// Delete a review by ID
const DeleteAReview = asyncHandler(async (req, res) => {
  const id = req.params.id; // review id
  validateMongoDbId(id);

  try {
    const deleteReview = await Review.findByIdAndDelete(id);

    if (!deleteReview) {
      return res.status(404).json({
        status: false,
        message: "Review not found", // Review not found
      });
    }

    res.status(200).json({
      status: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(404).json({
      status: false,
      message: "Error deleting review: " + error.message, // Error deleting review
    });
  }
});

module.exports = {
  postReview,
  getAllReviews,
  getReview,
  DeleteAReview,
  updateReview,
};
