const express = require("express");
const { registerAUser } = require("../controllers/userCtr");
const router = express.Router();

router.post("/register", registerAUser);

module.exports = router;
