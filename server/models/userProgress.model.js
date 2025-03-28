module.exports = (sequelize, DataTypes) => {
  const UserProgress = sequelize.define(
    "UserProgress",
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
      status: {
        type: DataTypes.ENUM("not_started", "in_progress", "completed"),
        defaultValue: "not_started",
      },
      last_viewed: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      progress_percentage: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      tableName: "user_progress",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["user_id", "technique_id"],
        },
      ],
    }
  );

  return UserProgress;
};
