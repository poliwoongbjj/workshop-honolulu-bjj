module.exports = (sequelize, DataTypes) => {
  const Technique = sequelize.define(
    "Technique",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      video_url: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      thumbnail_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "categories",
          key: "id",
        },
      },
      belt_level_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "belt_levels",
          key: "id",
        },
      },
      position: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      instructor: {
        type: DataTypes.STRING(100),
        defaultValue: "Larry Hope",
      },
      difficulty_level: {
        type: DataTypes.ENUM("beginner", "intermediate", "advanced"),
        allowNull: false,
      },
      is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_published: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      view_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "techniques",
      timestamps: false,
      indexes: [
        {
          fields: ["category_id"],
        },
        {
          fields: ["belt_level_id"],
        },
        {
          fields: ["difficulty_level"],
        },
        {
          fields: ["is_featured"],
        },
        {
          fields: ["is_published"],
        },
      ],
    }
  );

  // Define associations in models/index.js
  Technique.associate = (models) => {
    // Belongs to a category
    Technique.belongsTo(models.Category, {
      foreignKey: "category_id",
      as: "Category",
    });

    // Belongs to a belt level
    Technique.belongsTo(models.BeltLevel, {
      foreignKey: "belt_level_id",
      as: "BeltLevel",
    });

    // Many-to-many relationship with tags
    Technique.belongsToMany(models.Tag, {
      through: "technique_tags",
      foreignKey: "technique_id",
      otherKey: "tag_id",
      as: "Tags",
    });

    // Many-to-many relationship with users (favorites)
    Technique.belongsToMany(models.User, {
      through: models.UserFavorite,
      foreignKey: "technique_id",
      otherKey: "user_id",
      as: "FavoritedBy",
    });

    // Has many user notes
    Technique.hasMany(models.UserNote, {
      foreignKey: "technique_id",
      as: "Notes",
    });

    // Has many user progress records
    Technique.hasMany(models.UserProgress, {
      foreignKey: "technique_id",
      as: "Progress",
    });
  };

  return Technique;
};
