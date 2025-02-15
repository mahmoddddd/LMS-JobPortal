const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../config/validateMongoDb");
const APIFeatures = require("../utils/apiFeatures");
const { default: slugify } = require("slugify");

const createOne = (Model) =>
  asyncHandler(async (req, res) => {
    // Generate slug if title is provided
    if (req.body.name) {
      req.body.slug = slugify(req.body.name.toLowerCase());
    } else {
      // If title is not provided, return an error
      return res.status(400).json({
        status: false,
        message: "Name is required to generate a slug",
      });
    }
    req.body.userId = req.user._id;
    // Create the document
    const data = await Model.create(req.body);

    // Send success response
    res.status(201).json({
      status: true,
      message: "Created successfully",
      data,
    });
  });
const updateOne = (Model) =>
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    if (req.body.name) {
      req.body.slug = slugify(req.body.name.toLowerCase());
    } else {
      // If title is not provided, return an error
      return res.status(400).json({
        status: false,
        message: "Name is required to generate a slug",
      });
    }
    const exists = await Model.exists({ _id: id });
    if (!exists) {
      return res
        .status(404)
        .json({ status: false, message: "Record not found" });
    }

    const data = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: true,
      message: "Updated successfully",
      data,
    });
  });

const deleteOne = (Model) =>
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    const exists = await Model.exists({ _id: id });
    if (!exists) {
      return res
        .status(404)
        .json({ status: false, message: "Record not found" });
    }

    await Model.findByIdAndDelete(id);
    res.status(200).json({
      status: true,
      message: "Deleted successfully",
    });
  });
const getOne = (Model, populateOptions) =>
  asyncHandler(async (req, res, next) => {
    try {
      const { id, slug } = req.params;

      let query;

      if (id) {
        if (!validateMongoDbId(id)) {
          return res.status(400).json({ status: false, message: "Invalid ID" });
        }
        query = Model.findById(id);
      } else if (slug) {
        query = Model.findOne({ slug });
      }

      if (!query) {
        return res
          .status(400)
          .json({ status: false, message: "ID or Slug is required" });
      }

      if (populateOptions) {
        query = query.populate(populateOptions);
      }

      const data = await query;

      if (!data) {
        return res
          .status(404)
          .json({ status: false, message: "No data found" });
      }

      res.status(200).json({
        status: true,
        message: "Fetch successful",
        data,
      });
    } catch (error) {
      next(error);
    }
  });

const getAll = (Model) =>
  asyncHandler(async (req, res, next) => {
    try {
      let filter = {};
      const features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
      const data = await features.query;

      res.status(200).json({
        status: true,
        message: "Fetched successfully",
        count: data.length,
        data,
      });
    } catch (error) {
      next(error);
    }
  });

module.exports = { createOne, updateOne, getOne, deleteOne, getAll };
