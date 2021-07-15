const Sequelize = require("sequelize");

module.exports = class Category extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        category1: {
          type: Sequelize.STRING(100),
          allowNull: false,
          default: "",
        },
        category2: {
          type: Sequelize.STRING(100),
          allowNull: false,
          default: "",
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "Category",
        tableName: "Categories",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Category.hasMany(db.Product, { foreignKey: "category_id", sourceKey: "id" });
  }
};
