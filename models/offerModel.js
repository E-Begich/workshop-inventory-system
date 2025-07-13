module.exports = (sequelize, DataTypes) => {

  
  const Offer = sequelize.define('Offer', {
    ID_offer: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_client: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Clients',
        key: 'ID_client',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    DateCreate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    DateEnd: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      // Postavit ćeš ovo ručno prilikom unosa – vidi dolje
    },
    ID_user: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'ID_user',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  }, {
    timestamps: false,
  });

  Offer.associate = (models) => {
  Offer.belongsTo(models.Client, {
    foreignKey: 'ID_client',
    as: 'Client'
  });

  Offer.belongsTo(models.User, {
    foreignKey: 'ID_user',
    as: 'User'
  });

  Offer.hasMany(models.OfferItems, {
    foreignKey: 'ID_offer',
    as: 'OfferItems'
  });

  Offer.hasMany(models.Receipt, {
    foreignKey: 'ID_offer',
    as: 'Receipts'
  });
};


  return Offer;
};
