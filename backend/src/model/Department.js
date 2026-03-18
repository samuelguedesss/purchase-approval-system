import { Model, DataTypes } from "sequelize";

export default class Department extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: DataTypes.STRING(100),
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
        sequelize,
        tableName: "departments",
        underscored: true,
        timestamps: false,
      }
    );
  }

  static associate(models) {
    this.hasMany(models.User, {
      foreignKey: "department_id",
      as: "users",
    });

    this.hasMany(models.PurchaseRequest, {
      foreignKey: "department_id",
      as: "purchaseRequests",
    });
  }
}
