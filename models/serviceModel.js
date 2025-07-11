module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define('Service', {
    ID_service: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    Description: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    PriceNoTax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    Tax: {
      type: DataTypes.DECIMAL(5, 2), // unos postotka, npr. 25.00 za 25%
      allowNull: false,
    },
    PriceTax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  }, {
    timestamps: false,
  });

  return Service;
};
