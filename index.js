const express = require("express");
const dotenv = require("dotenv");
const dbConnect = require("./config/dbConnect");
const bodyParser = require("body-parser");

const { notfound, handerError } = require("./middlewares/errorHandler");
const userRoutes = require("./routes/userRoutes.js");
const { Store } = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const passportSetup = require("./utils/passport"); // error if not found !!!!!
dotenv.config();
const session = require("express-session");
const googleRoutes = require("./routes/googleRotes.js");
const path = require("path");

const tutCategory = require("./routes/categoryRoutes.js");
const tutRouter = require("./routes/tutorialRoutes.js");
const newsLeterRoutes = require("./routes/newsLeterRoutes.js");
const reviewsRoutes = require("./routes/reviewsRoutes.js");
const contactRoutes = require("./routes/contactRoutes");
const vidioRoutes = require("./routes/vidioRoutes");
const aiRoutes = require("./routes/aiRoutes");
const docRoutes = require("./routes/docRoutes");
const docCatRoutes = require("./routes/docCatRoutes");
const blogRoutes = require("./routes/blogRoutes.js");
const blogCatRoutes = require("./routes/blogCatRoutes.js");
const vidioCatRoutes = require("./routes/vidioCatRoutes");
const courseCatRoutes = require("./routes/courseCatRoutes");
const courseRoutes = require("./routes/courseRoutes");

const app = express();
dbConnect();
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "secret",
    Store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
    ttl: 60 * 60 * 24, // 1 day
  })
);

app.use(passport.initialize());
app.use(passport.session());
const PORT = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send(`<a href="http://localhost:4000/google">Login with Google</a>`);
});
app.use("/api/ai", aiRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/course/category", courseCatRoutes);
app.use("/api/doc", docRoutes);
app.use("/api/doc/category", docCatRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/blog/category", blogCatRoutes);
app.use("/api/user", userRoutes);
app.use("/api/vidio", vidioRoutes);
app.use("/api/vidio/category", vidioCatRoutes);
app.use("/api/news", newsLeterRoutes);
app.use("/api/review", reviewsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/", googleRoutes);
app.use("/api/category", tutCategory);
app.use("/api/tutorial", tutRouter);

app.use(notfound);
app.use(handerError);
app.listen(PORT, () =>
  console.log(`Server is Running on port  http://localhost:${PORT}`)
);
