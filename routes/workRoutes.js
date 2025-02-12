const { postDetails } = require("../controllers/workWithUs.js");
const { isAuth, isAdmin } = require("../middlewares/authMiddleware.js");

const workRouter = require("express").Router();

workRouter.post("/", isAuth, isAdmin, postDetails);
module.exports = workRouter;
