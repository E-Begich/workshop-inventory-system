module.exports = (sequelize, DataTypes) => {


  const Supplier = sequelize.define('Supplier', {
    ID_supplier: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Type: {
      type: DataTypes.ENUM('Fizička osoba', 'Tvrtka'),
      allowNull: false,
    },
  Name: {
    type: DataTypes.STRING(100),
    allowNull: true, // Dozvoljava se null ali se provjerava ručno
    validate: {
      customValidator(value) {
        if (this.Type === 'Tvrtka' && (!value || value.trim() === '')) {
          throw new Error("Naziv tvrtke je obavezan ako je tip 'Tvrtka'.");
        }
      },
    },
  },
    ContactName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    Contact: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    Email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    Adress: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
  }, {
    timestamps: false,
  });

  Supplier.associate = (models) => {
    Supplier.hasMany(models.Materials, {
      foreignKey: 'ID_supplier',
      as: 'Materials'
    });
  };

  return Supplier;
};
