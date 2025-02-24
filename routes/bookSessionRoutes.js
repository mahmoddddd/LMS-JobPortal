const express = require("express");
const router = express.Router();
const {
  createBookSession,
  getAllBookSessions,
  getBookSessionById,
  updateBookSession,
  deleteBookSession,
} = require("../controllers/bookSessionCtrl");
const { isAuth, isAdmin } = require("../middlewares/authMiddleware");

// Apply authentication middleware to all routes
router.use(isAuth);

// Create a new book session
router.post("/post-booksession", createBookSession);

// Update a book session by ID
router.put("/update-booksession/:id", updateBookSession);

// Delete a book session by ID (admin only)
router.delete("/delete-booksession/:id", isAdmin, deleteBookSession);

// Get a single book session by ID
router.get("/getbooksession/:id", getBookSessionById);

// Get all book sessions
router.get("/booksessions", getAllBookSessions);

module.exports = router;
