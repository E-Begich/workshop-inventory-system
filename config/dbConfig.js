const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("ebegic1", "ebegic1", "11", {
  host: "student.veleri.hr",
  dialect: "mysql",
  dialectModule: require("mysql2"),
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: false // Ako ne želiš da automatski dodaje `createdAt` i `updatedAt`
  }
});

module.exports = sequelize;
