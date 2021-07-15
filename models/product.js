const Sequelize = require("sequelize");

module.exports = class Product extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        product_name: {
          type: Sequelize.STRING(200),
          allowNull: false,
          default: "",
        },
        product_price: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
          default: 0,
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "Product",
        tableName: "products",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Product.belongsTo(db.Category, { foreignKey: "category_id", targetKEy: "id" });
    db.Product.hasMany(db.Image, { foreignKey: "product_id", sourceKey: "id" });
  }
};
