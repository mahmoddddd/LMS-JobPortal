require("dotenv").config(); // تأكد من استدعاء dotenv في أعلى الملف

const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || "default-access-secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "default-refresh-secret";

// Generate Access Token
const generateToken = (id) => {
  return jwt.sign({ id }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
};
// Generate Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

// Verify Refresh Token
const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
};
