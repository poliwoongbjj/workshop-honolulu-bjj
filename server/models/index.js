const sequelize = require("../config/db.config");
const { DataTypes } = require("sequelize");

// Import models
const User = require("./user.model")(sequelize, DataTypes);
const Membership = require("./membership.model")(sequelize, DataTypes);
const Category = require("./category.model")(sequelize, DataTypes);
const BeltLevel = require("./beltLevel.model")(sequelize, DataTypes);
const Technique = require("./technique.model")(sequelize, DataTypes);
const Tag = require("./tag.model")(sequelize, DataTypes);
const UserFavorite = require("./userFavorite.model")(sequelize, DataTypes);
const UserNote = require("./userNote.model")(sequelize, DataTypes);
const UserProgress = require("./userProgress.model")(sequelize, DataTypes);

// Define associations
User.hasOne(Membership, { foreignKey: "user_id" });
Membership.belongsTo(User, { foreignKey: "user_id" });

Category.hasMany(Technique, { foreignKey: "category_id" });
Technique.belongsTo(Category, { foreignKey: "category_id" });

BeltLevel.hasMany(Technique, { foreignKey: "belt_level_id" });
Technique.belongsTo(BeltLevel, { foreignKey: "belt_level_id" });

// Many-to-many: Techniques and Tags
Technique.belongsToMany(Tag, {
  through: "technique_tags",
  foreignKey: "technique_id",
});
Tag.belongsToMany(Technique, {
  through: "technique_tags",
  foreignKey: "tag_id",
});

// Many-to-many: Users and Favorite Techniques
User.belongsToMany(Technique, {
  through: UserFavorite,
  foreignKey: "user_id",
  as: "favorites",
});
Technique.belongsToMany(User, {
  through: UserFavorite,
  foreignKey: "technique_id",
  as: "favoritedBy",
});

// User notes on techniques
User.hasMany(UserNote, { foreignKey: "user_id" });
UserNote.belongsTo(User, { foreignKey: "user_id" });
Technique.hasMany(UserNote, { foreignKey: "technique_id" });
UserNote.belongsTo(Technique, { foreignKey: "technique_id" });

// User progress on techniques
User.hasMany(UserProgress, { foreignKey: "user_id" });
UserProgress.belongsTo(User, { foreignKey: "user_id" });
Technique.hasMany(UserProgress, { foreignKey: "technique_id" });
UserProgress.belongsTo(Technique, { foreignKey: "technique_id" });

module.exports = {
  sequelize,
  User,
  Membership,
  Category,
  BeltLevel,
  Technique,
  Tag,
  UserFavorite,
  UserNote,
  UserProgress,
};
