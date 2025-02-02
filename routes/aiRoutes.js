const express = require("express");
const { createChatCompletion } = require("../controllers/aiCtrl");

const router = express.Router();

router.post("/ask", createChatCompletion);

module.exports = router;
