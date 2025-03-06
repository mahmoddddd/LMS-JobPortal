const router = require("express").Router();
const {
  createQna,
  getAllQnas,
  getQnaById,
  updateQna,
  deleteQna,
} = require("../../controllers/qna/qnaCtrl");
const { isAuth, isAdmin } = require("../../middlewares/authMiddleware");

// POST - Create a QnA entry (Admin only)
router.post("/", isAuth, isAdmin, createQna);

// GET - Get all QnA entries (Public)
router.get("/", getAllQnas);

// GET - Get a single QnA entry by ID (Public)
router.get("/:id", getQnaById);

// PUT - Update a QnA entry by ID (Admin only)
router.put("/:id", isAuth, isAdmin, updateQna);

// DELETE - Delete a QnA entry by ID (Admin only)
router.delete("/:id", isAuth, isAdmin, deleteQna);

module.exports = router;
