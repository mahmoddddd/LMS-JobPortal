const express = require("express");
const router = express.Router();
const {
  postBlogCategory,
  getAllBlogCategories,
  getABlogCategory,
  deleteBlogCategory,
  updateBlogCategory,
} = require("../controllers/blogCatCtrl");

const { isAuth, isAdmin } = require("../middlewares/authMiddleware");

// POST - Create a Blog Category (Admin only)
router.post("/", isAuth, isAdmin, postBlogCategory);

// GET - Get All Blog Categories (Public)
router.get("/", getAllBlogCategories);

// GET - Get a Single Blog Category by Slug (Public)
router.get("/:slug", getABlogCategory);

// DELETE - Delete a Blog Category by ID (Admin only)
router.delete("/:id", isAuth, isAdmin, deleteBlogCategory);

// PUT - Update a Blog Category by ID (Admin only)
router.put("/:id", isAuth, isAdmin, updateBlogCategory);

module.exports = router;
