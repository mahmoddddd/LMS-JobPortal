const Work = require("../models/workWithUsModel");
const {
  createOne,
  updateOne,
  deleteOne,
  getOne,
  getAll,
} = require("./customCtrl");

const postDetails = createOne(Work);
const updateDetails = updateOne(Work);
const deletedDetails = deleteOne(Work);
const getOneDetail = getOne(Work);
const getAllDetails = getAll(Work);
module.exports = {
  postDetails,
  updateDetails,
  deletedDetails,
  getOneDetail,
  getAllDetails,
};
