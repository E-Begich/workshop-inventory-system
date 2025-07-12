module.exports = (sequelize, DataTypes) => {

  
  const OfferItems = sequelize.define('OfferItems', {
    ID_offerItem: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_offer: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Offer',
        key: 'ID_offer',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    TypeItem: {
      type: DataTypes.ENUM('Materijal', 'Usluga'),
      allowNull: false,
    },
    ID_material: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Materials',
        key: 'ID_material',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    ID_service: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Service',
        key: 'ID_service',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    Amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    PriceNoTax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    Tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    PriceTax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  }, {
    timestamps: false,
  });

  return OfferItems;
};
