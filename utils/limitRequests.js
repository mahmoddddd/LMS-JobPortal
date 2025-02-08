const express = require("express");
const rateLimit = require("express-rate-limit");

const app = express();

function limiter(time, maxReq, message) {
  return rateLimit({
    windowMs: time || 15 * 60 * 1000,
    max: maxReq || 50,
    message:
      message || "Too many requests from this IP, please try again later.",
  });
}

module.exports = limiter;
