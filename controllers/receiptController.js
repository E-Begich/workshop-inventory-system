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
const addReceipt = async (req, res) => {

    let info = {
        ID_receipt: req.body.ID_receipt,
        ReceiptNumber: req.body.ReceiptNumber,
        ID_client: req.body.ID_client,
        DateCreate: req.body.DateCreate,
        PriceNoTax: req.body.PriceNoTax,
        Tax: req.body.Tax,
        PriceTax: req.body.PriceTax,
        ID_offer: req.body.ID_offer,
    }

    const receipt = await Receipt.create(info)
    res.status(200).send(receipt)
    console.log(receipt)
}

// 2. Gets all users from table
const getAllReceipt= async (req, res) => {
    let receipt = await Receipt.findAll({})
    res.send(receipt)
}

//3. Get one user over id
const getOneReceipt= async (req, res) => {

    let ID_receipt = req.params.ID_receipt
    let receipt = await Receipt.findOne({ where: { ID_receipt: ID_receipt}})
    res.status(200).send(receipt)
}

//4. update user over id
const updateReceipt = async (req, res) => {
    let ID_receipt = req.params.ID_receipt
    const receipt = await Receipt.update(req.body, {where: { ID_receipt: ID_receipt }})
    res.status(200).send(receipt)
}

//5. delete user by id
const deleteReceipt = async (req, res) => {

    let ID_receipt = req.params.ID_receipt
    await Receipt.destroy({where: { ID_receipt: ID_receipt }})
    res.send('Račun je obrisan!')
}

module.exports = {
    addReceipt,
    getAllReceipt,
    getOneReceipt,
    updateReceipt,
    deleteReceipt
}