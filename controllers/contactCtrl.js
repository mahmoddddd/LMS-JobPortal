const asyncHandler = require("express-async-handler");
const Contact = require("../models/contactModel");
const validateMongoDbId = require("../config/validateMongoDb");

// Create a new contact
const postContact = asyncHandler(async (req, res) => {
  try {
    const { name, email, mobile, comment, profession, subject } = req.body;

    // Validate required fields
    if (!name || !email || !mobile || !comment || !profession || !subject) {
      return res.status(400).json({
        status: false,
        message:
          "All fields are required: name, email, mobile, comment, profession, subject",
      });
    }

    // Create the contact object
    const newContact = await Contact.create({
      name,
      email,
      mobile,
      comment,
      profession,
      subject,
    });

    res.status(201).json({
      status: true,
      message: "Contact created successfully",
      contact: newContact,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

// Get all contacts
const getAllContacts = asyncHandler(async (req, res) => {
  try {
    const allContacts = await Contact.find();
    res.status(200).json(allContacts);
  } catch (error) {
    res.status(404).json({
      status: false,
      message: "Contacts not found",
    });
  }
});

// Get a single contact by ID
const getContact = asyncHandler(async (req, res) => {
  const { id } = req.params; // Contact ID from request parameters
  validateMongoDbId(id);

  try {
    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        status: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Contact found",
      contact,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error fetching contact: " + error.message,
    });
  }
});

// Update a contact by ID
const updateContactStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const { status } = req.body; // Assuming you want to update the status of the contact

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        status: false,
        message: "Contact not found",
      });
    }

    if (status) {
      contact.status = status;
    }

    const updatedContact = await contact.save();

    res.status(200).json({
      status: true,
      message: "Contact updated successfully",
      updatedContact,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error updating contact: " + error.message,
    });
  }
});

// Delete a contact by ID
const deleteContact = asyncHandler(async (req, res) => {
  const { id } = req.params; // Contact ID from request parameters
  validateMongoDbId(id);

  try {
    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      return res.status(404).json({
        status: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error deleting contact: " + error.message,
    });
  }
});

module.exports = {
  postContact,
  getAllContacts,
  getContact,
  updateContactStatus,
  deleteContact,
};
