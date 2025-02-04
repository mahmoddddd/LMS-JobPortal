const express = require("express");
const router = express.Router();
const { isAuth, isAdmin } = require("../middlewares/authMiddleware");

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

router.delete("/blog/:id", isAuth, isAdmin, deleteBlog);

router.put("/blog/:id", isAuth, isAdmin, updateBlog);

module.exports = router;
