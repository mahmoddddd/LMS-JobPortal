const router = require("express").Router();
const {
  createComment,
  getAllComments,
  getCommentById,
  updateComment,
  deleteComment,
} = require("../../controllers/qna/commentController");
const { isAuth, isAdmin } = require("../../middlewares/authMiddleware");

// POST - Create a comment (Authenticated users only)
router.post("/", isAuth, createComment);

// GET - Get all comments (Public)
router.get("/", getAllComments);

// GET - Get a single comment by ID (Public)
router.get("/:id", getCommentById);

// PUT - Update a comment by ID (Authenticated users only)
router.put("/:id", isAuth, updateComment);

// DELETE - Delete a comment by ID (Authenticated users only)
router.delete("/:id", isAuth, deleteComment);

module.exports = router;
