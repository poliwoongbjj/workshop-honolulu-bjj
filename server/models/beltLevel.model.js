module.exports = (sequelize, DataTypes) => {
  const BeltLevel = sequelize.define(
    "BeltLevel",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      order_rank: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "belt_levels",
      timestamps: false,
    }
  );

  return BeltLevel;
};
