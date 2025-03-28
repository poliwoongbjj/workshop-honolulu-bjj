const {
  Technique,
  Category,
  BeltLevel,
  Tag,
  UserFavorite,
  UserProgress,
  User,
} = require("../models");
const { Op } = require("sequelize");

// Get all techniques with optional filtering
exports.getAllTechniques = async (req, res) => {
  try {
    const {
      category,
      belt,
      difficulty,
      position,
      search,
      featured,
      limit = 20,
      offset = 0,
      sort = "newest",
    } = req.query;

    // Build filter conditions
    const where = { is_published: true };

    if (category) {
      where.category_id = category;
    }

    if (belt) {
      where.belt_level_id = belt;
    }

    if (difficulty) {
      where.difficulty_level = difficulty;
    }

    if (position) {
      where.position = position;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    if (featured === "true") {
      where.is_featured = true;
    }

    // Determine sort order
    let order;
    switch (sort) {
      case "oldest":
        order = [["created_at", "ASC"]];
        break;
      case "title_asc":
        order = [["title", "ASC"]];
        break;
      case "title_desc":
        order = [["title", "DESC"]];
        break;
      case "popular":
        order = [["view_count", "DESC"]];
        break;
      case "newest":
      default:
        order = [["created_at", "DESC"]];
        break;
    }

    // Get techniques with associations
    const techniques = await Technique.findAndCountAll({
      where,
      include: [{ model: Category }, { model: BeltLevel }, { model: Tag }],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Check user favorites if authenticated
    let favorites = [];
    if (req.userId) {
      favorites = await UserFavorite.findAll({
        where: { user_id: req.userId },
        attributes: ["technique_id"],
      });
      favorites = favorites.map((fav) => fav.technique_id);
    }

    // Add favorite flag to techniques
    const result = {
      count: techniques.count,
      rows: techniques.rows.map((technique) => {
        const plainTechnique = technique.get({ plain: true });
        return {
          ...plainTechnique,
          isFavorite: favorites.includes(plainTechnique.id),
        };
      }),
    };

    res.json(result);
  } catch (error) {
    console.error("Get techniques error:", error);
    res.status(500).json({ message: "Server error retrieving techniques" });
  }
};

// Get technique by ID
exports.getTechniqueById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get technique with associations
    const technique = await Technique.findByPk(id, {
      include: [{ model: Category }, { model: BeltLevel }, { model: Tag }],
    });

    if (!technique) {
      return res.status(404).json({ message: "Technique not found" });
    }

    // Check if technique is published or user is admin
    if (!technique.is_published && req.userRole !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if user has favorited this technique
    let isFavorite = false;
    let userProgress = null;

    if (req.userId) {
      // Check favorite status
      const favorite = await UserFavorite.findOne({
        where: {
          user_id: req.userId,
          technique_id: id,
        },
      });

      isFavorite = !!favorite;

      // Get user progress
      userProgress = await UserProgress.findOne({
        where: {
          user_id: req.userId,
          technique_id: id,
        },
      });

      // Update last viewed and increment view count
      if (userProgress) {
        await userProgress.update({
          last_viewed: new Date(),
        });
      } else {
        await UserProgress.create({
          user_id: req.userId,
          technique_id: id,
          status: "not_started",
          last_viewed: new Date(),
        });
      }
    }

    // Increment view count
    await technique.increment("view_count");

    // Format response
    const result = {
      ...technique.get({ plain: true }),
      isFavorite,
      userProgress: userProgress ? userProgress.get({ plain: true }) : null,
    };

    res.json(result);
  } catch (error) {
    console.error("Get technique by ID error:", error);
    res.status(500).json({ message: "Server error retrieving technique" });
  }
};

// Toggle favorite status
exports.toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if technique exists
    const technique = await Technique.findByPk(id);
    if (!technique) {
      return res.status(404).json({ message: "Technique not found" });
    }

    // Check if already favorited
    const existingFavorite = await UserFavorite.findOne({
      where: {
        user_id: req.userId,
        technique_id: id,
      },
    });

    if (existingFavorite) {
      // Remove from favorites
      await existingFavorite.destroy();
      return res.json({ isFavorite: false, message: "Removed from favorites" });
    } else {
      // Add to favorites
      await UserFavorite.create({
        user_id: req.userId,
        technique_id: id,
      });
      return res.json({ isFavorite: true, message: "Added to favorites" });
    }
  } catch (error) {
    console.error("Toggle favorite error:", error);
    res.status(500).json({ message: "Server error updating favorite status" });
  }
};

// Update user progress
exports.updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, progress_percentage } = req.body;

    // Check if technique exists
    const technique = await Technique.findByPk(id);
    if (!technique) {
      return res.status(404).json({ message: "Technique not found" });
    }

    // Find or create progress record
    const [userProgress, created] = await UserProgress.findOrCreate({
      where: {
        user_id: req.userId,
        technique_id: id,
      },
      defaults: {
        status: status || "not_started",
        progress_percentage: progress_percentage || 0,
        last_viewed: new Date(),
      },
    });

    if (!created) {
      // Update existing record
      await userProgress.update({
        status: status || userProgress.status,
        progress_percentage:
          progress_percentage !== undefined
            ? progress_percentage
            : userProgress.progress_percentage,
        last_viewed: new Date(),
      });
    }

    res.json({
      message: "Progress updated",
      userProgress: userProgress.get({ plain: true }),
    });
  } catch (error) {
    console.error("Update progress error:", error);
    res.status(500).json({ message: "Server error updating progress" });
  }
};

// Get user's favorite techniques
exports.getFavorites = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    // Get user's favorites
    const favorites = await UserFavorite.findAndCountAll({
      where: { user_id: req.userId },
      include: [
        {
          model: Technique,
          as: "technique",
          include: [{ model: Category }, { model: BeltLevel }],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Format response
    const result = {
      count: favorites.count,
      rows: favorites.rows.map((favorite) => ({
        ...favorite.technique.get({ plain: true }),
        isFavorite: true,
      })),
    };

    res.json(result);
  } catch (error) {
    console.error("Get favorites error:", error);
    res.status(500).json({ message: "Server error retrieving favorites" });
  }
};

// Get related techniques
exports.getRelatedTechniques = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;

    // Get current technique
    const currentTechnique = await Technique.findByPk(id);
    if (!currentTechnique) {
      return res.status(404).json({ message: "Technique not found" });
    }

    // Find related techniques by category and belt level
    const relatedTechniques = await Technique.findAll({
      where: {
        id: { [Op.ne]: id },
        is_published: true,
        [Op.or]: [
          { category_id: currentTechnique.category_id },
          { belt_level_id: currentTechnique.belt_level_id },
          { position: currentTechnique.position },
        ],
      },
      include: [{ model: Category }, { model: BeltLevel }],
      limit: parseInt(limit),
      order: [["view_count", "DESC"]],
    });

    // Check user favorites if authenticated
    let favorites = [];
    if (req.userId) {
      favorites = await UserFavorite.findAll({
        where: { user_id: req.userId },
        attributes: ["technique_id"],
      });
      favorites = favorites.map((fav) => fav.technique_id);
    }

    // Add favorite flag to techniques
    const result = relatedTechniques.map((technique) => {
      const plainTechnique = technique.get({ plain: true });
      return {
        ...plainTechnique,
        isFavorite: favorites.includes(plainTechnique.id),
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Get related techniques error:", error);
    res
      .status(500)
      .json({ message: "Server error retrieving related techniques" });
  }
};

// Get filter options (categories, belt levels, positions)
exports.getFilterOptions = async (req, res) => {
  try {
    // Get all categories
    const categories = await Category.findAll({
      order: [["name", "ASC"]],
    });

    // Get all belt levels
    const beltLevels = await BeltLevel.findAll({
      order: [["order_rank", "ASC"]],
    });

    // Get distinct positions from techniques
    const positions = await Technique.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("position")), "position"],
      ],
      where: {
        position: {
          [Op.ne]: null,
        },
      },
      order: [["position", "ASC"]],
    });

    res.json({
      categories,
      beltLevels,
      positions: positions.map((p) => p.position),
      difficultyLevels: ["beginner", "intermediate", "advanced"],
    });
  } catch (error) {
    console.error("Get filter options error:", error);
    res.status(500).json({ message: "Server error retrieving filter options" });
  }
};
