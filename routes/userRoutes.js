const express = require("express");

const {
  isAuth,
  isAdmin,
  isInstructor,
} = require("../middlewares/authMiddleware");

const router = express.Router();

const {
  registerAUser,
  loginUser,
  getAllUsers,
  updateUSerProfile,
} = require("../controllers/userCtr");

// Define routes
router.post("/register", registerAUser);
router.post("/login", loginUser);
router.get("/getAll", isAuth, isAdmin, getAllUsers);
router.put("/updateProfile/:id", updateUSerProfile);

module.exports = router;
