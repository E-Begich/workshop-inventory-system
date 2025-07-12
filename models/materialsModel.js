module.exports = (sequelize, DataTypes) => {

  
  const Materials = sequelize.define('Materials', {
    ID_material: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    NameMaterial: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    CodeMaterial: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    Amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    Unit: {
      type: DataTypes.ENUM('Metri', 'Centimetri'),
      allowNull: false,
    },
    Location: {
      type: DataTypes.ENUM('Skladište 1', 'Skladište 2', 'Skladište 3'),
      allowNull: false,
    },
    Description: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    MinAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    PurchasePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    SellingPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    TypeChange: {
      type: DataTypes.ENUM('Nabava', 'Promocija', 'Restlovi'),
      allowNull: false,
    },
    ID_supplier: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Suppliers',
        key: 'ID_supplier',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
  }, {
    timestamps: false,
  });

  return Materials;
};
