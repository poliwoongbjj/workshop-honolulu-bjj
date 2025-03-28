const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const userController = require("../controllers/user.controller");

// Get user profile
router.get("/profile", verifyToken, userController.getProfile);

// Update user profile
router.put("/profile", verifyToken, userController.updateProfile);

// Change password
router.put("/password", verifyToken, userController.changePassword);

// Get user progress
router.get("/progress", verifyToken, userController.getUserProgress);

// Get user favorites
router.get("/favorites", verifyToken, userController.getUserFavorites);

// Get user notes
router.get("/notes", verifyToken, userController.getUserNotes);

// Add/update note for a technique
router.post("/notes/:techniqueId", verifyToken, userController.updateNote);

// Delete note for a technique
router.delete("/notes/:techniqueId", verifyToken, userController.deleteNote);

module.exports = router;
