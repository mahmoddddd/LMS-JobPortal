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
  forgetPasswoordToken,
  resetPassword,
  setPasswordAndMobile,
  refreshAccessToken,
  logoutUser,
} = require("../controllers/userCtr");

// Public routes
router.post("/register", registerAUser); // Register a new user
router.post("/login", loginUser); // Login a user

router.get("/", async (req, res) => {
  res.json([{ id: "123", name: "Mahmoud" }]);
});

router.post("/refresh-token", isAuth, refreshAccessToken); // Refresh access token
router.post("/logout", isAuth, logoutUser); // Logout a user

router.get("/getAll", isAuth, isAdmin, getAllUsers); // Get all users
router.get("/getAUser/:id", isAuth, isAdmin, getAUser); // Get a specific user by ID
router.delete("/deleteUser/:id", isAuth, isAdmin, deleteUser); // Delete a user
router.put("/blockUser/:id", isAuth, isAdmin, blockUser); // Block a user
router.put("/unblockUser/:id", isAuth, isAdmin, unblockUser); // Unblock a user
// Authenticated user routes
router.put("/updateProfile", isAuth, updateUserProfile); // Update user profile
router.put("/update-password", isAuth, updatePassword); // Update user password

// Forgot and Reset Password
router.post("/forgetPasswordToken", forgetPasswoordToken); // Generate password reset token
router.put("/reset-password/:token", resetPassword); // Reset password using token
router.put("/set-password-mobile", isAuth, setPasswordAndMobile);

module.exports = router;
