const db = require('../models')

//creating main models
const User = db.User
const Client = db.Client
const Service = db.Service
const Supplier = db.Supplier
const Materials = db.Materials
const Receipt = db.Receipt
const ReceiptItems = db.ReceiptItems
const Offer = db.Offer
const OfferItems = db.OfferItems
const WarehouseChange = db.WarehouseChange

//1. create user 
const addUser = async (req, res) => {

    let info = {
        ID_user: req.body.ID_user,
        Name: req.body.Name,
        Lastname: req.body.Lastname,
        Email: req.body.Email,
        Password: req.body.Password,
        Role: req.body.Role
    }

    const user = await User.create(info)
    res.status(200).send(user)
    console.log(user)
}

// 2. Gets all users from table
const getAllUsers = async (req, res) => {
    let user = await User.findAll({})
    res.send(user)
}

//3. Get one user over id
const getOneUser = async (req, res) => {

    let ID_user = req.params.ID_user
    let user = await User.findOne({ where: { ID_user: ID_user}})
    res.status(200).send(user)
}

//4. update user over id
const updateUser = async (req, res) => {
    let ID_user = req.params.ID_user
    const user = await User.update(req.body, {where: { ID_user: ID_user }})
    res.status(200).send(user)
}

//5. delete user by id
const deleteUser = async (req, res) => {

    let ID_user = req.params.ID_user
    await User.destroy({where: { ID_user: ID_user }})
    res.send('Profil zaposlenika je obrisan!')
}

// 6. Get enum values for Role
const getRoleEnum = (req, res) => {
  const roleEnum = User.rawAttributes.Role.values;
  res.status(200).json(roleEnum);
};

module.exports = {
    addUser,
    getAllUsers,
    getOneUser,
    updateUser,
    deleteUser,
    getRoleEnum
}