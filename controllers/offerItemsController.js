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

//1. create item
const addOfferItems = async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [req.body];

    const savedItems = [];

    for (let item of items) {
      let info = {
        ID_offerItem: item.ID_offerItem,
        ID_offer: item.ID_offer,
        TypeItem: item.TypeItem,
        ID_material: item.ID_material,
        ID_service: item.ID_service,
        Amount: item.Amount,
        PriceNoTax: item.PriceNoTax,
        Tax: item.Tax,
        PriceTax: item.PriceTax,
      };

      if (info.ID_service === '') info.ID_service = null;
      if (info.ID_material === '') info.ID_material = null;

      if (info.TypeItem === 'Materijal') {
        info.ID_service = null;
      }

      if (info.TypeItem === 'Usluga') {
        info.ID_material = null;
      }

      const saved = await OfferItems.create(info);
      savedItems.push(saved);
    }

    res.status(200).send(savedItems);
  } catch (error) {
    console.error("⚠️ Greška prilikom dodavanja offerItems:", error);
    res.status(500).send({ error: error.message });
  }
};


// 2. Gets all offerItems from table
const getAllOfferItems = async (req, res) => {
    let offerItems = await OfferItems.findAll({})
    res.send(offerItems)
}

//3. Get one user over id
const getOneOfferItem= async (req, res) => {

    let ID_offerItem = req.params.ID_offerItem
    let offerItems = await OfferItems.findOne({ where: { ID_offerItem: ID_offerItem}})
    res.status(200).send(offerItems)
}

//4. update user over id
const updateOfferItem = async (req, res) => {
    let ID_offerItem = req.params.ID_offerItem
    const offerItems = await OfferItems.update(req.body, {where: { ID_offerItem: ID_offerItem }})
    res.status(200).send(offerItems)
}

//5. delete user by id
const deleteOfferItem = async (req, res) => {

    let ID_offerItem = req.params.ID_offerItem
    await OfferItems.destroy({where: { ID_offerItem: ID_offerItem }})
    res.send('Stavka je obrisana!')
}

module.exports = {
    addOfferItems,
    getAllOfferItems,
    getOneOfferItem,
    updateOfferItem,
    deleteOfferItem
}