const {
  User,
  Membership,
  UserProgress,
  UserFavorite,
  UserNote,
  Technique,
} = require("../models");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ["password"] },
      include: [{ model: Membership }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, username } = req.body;

    // Find user
    const user = await User.findByPk(req.userId);
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
      first_name: firstName || user.first_name,
      last_name: lastName || user.last_name,
      email: email || user.email,
      username: username || user.username,
    });

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        profilePicture: user.profile_picture,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find user
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await user.update({ password: hashedPassword });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error changing password" });
  }
};

// Get user progress
exports.getUserProgress = async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;

    // Build query conditions
    const where = { user_id: req.userId };
    if (status) {
      where.status = status;
    }

    // Get progress with techniques
    const progress = await UserProgress.findAndCountAll({
      where,
      include: [
        {
          model: Technique,
          include: [
            { model: Category, as: "Category" },
            { model: BeltLevel, as: "BeltLevel" },
          ],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["last_viewed", "DESC"]],
    });

    res.json(progress);
  } catch (error) {
    console.error("Get user progress error:", error);
    res.status(500).json({ message: "Server error fetching progress" });
  }
};

// Get user favorites
exports.getUserFavorites = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    // Get favorites with techniques
    const favorites = await UserFavorite.findAndCountAll({
      where: { user_id: req.userId },
      include: [
        {
          model: Technique,
          as: "technique",
          include: [
            { model: Category, as: "Category" },
            { model: BeltLevel, as: "BeltLevel" },
          ],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
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

// Get user notes
exports.getUserNotes = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    // Get notes with techniques
    const notes = await UserNote.findAndCountAll({
      where: { user_id: req.userId },
      include: [
        {
          model: Technique,
          include: [
            { model: Category, as: "Category" },
            { model: BeltLevel, as: "BeltLevel" },
          ],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["updated_at", "DESC"]],
    });

    res.json(notes);
  } catch (error) {
    console.error("Get user notes error:", error);
    res.status(500).json({ message: "Server error retrieving notes" });
  }
};

// Update note for a technique
exports.updateNote = async (req, res) => {
  try {
    const { techniqueId } = req.params;
    const { note } = req.body;

    // Check if technique exists
    const technique = await Technique.findByPk(techniqueId);
    if (!technique) {
      return res.status(404).json({ message: "Technique not found" });
    }

    // Find or create note
    const [userNote, created] = await UserNote.findOrCreate({
      where: {
        user_id: req.userId,
        technique_id: techniqueId,
      },
      defaults: {
        note,
      },
    });

    if (!created) {
      // Update existing note
      await userNote.update({ note });
    }

    res.json({
      message: created
        ? "Note created successfully"
        : "Note updated successfully",
      userNote,
    });
  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({ message: "Server error updating note" });
  }
};

// Delete note for a technique
exports.deleteNote = async (req, res) => {
  try {
    const { techniqueId } = req.params;

    // Find note
    const note = await UserNote.findOne({
      where: {
        user_id: req.userId,
        technique_id: techniqueId,
      },
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Delete note
    await note.destroy();

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ message: "Server error deleting note" });
  }
};
