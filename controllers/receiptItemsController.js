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
const addReceiptItems = async (req, res) => {

    let info = {
        ID_recItems: req.body.ID_recItems,
        ID_receipt: req.body.ID_receipt,
        TypeItem: req.body.TypeItem,
        ID_material: req.body.ID_material,
        ID_service: req.body.ID_service,
        Amount: req.body.Amount,
        PriceNoTax: req.body.PriceNoTax,
        Tax: req.body.Tax,
        PriceTax: req.body.PriceTax,

    }

    const receiptItems = await ReceiptItems.create(info)
    res.status(200).send(receiptItems)
    console.log(receiptItems)
}

// 2. Gets all offerItems from table
const getAllReceiptItems = async (req, res) => {
    let receiptItems = await db.ReceiptItems.findAll({})
    res.send(receiptItems)
}

//3. Get one user over id
const getOneReceiptItem= async (req, res) => {

    let ID_recItems = req.params.ID_recItems
    let receiptItems = await db.ReceiptItems.findOne({ where: { ID_recItems: ID_recItems}})
    res.status(200).send(receiptItems)
}

//4. update user over id
const updateReceiptItem = async (req, res) => {
    let ID_recItems = req.params.ID_recItems
    const receiptItems = await db.ReceiptItems.update(req.body, {where: { ID_recItems: ID_recItems }})
    res.status(200).send(receiptItems)
}

//5. delete user by id
const deleteReceiptItem = async (req, res) => {

    let ID_recItems = req.params.ID_recItems
    await ReceiptItems.destroy({where: { ID_recItems: ID_recItems }})
    res.send('Stavka je obrisana!')
}

   // 8. Get enum values for TypeItem
    const getRecTypeItemEnum = (req, res) => {
      const typeEnums = OfferItems.rawAttributes.TypeItem.values;
      res.status(200).json(typeEnums);
    };

module.exports = {
    addReceiptItems,
    getAllReceiptItems,
    getOneReceiptItem,
    updateReceiptItem,
    deleteReceiptItem,
    getRecTypeItemEnum
}