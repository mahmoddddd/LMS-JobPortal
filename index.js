const express = require("express");
const dotenv = require("dotenv");
const dbConnect = require("./config/dbConnect");
const bodyParser = require("body-parser");

const { notfound, handerError } = require("./middlewares/errorHandler");
const userRoutes = require("./routes/userRoutes.js");
dotenv.config();

const app = express();
dbConnect();
const PORT = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/api/user", userRoutes);
app.use(notfound);
app.use(handerError);
app.listen(PORT, () =>
  console.log(`Server is Running on port  http://localhost:${PORT}`)
);
