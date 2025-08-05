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
const getOneOffer = async (req, res) => {

    let ID_offer = req.params.ID_offer
    let offer = await Offer.findOne({ where: { ID_offer: ID_offer } })
    res.status(200).send(offer)
}

//4. update user over id
const updateOffer = async (req, res) => {
    let ID_offer = req.params.ID_offer
    const offer = await Offer.update(req.body, { where: { ID_offer: ID_offer } })
    res.status(200).send(offer)
}

//5. delete user by id
const deleteOffer = async (req, res) => {

    let ID_offer = req.params.ID_offer
    await Offer.destroy({ where: { ID_offer: ID_offer } })
    res.send('Ponuda je obrisana!')
}

//forma za kreiranje i izgled PDF dokumenta
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const formatCurrency = (value) => `${parseFloat(value || 0).toFixed(2)} €`;


const generateOfferPDF = async (req, res) => {
    const { ID_offer } = req.params;

    try {
        const offer = await Offer.findOne({
            where: { ID_offer },
            include: [
                { model: OfferItems, as: 'OfferItems' },
                { model: Client, as: 'Client' },
                { model: User, as: 'User' },
            ],
        });

        if (!offer) return res.status(404).send('Ponuda nije pronađena');



        // Kreiraj novi PDF dokument
        const doc = new PDFDocument({ margin: 50 });
        const filename = `Ponuda_${offer.ID_offer}.pdf`;

        // Setuj response
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/pdf');
        doc.pipe(res);

        const formatDate = (date) => new Date(date).toLocaleDateString('hr-HR');

        // === Zaglavlje ===
        doc
            .fontSize(20)
            .text('LOGO', 50, 50)

            .fontSize(14)
            .text(`Ponuda broj: R-${new Date(offer.DateCreate).getFullYear()}-${String(offer.ID_offer).padStart(5, '0')}`, {
                align: 'right',
                width: 530,
            }).fontSize(12)
            .text(`Datum izrade: ${formatDate(offer.DateCreate)}`, { align: 'right' })
            .text(`Datum isteka: ${formatDate(offer.DateEnd)}`, { align: 'right' });

        doc.moveDown(2);

        // === Podaci o klijentu i tvrtki ===
        let klijentInfo = '';

        if (offer.Client.TypeClient === 'Tvrtka') {
            klijentInfo = `Klijent:\n${offer.Client.Name || ''}\n${offer.Client.Address || ''}\n${offer.Client.PostalCode || ''} ${offer.Client.City || ''}\nOIB: ${offer.Client.PersonalNumber || ''}\nEmail: ${offer.Client.Email || ''}`;
        } else {
            klijentInfo = `Klijent:\n${offer.Client.ContactName || ''}\n${offer.Client.Address || ''}\n${offer.Client.PostalCode || ''} ${offer.Client.City || ''}\nOIB: ${offer.Client.PersonalNumber || ''}\nEmail: ${offer.Client.Email || ''}`;
        }

        doc
            .fontSize(12)
        doc.text(klijentInfo, 50, 150);

        const userFullName = offer.User ? `${offer.User.Name || ''} ${offer.User.Lastname || ''}`.trim() : 'Nepoznat';
        doc
            .fontSize(12)
            .text(`Tvrtka:\nPrimjer d.o.o.\nUlica 123 \n10000 Zagreb\nOIB: 12345678901\nTelefon: +385 1 2345 678\nKreirao: ${userFullName}`, 415, 150);

        doc.moveDown(6);

        // === Tablica stavki ===

        const tableTop = 300;
        const itemSpacing = 20;

        const headers = ['Naziv artikla', 'Tip', 'Količina', 'Jedinica', 'Cijena bez PDV-a', 'PDV', 'Cijena s PDV-om'];
        const startX = 50;
        const colWidths = [120, 70, 60, 60, 50, 150];

        // Zaglavlje tablice
        headers.forEach((header, i) => {
            doc.font('Helvetica-Bold').text(header, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), tableTop);
        });

        // Povuci liniju ispod zaglavlja
        doc.moveTo(startX, tableTop + 15)
            .lineTo(startX + colWidths.reduce((a, b) => a + b, 0), tableTop + 15)
            .strokeColor('#aaaaaa')
            .lineWidth(1)
            .stroke();

        // Podaci u tablici
        let rowY = tableTop + 25;

        for (const item of offer.OfferItems) {
            let naziv = '';
            if (item.TypeItem === 'Materijal' && item.ID_material) {
                const mat = await Materials.findByPk(item.ID_material);
                naziv = mat?.NameMaterial || 'Nepoznat materijal';
            } else if (item.TypeItem === 'Usluga' && item.ID_service) {
                console.log('ID_service:', item.ID_service);
                const serv = await Service.findByPk(item.ID_service);
                naziv = serv?.NameService || 'Nepoznata usluga';
            }

            const row = [
                naziv,
                item.TypeItem,
                item.Amount,
                formatCurrency(item.PriceNoTax),
                formatCurrency(item.Tax),
                formatCurrency(item.PriceTax),
            ];

            row.forEach((text, i) => {
                doc.font('Helvetica').text(text, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), rowY);
            });

            rowY += itemSpacing;
        }

        // === Sažetak cijena ===
        doc.moveDown(2);
        doc
            .fontSize(12)
            .text(`Ukupno bez PDV-a: ${formatCurrency(offer.PriceNoTax)}`, { align: 'right' })
            .text(`PDV: ${formatCurrency(offer.Tax)}`, { align: 'right' })
            .text(`Ukupno s PDV-om: ${formatCurrency(offer.PriceTax)}`, { align: 'right' })

        doc.moveDown(3);

        // === Potpis ===
        doc
            .text('______________________', { align: 'right' })
            .text(`${offer.User?.Name || ''}`, { align: 'right' })
            .text(`${formatDate(new Date())}`, { align: 'right' });

        doc.end();

    } catch (error) {
        console.error('Greška prilikom generiranja PDF ponude:', error);
        res.status(500).send('Greška na serveru pri generiranju PDF-a.');
    }
};



module.exports = {
    addOffer,
    getAllOffer,
    getOneOffer,
    updateOffer,
    deleteOffer,
    generateOfferPDF
}