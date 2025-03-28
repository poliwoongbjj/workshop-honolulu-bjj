const {
  User,
  Technique,
  Category,
  BeltLevel,
  Membership,
  Tag,
} = require("../models");
const sequelize = require("../config/db.config");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
const util = require("util");
const mkdir = util.promisify(fs.mkdir);

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    // User stats
    const totalUsers = await User.count();
    const activeMembers = await Membership.count({
      where: {
        status: "active",
        end_date: {
          [Op.gte]: new Date(),
        },
      },
    });

    // Content stats
    const totalTechniques = await Technique.count();
    const totalCategories = await Category.count();

    // Recent users
    const recentUsers = await User.findAll({
      order: [["created_at", "DESC"]],
      limit: 5,
      attributes: { exclude: ["password"] },
    });

    // Popular techniques
    const popularTechniques = await Technique.findAll({
      order: [["view_count", "DESC"]],
      limit: 5,
      include: [{ model: Category }],
    });

    // Monthly user registrations
    const userRegistrationsByMonth = await User.findAll({
      attributes: [
        [sequelize.fn("YEAR", sequelize.col("created_at")), "year"],
        [sequelize.fn("MONTH", sequelize.col("created_at")), "month"],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: [
        sequelize.fn("YEAR", sequelize.col("created_at")),
        sequelize.fn("MONTH", sequelize.col("created_at")),
      ],
      order: [
        [sequelize.fn("YEAR", sequelize.col("created_at")), "DESC"],
        [sequelize.fn("MONTH", sequelize.col("created_at")), "DESC"],
      ],
      limit: 12,
    });

    res.json({
      stats: {
        totalUsers,
        activeMembers,
        totalTechniques,
        totalCategories,
      },
      recentUsers,
      popularTechniques,
      userRegistrationsByMonth,
    });
  } catch (error) {
    console.error("Admin dashboard stats error:", error);
    res
      .status(500)
      .json({ message: "Server error retrieving dashboard stats" });
  }
};

// Manage users
exports.getUsers = async (req, res) => {
  try {
    const { search, role, sort = "newest", limit = 20, offset = 0 } = req.query;

    // Build query conditions
    const where = {};

    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
      ];
    }

    if (role) {
      where.role = role;
    }

    // Determine sort order
    let order;
    switch (sort) {
      case "oldest":
        order = [["created_at", "ASC"]];
        break;
      case "username":
        order = [["username", "ASC"]];
        break;
      case "newest":
      default:
        order = [["created_at", "DESC"]];
        break;
    }

    // Get users
    const users = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password"] },
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{ model: Membership }],
    });

    res.json(users);
  } catch (error) {
    console.error("Admin get users error:", error);
    res.status(500).json({ message: "Server error retrieving users" });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, firstName, lastName, role } = req.body;

    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check for unique username and email
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // Update user
    await user.update({
      username: username || user.username,
      email: email || user.email,
      first_name: firstName || user.first_name,
      last_name: lastName || user.last_name,
      role: role || user.role,
    });

    res.json({
      message: "User updated successfully",
      user: {
        ...user.get({ plain: true }),
        password: undefined,
      },
    });
  } catch (error) {
    console.error("Admin update user error:", error);
    res.status(500).json({ message: "Server error updating user" });
  }
};

// Manage memberships
exports.updateMembership = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, startDate, endDate, membershipType } = req.body;

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find existing membership
    const [membership, created] = await Membership.findOrCreate({
      where: { user_id: userId },
      defaults: {
        status: status || "active",
        start_date: startDate || new Date(),
        end_date:
          endDate || new Date(new Date().setMonth(new Date().getMonth() + 1)),
        membership_type: membershipType || "monthly",
      },
    });

    if (!created) {
      // Update existing membership
      await membership.update({
        status: status || membership.status,
        start_date: startDate || membership.start_date,
        end_date: endDate || membership.end_date,
        membership_type: membershipType || membership.membership_type,
      });
    }

    res.json({
      message: "Membership updated successfully",
      membership: membership.get({ plain: true }),
    });
  } catch (error) {
    console.error("Admin update membership error:", error);
    res.status(500).json({ message: "Server error updating membership" });
  }
};

// Manage categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [["name", "ASC"]],
    });

    res.json(categories);
  } catch (error) {
    console.error("Admin get categories error:", error);
    res.status(500).json({ message: "Server error retrieving categories" });
  }
};

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if category exists
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    // Create category
    const category = await Category.create({
      name,
      description,
    });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Admin create category error:", error);
    res.status(500).json({ message: "Server error creating category" });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Find category
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if name exists (if changed)
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ where: { name } });
      if (existingCategory) {
        return res
          .status(400)
          .json({ message: "Category name already exists" });
      }
    }

    // Update category
    await category.update({
      name: name || category.name,
      description: description || category.description,
    });

    res.json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Admin update category error:", error);
    res.status(500).json({ message: "Server error updating category" });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Find category
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if category is in use
    const techniqueCount = await Technique.count({
      where: { category_id: id },
    });
    if (techniqueCount > 0) {
      return res.status(400).json({
        message: "Cannot delete category that is in use",
        techniqueCount,
      });
    }

    // Delete category
    await category.destroy();

    res.json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete category error:", error);
    res.status(500).json({ message: "Server error deleting category" });
  }
};

// Manage techniques
exports.getTechniques = async (req, res) => {
  try {
    const {
      search,
      category,
      belt,
      published,
      sort = "newest",
      limit = 20,
      offset = 0,
    } = req.query;

    // Build query conditions
    const where = {};

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    if (category) {
      where.category_id = category;
    }

    if (belt) {
      where.belt_level_id = belt;
    }

    if (published !== undefined) {
      where.is_published = published === "true";
    }

    // Determine sort order
    let order;
    switch (sort) {
      case "oldest":
        order = [["created_at", "ASC"]];
        break;
      case "title":
        order = [["title", "ASC"]];
        break;
      case "popular":
        order = [["view_count", "DESC"]];
        break;
      case "newest":
      default:
        order = [["created_at", "DESC"]];
        break;
    }

    // Get techniques
    const techniques = await Technique.findAndCountAll({
      where,
      include: [{ model: Category }, { model: BeltLevel }, { model: Tag }],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json(techniques);
  } catch (error) {
    console.error("Admin get techniques error:", error);
    res.status(500).json({ message: "Server error retrieving techniques" });
  }
};

// Create technique
exports.createTechnique = async (req, res) => {
  try {
    const {
      title,
      description,
      videoUrl,
      thumbnailUrl,
      categoryId,
      beltLevelId,
      position,
      instructor,
      difficultyLevel,
      isFeatured,
      isPublished,
      tags,
    } = req.body;

    // Create technique
    const technique = await Technique.create({
      title,
      description,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      category_id: categoryId,
      belt_level_id: beltLevelId,
      position,
      instructor: instructor || "Larry Hope",
      difficulty_level: difficultyLevel,
      is_featured: isFeatured === true,
      is_published: isPublished !== false,
    });

    // Add tags if provided
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Find or create tag
        const [tag] = await Tag.findOrCreate({
          where: { name: tagName.trim() },
        });

        // Associate tag with technique
        await technique.addTag(tag);
      }
    }

    // Get technique with associations
    const createdTechnique = await Technique.findByPk(technique.id, {
      include: [{ model: Category }, { model: BeltLevel }, { model: Tag }],
    });

    res.status(201).json({
      message: "Technique created successfully",
      technique: createdTechnique,
    });
  } catch (error) {
    console.error("Admin create technique error:", error);
    res.status(500).json({ message: "Server error creating technique" });
  }
};

// Update technique
exports.updateTechnique = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      videoUrl,
      thumbnailUrl,
      categoryId,
      beltLevelId,
      position,
      instructor,
      difficultyLevel,
      isFeatured,
      isPublished,
      tags,
    } = req.body;

    // Find technique
    const technique = await Technique.findByPk(id);
    if (!technique) {
      return res.status(404).json({ message: "Technique not found" });
    }

    // Update technique
    await technique.update({
      title: title || technique.title,
      description:
        description !== undefined ? description : technique.description,
      video_url: videoUrl || technique.video_url,
      thumbnail_url:
        thumbnailUrl !== undefined ? thumbnailUrl : technique.thumbnail_url,
      category_id: categoryId || technique.category_id,
      belt_level_id: beltLevelId || technique.belt_level_id,
      position: position !== undefined ? position : technique.position,
      instructor: instructor || technique.instructor,
      difficulty_level: difficultyLevel || technique.difficulty_level,
      is_featured:
        isFeatured !== undefined ? isFeatured : technique.is_featured,
      is_published:
        isPublished !== undefined ? isPublished : technique.is_published,
    });

    // Update tags if provided
    if (tags) {
      // Remove existing tags
      await technique.setTags([]);

      // Add new tags
      for (const tagName of tags) {
        // Find or create tag
        const [tag] = await Tag.findOrCreate({
          where: { name: tagName.trim() },
        });

        // Associate tag with technique
        await technique.addTag(tag);
      }
    }

    // Get updated technique with associations
    const updatedTechnique = await Technique.findByPk(id, {
      include: [{ model: Category }, { model: BeltLevel }, { model: Tag }],
    });

    res.json({
      message: "Technique updated successfully",
      technique: updatedTechnique,
    });
  } catch (error) {
    console.error("Admin update technique error:", error);
    res.status(500).json({ message: "Server error updating technique" });
  }
};

// Delete technique
exports.deleteTechnique = async (req, res) => {
  try {
    const { id } = req.params;

    // Find technique
    const technique = await Technique.findByPk(id);
    if (!technique) {
      return res.status(404).json({ message: "Technique not found" });
    }

    // Delete technique
    await technique.destroy();

    res.json({
      message: "Technique deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete technique error:", error);
    res.status(500).json({ message: "Server error deleting technique" });
  }
};

// Upload video file
exports.uploadVideo = async (req, res) => {
  try {
    // Handle file upload logic here using multer or another library
    // This is a placeholder for the actual implementation

    if (!req.file) {
      return res.status(400).json({ message: "No video file uploaded" });
    }

    const uploadDir = path.join(__dirname, "../uploads/videos");

    // Create directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      if (err.code !== "EEXIST") {
        throw err;
      }
    }

    // Generate filename and save file
    const filename = `${Date.now()}-${req.file.originalname}`;
    const filepath = path.join(uploadDir, filename);

    // Save file
    fs.writeFileSync(filepath, req.file.buffer);

    // Return file URL
    const fileUrl = `/uploads/videos/${filename}`;

    res.json({
      message: "Video uploaded successfully",
      url: fileUrl,
    });
  } catch (error) {
    console.error("Admin upload video error:", error);
    res.status(500).json({ message: "Server error uploading video" });
  }
};

// Upload thumbnail image
exports.uploadThumbnail = async (req, res) => {
  try {
    // Handle file upload logic here using multer or another library
    // This is a placeholder for the actual implementation

    if (!req.file) {
      return res.status(400).json({ message: "No thumbnail file uploaded" });
    }

    const uploadDir = path.join(__dirname, "../uploads/thumbnails");

    // Create directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      if (err.code !== "EEXIST") {
        throw err;
      }
    }

    // Generate filename and save file
    const filename = `${Date.now()}-${req.file.originalname}`;
    const filepath = path.join(uploadDir, filename);

    // Save file
    fs.writeFileSync(filepath, req.file.buffer);

    // Return file URL
    const fileUrl = `/uploads/thumbnails/${filename}`;

    res.json({
      message: "Thumbnail uploaded successfully",
      url: fileUrl,
    });
  } catch (error) {
    console.error("Admin upload thumbnail error:", error);
    res.status(500).json({ message: "Server error uploading thumbnail" });
  }
};
