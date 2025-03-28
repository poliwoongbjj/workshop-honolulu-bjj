const express = require("express");
const router = express.Router();
const techniqueController = require("../controllers/technique.controller");
const { verifyToken, hasMembership } = require("../middleware/auth.middleware");

// Public routes (no auth required)
router.get("/filter-options", techniqueController.getFilterOptions);

// Protected routes (auth required)
router.get(
  "/",
  verifyToken,
  hasMembership,
  techniqueController.getAllTechniques
);
router.get("/favorites", verifyToken, techniqueController.getFavorites);
router.get(
  "/:id",
  verifyToken,
  hasMembership,
  techniqueController.getTechniqueById
);
router.get(
  "/:id/related",
  verifyToken,
  hasMembership,
  techniqueController.getRelatedTechniques
);
router.post("/:id/favorite", verifyToken, techniqueController.toggleFavorite);
router.post(
  "/:id/progress",
  verifyToken,
  hasMembership,
  techniqueController.updateProgress
);

module.exports = router;
