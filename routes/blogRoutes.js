const express = require("express");
const router = express.Router();
const {
  isAuth,
  isAdmin,
  isBlogOwner,
} = require("../middlewares/authMiddleware");

const {
  createBlog,
  getBlogBySlug,
  getAllBlogs,
  deleteBlog,
  updateBlog,
} = require("../controllers/blogCtrl");

router.post("/blog", isAuth, isAdmin, createBlog);

router.get("/blog/:slug", getBlogBySlug);

router.get("/blogs", getAllBlogs);

router.delete("/blog/:id", isAuth, isAdmin, isBlogOwner, deleteBlog);

router.put("/blog/:id", isAuth, isAdmin, isBlogOwner, updateBlog);

module.exports = router;
