const rateLimit = require("express-rate-limit");

function limiter(time = 15 * 60 * 1000, maxReq = 50, message) {
  return rateLimit({
    windowMs: time,
    max: maxReq,
    message:
      message || "Too many requests from this IP, please try again later.",
    headers: true,
  });
}

module.exports = limiter;
