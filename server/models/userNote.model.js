module.exports = (sequelize, DataTypes) => {
  const UserNote = sequelize.define(
    "UserNote",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      technique_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "techniques",
          key: "id",
        },
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: false,
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
      tableName: "user_notes",
      timestamps: false,
    }
  );

  return UserNote;
};
