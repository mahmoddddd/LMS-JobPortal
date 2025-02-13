const Work = require("../models/workWithUsModel");

const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../config/validateMongoDb");
const { createOne, updateOne } = require("./customCtrl");

const postDetails = createOne(Work);
const updateDetails = updateOne(Work);

module.exports = {
  postDetails,
  updateDetails,
};
