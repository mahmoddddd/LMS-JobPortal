const express = require("express");
const router = express.Router();
const { isAuth, isAdmin } = require("../middlewares/authMiddleware");
const {
  postReview,
  getAllReviews,
  getReview,
  DeleteAReview,
  updateReview,
} = require("../controllers/reviewsCtrl");

router.post("/post-review", isAuth, postReview); // Create a new review
router.get("/get-all", isAuth, getAllReviews); // Get all reviews
router.get("get-review/:id", isAuth, getReview); // Get a review by ID
router.put("update-review/:id", isAuth, updateReview); // Update a review by ID
router.delete("delete/:id", isAuth, DeleteAReview); // Delete a review by ID

module.exports = router;
