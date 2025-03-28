module.exports = (sequelize, DataTypes) => {
  const Membership = sequelize.define(
    "Membership",
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
      status: {
        type: DataTypes.ENUM("active", "expired", "cancelled"),
        defaultValue: "active",
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      membership_type: {
        type: DataTypes.ENUM("monthly", "quarterly", "annual"),
        allowNull: false,
      },
      payment_info: {
        type: DataTypes.JSON,
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
      tableName: "memberships",
      timestamps: false,
    }
  );

  return Membership;
};
