const express = require("express");
const router = express.Router();

const { isAuth, isAdmin } = require("../middlewares/authMiddleware");

const {
  registerAUser,
  loginUser,
  getAllUsers,
  updateUserProfile,
  deleteUser,
  getAUser,
  blockUser,
  unblockUser,
  updatePassword,
} = require("../controllers/userCtr");

// Public routes
router.post("/register", registerAUser); // Register a new user
router.post("/login", loginUser); // Login a user

// Admin-protected routes
router.get("/getAll", isAuth, isAdmin, getAllUsers); // Get all users
router.get("/getAUser/:id", isAuth, isAdmin, getAUser); // Get a specific user by ID
router.delete("/deleteUser/:id", isAuth, isAdmin, deleteUser); // Delete a user
router.put("/blockUser/:id", isAuth, isAdmin, blockUser); // Block a user
router.put("/unblockUser/:id", isAuth, isAdmin, unblockUser); // Unblock a user

// Authenticated user routes
router.put("/updateProfile", isAuth, updateUserProfile); // Update user profile
router.put("/update-password", isAuth, updatePassword); // Update user password

module.exports = router;
