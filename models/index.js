const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];

const Product = require("./product");
const Category = require("./category");
const Image = require("./image");
const User = require("./user");

const db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.Product = Product;
db.Category = Category;
db.Image = Image;
db.User = User;

Product.init(sequelize);
Category.init(sequelize);
Image.init(sequelize);
User.init(sequelize);

Product.associate(db);
Category.associate(db);
Image.associate(db);
User.associate(db);

module.exports = db;
