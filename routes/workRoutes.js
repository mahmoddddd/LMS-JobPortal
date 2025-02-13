const { postDetails, updateDetails } = require("../controllers/workWithUs.js");
const { isAuth, isAdmin } = require("../middlewares/authMiddleware.js");

const workRouter = require("express").Router();

workRouter.post("/", isAuth, isAdmin, postDetails);
workRouter.post("/update", isAuth, isAdmin, updateDetails);
module.exports = workRouter;
