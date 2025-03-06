const router = require("express").Router();
const {
  createAnswer,
  getAllAnswers,
  getAnswerById,
  updateAnswer,
  deleteAnswer,
} = require("../../controllers/qna/answerController");
const { isAuth, isAdmin } = require("../../middlewares/authMiddleware");

// POST - Create an answer (Authenticated users only)
router.post("/", isAuth, createAnswer);

// GET - Get all answers (Public)
router.get("/", getAllAnswers);

// GET - Get a single answer by ID (Public)
router.get("/:id", getAnswerById);

// PUT - Update an answer by ID (Authenticated users only)
router.put("/:id", isAuth, updateAnswer);

// DELETE - Delete an answer by ID (Authenticated users only)
router.delete("/:id", isAuth, deleteAnswer);

module.exports = router;
