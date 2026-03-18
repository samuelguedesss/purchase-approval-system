import { Model, DataTypes } from "sequelize";

export default class PurchaseRequest extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },

        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },

        department_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },

        product_name: {
          type: DataTypes.STRING(200),
          allowNull: false,
        },

        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },

        amount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },

        payment_method: {
          type: DataTypes.ENUM(
            "PIX",
            "CREDIT_CARD",
            "DEBIT_CARD",
            "BOLETO",
            "TRANSFER"
          ),
          allowNull: false,
        },
        
        coordinator_status: {
          type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
          defaultValue: "PENDING",
        },

        general_manager_status: {
          type: DataTypes.ENUM(
            "PENDING",
            "APPROVED",
            "REJECTED",
            "SKIPPED"
          ),
          defaultValue: "PENDING",
        },

        finance_status: {
          type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
          defaultValue: "PENDING",
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
        tableName: "purchase_requests",
        underscored: true,
        timestamps: false,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });

    this.belongsTo(models.Department, {
      foreignKey: "department_id",
      as: "department",
    });
  }
}
