const router = require("express").Router();
const {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
} = require("../../controllers/qna/tagController");
const { isAuth, isAdmin } = require("../../middlewares/authMiddleware");

// POST - Create a tag (Admin only)
router.post("/", isAuth, isAdmin, createTag);

// GET - Get all tags (Public)
router.get("/", getAllTags);

// GET - Get a single tag by ID (Public)
router.get("/:id", getTagById);

// PUT - Update a tag by ID (Admin only)
router.put("/:id", isAuth, isAdmin, updateTag);

// DELETE - Delete a tag by ID (Admin only)
router.delete("/:id", isAuth, isAdmin, deleteTag);

module.exports = router;
