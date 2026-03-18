import { Model, DataTypes } from "sequelize";

export default class User extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: DataTypes.STRING(150),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(150),
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        role: {
          type: DataTypes.ENUM(
            "USER",
            "COORDINATOR",
            "GENERAL_MANAGER",
            "COORDINATION_FINANCE"
          ),
          allowNull: false,
        },
        department_id: {
          type: DataTypes.INTEGER,
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
        sequelize,
        tableName: "users",
        underscored: true,
        timestamps: false,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Department, {
      foreignKey: "department_id",
      as: "department",
    });

    this.hasMany(models.PurchaseRequest, {
      foreignKey: "user_id",
      as: "purchaseRequests",
    });
  }
}
