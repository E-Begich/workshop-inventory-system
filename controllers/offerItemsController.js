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
const addOfferItems = async (req, res) => {

    let info = {
        ID_offerItems: req.body.ID_offerItems,
        ID_offer: req.body.ID_offer,
        TypeItem: req.body.TypeItem,
        ID_material: req.body.ID_material,
        ID_service: req.body.ID_service,
        Amount: req.body.Amount,
        PriceNoTax: req.body.PriceNoTax,
        Tax: req.body.Tax,
        PriceTax: req.body.PriceTax,

    }

    const offerItems = await Client.create(info)
    res.status(200).send(offerItems)
    console.log(offerItems)
}

// 2. Gets all offerItems from table
const getAllOfferItems = async (req, res) => {
    let offerItems = await OfferItems.findAll({})
    res.send(offerItems)
}

//3. Get one user over id
const getOneOfferItem= async (req, res) => {

    let ID_offerItems = req.params.ID_offerItems
    let offerItems = await OfferItems.findOne({ where: { ID_offerItems: ID_offerItems}})
    res.status(200).send(offerItems)
}

//4. update user over id
const updateOfferItem = async (req, res) => {
    let ID_offerItems = req.params.ID_offerItems
    const offerItems = await OfferItems.update(req.body, {where: { ID_offerItems: ID_offerItems }})
    res.status(200).send(offerItems)
}

//5. delete user by id
const deleteOfferItem = async (req, res) => {

    let ID_offerItems = req.params.ID_offerItems
    await OfferItems.destroy({where: { ID_offerItems: ID_offerItems }})
    res.send('Stavka je obrisana!')
}

module.exports = {
    addOfferItems,
    getAllOfferItems,
    getOneOfferItem,
    updateOfferItem,
    deleteOfferItem
}