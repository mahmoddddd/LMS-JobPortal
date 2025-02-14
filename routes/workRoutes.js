const {
  postDetails,
  updateDetails,
  deletedDetails,
  getOneDetail,
  getAllDetails,
} = require("../controllers/workWithUs.js");
const { isAuth, isAdmin } = require("../middlewares/authMiddleware.js");

const workRouter = require("express").Router();

workRouter.post("/", isAuth, isAdmin, postDetails);
workRouter.put("/update/:id", isAuth, isAdmin, updateDetails);
workRouter.delete("/delete/:id", isAuth, isAdmin, deletedDetails);
// search by Id
workRouter.get("/one/:id?", isAuth, isAdmin, getOneDetail);
// search by slug
workRouter.get("/one/slug/:slug", isAuth, isAdmin, getOneDetail);
workRouter.get("/getAll", isAuth, isAdmin, getAllDetails);
module.exports = workRouter;
