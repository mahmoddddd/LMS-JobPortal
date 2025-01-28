const passport = require("passport");
const googleRoutes = require("express").Router();
const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

// Login Success route
googleRoutes.get(
  "/login/success",
  asyncHandler(async (req, res) => {
    if (req.user) {
      const findUser = await User.findOne({ email: req.user.email });
      if (findUser) {
        res.status(200).json({
          status: true,
          message: "Login successful",
          // user: req.user,
          token: generateToken(req.user),
          role: findUser?.roles,
          username: findUser?.firstname + findUser?.lastname,
          user_imag: findUser?.user_imag,
          from: "google",
        });
      } else {
        res.status(500).json({
          status: false,
          message: "User not found",
        });
      }
    } else {
      // If no user is logged in, send a 403 status
      res.status(403).json({
        message: "No user logged in",
      });
    }
  })
);

// Login Failed route
googleRoutes.get("/login/failed", (req, res) => {
  // Send a 401 status when login fails
  res.status(401).json({
    message: "Login failed",
  });
});

// Google login initiation route
googleRoutes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback route for Google after authentication
googleRoutes.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/login/success", // Redirect on success
    failureRedirect: "/login/failed", // Redirect on failure
  })
);

// Logout route
googleRoutes.get(
  "/logout",
  asyncHandler(async (req, res) => {
    req.logout((err) => {
      // Logout the user and handle errors
      if (err) {
        return res.status(500).json({ message: "Logout failed", error: err });
      }
      res.redirect("/"); // Redirect to the homepage after logout
    });
  })
);

module.exports = googleRoutes;
