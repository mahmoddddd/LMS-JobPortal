const router = require("express").Router();
const { isAuth, isAdmin } = require("../middlewares/authMiddleware");

const {
  subscribeNewsLetter,
  unsubscribeNewsLetter,
} = require("../controllers/newsLeterCtrl");

router.post("/subscribe-news-letter", isAuth, isAdmin, subscribeNewsLetter);
router.post("/unsubscribe-news-letter", isAuth, isAdmin, unsubscribeNewsLetter);

module.exports = router;
