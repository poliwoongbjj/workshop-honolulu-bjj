const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { verifyToken, isAdmin } = require("../middleware/auth.middleware");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// All admin routes require admin privileges
router.use(verifyToken, isAdmin);

// Dashboard
router.get("/dashboard", adminController.getDashboardStats);

// User management
router.get("/users", adminController.getUsers);
router.put("/users/:id", adminController.updateUser);
router.put("/users/:userId/membership", adminController.updateMembership);

// Category management
router.get("/categories", adminController.getCategories);
router.post("/categories", adminController.createCategory);
router.put("/categories/:id", adminController.updateCategory);
router.delete("/categories/:id", adminController.deleteCategory);

// Technique management
router.get("/techniques", adminController.getTechniques);
router.post("/techniques", adminController.createTechnique);
router.put("/techniques/:id", adminController.updateTechnique);
router.delete("/techniques/:id", adminController.deleteTechnique);

// File uploads
router.post(
  "/upload/video",
  upload.single("video"),
  adminController.uploadVideo
);
router.post(
  "/upload/thumbnail",
  upload.single("thumbnail"),
  adminController.uploadThumbnail
);

module.exports = router;
