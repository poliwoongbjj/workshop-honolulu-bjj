module.exports = (sequelize, DataTypes) => {
  const UserFavorite = sequelize.define(
    "UserFavorite",
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      technique_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: "techniques",
          key: "id",
        },
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "user_favorites",
      timestamps: false,
    }
  );

  return UserFavorite;
};
