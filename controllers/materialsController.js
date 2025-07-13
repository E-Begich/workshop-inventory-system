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
const addMaterial = async (req, res) => {

    let info = {
        ID_material: req.body.ID_material,
        NameMaterial: req.body.NameMaterial,
        CodeMaterial: req.body.CodeMaterial,
        Amount: req.body.Amount,
        Unit: req.body.Unit,
        Location: req.body.Location,
        Description: req.body.Description,
        MinAmount: req.body.MinAmount,
        PurchasePrice: req.body.PurchasePrice,
        SellingPrice: req.body.SellingPrice,
        TypeChange: req.body.TypeChange,
        ID_supplier: req.body.ID_supplier,
    }

    const material = await Material.create(info)
    res.status(200).send(material)
    console.log(material)
}

// 2. Gets all users from table
const getAllMaterial = async (req, res) => {
    let material = await Materials.findAll({})
    res.send(material)
}

//3. Get one user over id
const getOneMaterial= async (req, res) => {

    let ID_material = req.params.ID_material
    let material = await Materials.findOne({ where: { ID_material: ID_material}})
    res.status(200).send(material)
}

//4. update user over id
const updateMaterial = async (req, res) => {
    let ID_material = req.params.ID_material
    const material = await Materials.update(req.body, {where: { ID_material: ID_material }})
    res.status(200).send(material)
}

//5. delete user by id
const deleteMaterial = async (req, res) => {

    let ID_material = req.params.ID_material
    await Materials.destroy({where: { ID_material: ID_material }})
    res.send('Materijal je obrisan!')
}

module.exports = {
    addMaterial,
    getAllMaterial,
    getOneMaterial,
    updateMaterial,
    deleteMaterial
}