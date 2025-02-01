const express = require("express");
const router = express.Router();
const { isAuth, isAdmin } = require("../middlewares/authMiddleware");
const {
  postContact,
  getAllContacts,
  getContact,
  updateContactStatus,
  deleteContact,
} = require("../controllers/contactCtrl");

// Public route (no authentication required)
router.post("/post-contact", postContact); // Create a new contact

// Protected routes (authentication and admin role required)
router.get("/get-all-contacts", isAuth, isAdmin, getAllContacts); // Get all contacts
router.get("/get-contact/:id", isAuth, isAdmin, getContact); // Get a contact by ID
router.put("/update-contact/:id", isAuth, isAdmin, updateContactStatus); // Update a contact by ID
router.delete("/delete-contact/:id", isAuth, isAdmin, deleteContact); // Delete a contact by ID

module.exports = router;
