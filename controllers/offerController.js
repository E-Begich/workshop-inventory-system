const { TABLOCKX } = require('sequelize/lib/table-hints')
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

//1. create offer
const addOffer = async (req, res) => {

    let info = {
        ID_offer: req.body.ID_offer,
        ID_client: req.body.ID_client,
        DateCreate: req.body.DateCreate,
        DateEnd: req.body.DateEnd,
        PriceNoTax: req.body.PriceNoTax,
        Tax: req.body.Tax,
        PriceTax: req.body.PriceTax,
        ID_user: req.body.ID_user,
    }

    const offer = await Offer.create(info)
    res.status(200).send(offer)
    console.log(offer)
}

// 2. Gets all users from table
const getAllOffer = async (req, res) => {
    let offer = await Offer.findAll({})
    res.send(offer)
}

//3. Get one user over id
const getOneOffer= async (req, res) => {

    let ID_offer = req.params.ID_offer
    let offer = await Offer.findOne({ where: { ID_offer: ID_offer}})
    res.status(200).send(offer)
}

//4. update user over id
const updateOffer = async (req, res) => {
    let ID_offer = req.params.ID_offer
    const offer = await Offer.update(req.body, {where: { ID_offer: ID_offer }})
    res.status(200).send(offer)
}

//5. delete user by id
const deleteOffer = async (req, res) => {

    let ID_offer = req.params.ID_offer
    await Offer.destroy({where: { ID_offer: ID_offer }})
    res.send('Ponuda je obrisana!')
}

module.exports = {
    addOffer,
    getAllOffer,
    getOneOffer,
    updateOffer,
    deleteOffer
}