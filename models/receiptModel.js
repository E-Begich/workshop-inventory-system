module.exports = (sequelize, DataTypes) => {

  
  const Receipt = sequelize.define('Receipt', {
    ID_receipt: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ReceiptNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    ID_client: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Clients',
        key: 'ID_client',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    DateCreate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    PriceNoTax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    Tax: {
      type: DataTypes.DECIMAL(5, 2), // npr. 25.00 za 25%
      allowNull: false,
    },
    PriceTax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    ID_offer: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Offers',
        key: 'ID_offer',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  }, {
    timestamps: false,
  });

  return Receipt;
};
