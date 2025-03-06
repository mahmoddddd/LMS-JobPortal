const router = require("express").Router();
const {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} = require("../../controllers/qna/questionController");
const { isAuth, isAdmin } = require("../../middlewares/authMiddleware");

// POST - Create a question (Authenticated users only)
router.post("/", isAuth, createQuestion);

// GET - Get all questions (Public)
router.get("/", getAllQuestions);

// GET - Get a single question by ID (Public)
router.get("/:id", getQuestionById);

// PUT - Update a question by ID (Authenticated users only)
router.put("/:id", isAuth, updateQuestion);

// DELETE - Delete a question by ID (Authenticated users only)
router.delete("/:id", isAuth, deleteQuestion);

module.exports = router;
