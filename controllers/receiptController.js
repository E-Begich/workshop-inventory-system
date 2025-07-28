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

//1. create receipt
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
        ID_user: req.body.ID_user
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

// 6. Create receipt from offer
const createReceiptFromOffer = async (req, res) => {
  const { ID_offer, ID_user } = req.body;

  try {
    // 1. Pronađi ponudu
    const offer = await Offer.findOne({
      where: { ID_offer },
      include: [
        {
          model: OfferItems,
          as: 'OfferItems'
        }
      ]
    });

    if (!offer) {
      return res.status(404).json({ error: 'Ponuda nije pronađena' });
    }

    // 2. Izračun cijena
    const priceNoTax = offer.OfferItems.reduce((sum, item) => sum + parseFloat(item.PriceNoTax), 0);
    const priceTax = offer.OfferItems.reduce((sum, item) => sum + parseFloat(item.PriceTax), 0);
    const tax = priceTax - priceNoTax;

    // 3. Generiraj broj računa
    const receiptNumber = `R-${Date.now()}`;

    // 4. Kreiraj Receipt
    const receipt = await Receipt.create({
      ReceiptNumber: receiptNumber,
      ID_client: offer.ID_client,
      DateCreate: new Date(),
      PriceNoTax: priceNoTax,
      Tax: tax,
      PriceTax: priceTax,
      ID_offer: ID_offer,
      ID_user: ID_user
    });

    // 5. Kreiraj stavke (ReceiptItems)
    for (const item of offer.OfferItems) {
      await ReceiptItems.create({
        ID_receipt: receipt.ID_receipt,
        TypeItem: item.TypeItem,
        ID_material: item.ID_material,
        ID_service: item.ID_service,
        Amount: item.Amount,
        PriceNoTax: item.PriceNoTax,
        Tax: item.Tax,
        PriceTax: item.PriceTax
      });
    }

    return res.status(201).json({ message: 'Račun uspješno kreiran iz ponude', receipt });
  } catch (error) {
    console.error('Greška prilikom kreiranja računa:', error);
    return res.status(500).json({ error: 'Greška na serveru' });
  }
};


module.exports = {
    addReceipt,
    getAllReceipt,
    getOneReceipt,
    updateReceipt,
    deleteReceipt,
    createReceiptFromOffer
}