import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Table, Row, Col, Card } from 'react-bootstrap';
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateReceipt = () => {
    const [materials, setMaterials] = useState([]);
    const [service, setService] = useState([]);
    const [clients, setClients] = useState([]);
    const [users, setUsers] = useState([]);
    const [typeEnum, setTypeEnum] = useState([]);
    const [payment, setPayment] = useState([]);
    const [receiptItems, setReceiptItems] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [form, setForm] = useState({
        // ReceiptNumber: '',
        ID_client: '',
        DateCreate: new Date().toISOString().split('T')[0],
        PriceNoTax: '',
        Tax: 25,
        PriceTax: 0,
        ID_offer: '',
        ID_user: 0,
        PaymentMethod: '',
    });
    const [newItem, setNewItem] = useState({
        ID_receipt: '',
        TypeItem: '',
        ID_material: '',
        ID_service: '',
        Amount: '',
        PriceNoTax: 0,
        Tax: 25,
        PriceTax: 0,
    });
    useEffect(() => {
        fetchClients();
        fetchUsers();
        fetchMaterials();
        fetchServices();
        fetchTypeItem();
        fetchPayment();
    }, []);
    const fetchClients = async () => {
        try {
            const res = await axios.get('/api/aplication/getAllClients');
            setClients(res.data);
        } catch (error) {
            console.error('Greška pri dohvaćanju klijenata', error);
        }
    };
    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/aplication/getAllUsers');
            setUsers(res.data);
        } catch (error) {
            console.error('Greška pri dohvaćanju korisnika', error);
        }
    };
    const fetchMaterials = async () => {
        try {
            const res = await axios.get('/api/aplication/getAllMaterial');
            setMaterials(res.data);
        } catch (error) {
            console.error('Greška pri dohvaćanju materijala', error);
        }
    };
    const fetchServices = async () => {
        try {
            const res = await axios.get('/api/aplication/getAllService');
            setService(res.data);
        } catch (error) {
            console.error('Greška pri dohvaćanju usluga', error);
        }
    };

    const fetchTypeItem = async () => {
        try {
            const res = await axios.get('/api/aplication/getRecTypeItemEnum');
            setTypeEnum(res.data);
            //  console.log(res.data)
        } catch (error) {
            console.error('Greška pri dohvaćanju', error);

        }
    };

    const fetchPayment = async () => {
        try {
            const res = await axios.get('/api/aplication/getPaymentEnum');
            setPayment(res.data);
        } catch (error) {
            console.error('Greška pri dohvaćanju načina plaćanja', error);
        }
    };

    const handleAddItem = () => {
        const { ID_material, ID_service, Amount, TypeItem } = newItem;

        if (
            (!ID_material && !ID_service) ||
            (ID_material && ID_service) ||
            !TypeItem ||
            !Amount
        ) {
            toast.error('Odaberi materijal ili uslugu i unesi količinu.');
            return;
        }

        let unitPrice = 0;
        let taxRate = 25; // default fallback

        if (ID_material) {
            const material = materials.find(m => m.ID_material == ID_material);
            if (material) {
                unitPrice = parseFloat(material.SellingPrice || 0);
                taxRate = parseFloat(material.Tax || 25);
                console.log("📦 Pronađen materijal:", material);
            }
        } else if (ID_service) {
            const svc = service.find(s => s.ID_service == ID_service);
            if (svc) {
                unitPrice = parseFloat(svc.PriceNoTax || 0);  // ili SellingPrice, ovisno o bazi
                taxRate = parseFloat(svc.Tax || 25);
                console.log("🛠️ Pronađena usluga:", svc);
            }
        }

        const amount = parseFloat(Amount);
        const priceNoTax = unitPrice * amount;
        const priceTax = priceNoTax * (1 + taxRate / 100);

        const itemToAdd = {
            ...newItem,
            PriceNoTax: priceNoTax.toFixed(2),
            PriceTax: priceTax.toFixed(2),
            Tax: taxRate,
        };

        console.log("🧾 Novi item:", itemToAdd);

        setReceiptItems([...receiptItems, itemToAdd]);
        resetNewItem();
    };

    const resetNewItem = () => {
        setNewItem({
            ID_receipt: '',
            TypeItem: '',
            ID_material: '',
            ID_service: '',
            Amount: '',
            PriceNoTax: 0,
            Tax: 25,
            PriceTax: 0,
        });
    };

    const handleSubmitReceipt = async () => {
        // Validacija osnovnih podataka o računu
        if (!form.ID_client || !form.ID_user || !form.DateCreate) {
            toast.error('Molimo popunite sve podatke o računu.');
            return;
        }

        // Validacija stavki računa
        if (receiptItems.length === 0) {
            toast.error('Dodajte barem jednu stavku računa.');
            return;
        }

        for (const item of receiptItems) {
            if (
                !item.TypeItem ||
                !item.Amount ||
                Number(item.Amount) <= 0 ||
                (!item.ID_material && !item.ID_service)
            ) {
                toast.error('Jedna ili više stavki su nepotpune ili imaju neispravan iznos.');
                return;
            }
        }

        try {
            // Izračun ukupnih vrijednosti
            const totals = receiptItems.reduce(
                (acc, item) => {
                    acc.priceNoTax += parseFloat(item.PriceNoTax || 0);  // već je pomnoženo u handleAddItem
                    acc.priceTax += parseFloat(item.PriceTax || 0);
                    return acc;
                },
                { priceNoTax: 0, priceTax: 0 }
            );
            totals.tax = totals.priceTax - totals.priceNoTax;

            console.log("Totali koji se šalju u račun:", totals);

            // Priprema podataka za kreiranje računa (zaglavlje)
            const receiptData = {
                ...form,
                PriceNoTax: totals.priceNoTax.toFixed(2),
                Tax: totals.tax.toFixed(2),
                PriceTax: totals.priceTax.toFixed(2),
            };
            console.log(receiptData);

            // 1. Kreiraj račun i dohvati njegov ID
            console.log(receiptData)
            const res = await axios.post('/api/aplication/addReceipt', receiptData);
            const createdReceiptId = res.data.ID_receipt;

            // 2. Pripremi stavke računa za slanje s ID_receipt
            const itemsToSend = receiptItems.map(item => ({
                ...item,
                ID_receipt: createdReceiptId,
                Tax: item.Tax ?? 25,  // PDV stopa, ne iznos poreza, to je u redu
            }));
            console.log("Items to send:", itemsToSend);

            // 3. Pošalji stavke na backend
            await axios.post('/api/aplication/addReceiptItem', itemsToSend);

            toast.success('Račun uspješno kreiran!');

            // Reset formi i stavki nakon uspješnog spremanja
            setForm({
                //ReceiptNumber: '',
                ID_client: '',
                ID_user: '',
                DateCreate: new Date().toISOString().split('T')[0],
                PriceNoTax: 0,
                Tax: 25,
                PriceTax: 0,
                ID_offer: '',
                PaymentMethod: '',
            });
            setReceiptItems([]);

        } catch (error) {
            console.error('Greška pri spremanju računa:', error);
            toast.error('Došlo je do greške pri spremanju računa.');
        }
    };

    const handleSaveEditedItem = () => {
        const { ID_material, ID_service, Amount, TypeItem } = newItem;

        if (
            (!ID_material && !ID_service) ||
            (ID_material && ID_service) ||
            !TypeItem ||
            !Amount
        ) {
            toast.error('Odaberi materijal ili uslugu i unesi količinu.');
            return;
        }

        let unitPrice = 0;
        let taxRate = 25;

        if (ID_material) {
            const material = materials.find(m => m.ID_material == ID_material);
            unitPrice = parseFloat(material?.SellingPrice || 0);
            taxRate = parseFloat(material?.Tax || 25);
        } else if (ID_service) {
            const svc = service.find(s => s.ID_service == ID_service);
            unitPrice = parseFloat(svc?.Price || 0);
            taxRate = parseFloat(svc?.Tax || 25);
        }

        const amount = parseFloat(Amount || 1);
        const priceNoTax = unitPrice * amount;
        const priceTax = priceNoTax * (1 + taxRate / 100);

        const updatedItem = {
            ...newItem,
            PriceNoTax: priceNoTax,
            PriceTax: priceTax,
            Tax: taxRate,
        };

        const updatedItems = [...receiptItems];
        updatedItems[editingIndex] = updatedItem;
        setReceiptItems(updatedItems);
        setEditingIndex(null);
        resetNewItem();
    };



    const startEditing = (index) => {
        setEditingIndex(index);
        setNewItem({ ...receiptItems[index] });
    };

    const deleteItem = (index) => {
        setReceiptItems(receiptItems.filter((_, i) => i !== index));
    };

    const flexRowStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '1rem',
    };

    const selectStyle = {
        flex: 1,
    };

    const labelStyle = {
        minWidth: '100px',
    };

    return (
        <Card className="p-4 mt-4">
            <ToastContainer />
            <h2 className="text-lg font-semibold mb-4">Kreiraj račun</h2>

            <br />
            <Row className="mb-3">
                {/* Klijent i gumb u istoj liniji */}
                <div style={flexRowStyle}>
                    <Form.Label style={labelStyle}>Klijent</Form.Label>
                    <Form.Select style={selectStyle} value={form.ID_client} onChange={e => setForm({ ...form, ID_client: e.target.value })}>
                        <option value="">Odaberi klijenta</option>
                        {clients.map(c => (
                            <option key={c.ID_client} value={c.ID_client}>
                                {c.Name ? c.Name : c.ContactName}
                            </option>
                        ))}
                    </Form.Select>
                    <Button variant="danger" style={{ whiteSpace: 'nowrap' }}>
                        <Link to="/getAllClients" className="nav-link text-white">
                            Dodaj novog klijenta
                        </Link>
                    </Button>
                </div>
                {/* Zaposlenik i gumb u istoj liniji */}
                <div style={flexRowStyle}>
                    <Form.Label style={labelStyle}>Zaposlenik</Form.Label>
                    <Form.Select style={selectStyle} value={form.ID_user} onChange={e => setForm({ ...form, ID_user: e.target.value })}>
                        <option value="">Odaberi korisnika</option>
                        {users.map(c => (
                            <option key={c.ID_user} value={c.ID_user}>{c.Name} {c.Lastname}</option>
                        ))}
                    </Form.Select>
                    <Button variant="danger" style={{ whiteSpace: 'nowrap' }}>
                        <Link to="/getAllUsers" className="nav-link text-white">
                            Dodaj novog zaposlenika
                        </Link>
                    </Button>
                </div>
                <div style={flexRowStyle}>
                    <Form.Label style={labelStyle}>Datum</Form.Label>
                    <Form.Control
                        type="date"
                        value={form.DateCreate}
                        onChange={e => setForm({ ...form, DateCreate: e.target.value })}
                    />
                </div>
            </Row>

            <hr />

            <Row className="mb-3">
                <Col md={6}>
                    <Form.Label style={labelStyle}>Tip stavke</Form.Label>
                    <Form.Select style={selectStyle}
                        value={newItem.TypeItem}
                        onChange={(e) =>
                            setNewItem({
                                ...newItem,
                                ID_receipt: '',
                                TypeItem: e.target.value,
                                ID_material: '',
                                ID_service: '',
                                Amount: '',
                                PriceNoTax: 0,
                                Tax: 25,
                                PriceTax: 0,
                            })
                        }
                    >
                        <option value="">Odaberi tip stavke</option>
                        {typeEnum.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </Form.Select>
                </Col>

                {newItem.TypeItem === 'Materijal' && (
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label style={labelStyle}>Materijal</Form.Label>
                            <Form.Select style={selectStyle}
                                value={newItem.ID_material}
                                onChange={(e) => {
                                    const selected = materials.find((m) => String(m.ID_material) === String(e.target.value));
                                    const unitPrice = parseFloat(selected?.SellingPrice || 0);
                                    const amount = parseFloat(newItem.Amount || 0);
                                    const totalNoTax = unitPrice * amount;
                                    setNewItem({
                                        ...newItem,
                                        ID_material: e.target.value,
                                        PriceNoTax: totalNoTax,
                                        PriceTax: totalNoTax * 1.25,
                                    });
                                }}
                            >
                                <option value="">Odaberi materijal</option>
                                {materials.map((m) => (
                                    <option key={m.ID_material} value={m.ID_material}>
                                        {m.NameMaterial} ({m.SellingPrice} €/m)
                                    </option>
                                ))}
                            </Form.Select>
                            {/* Prikaz dostupne količine */}
                            {newItem.ID_material && (
                                <Form.Text className="text-muted">
                                    Dostupno na skladištu:{" "}
                                    {
                                        materials.find((m) => String(m.ID_material) === String(newItem.ID_material))?.Amount || 0
                                    }{" "}
                                    {materials.find((m) => String(m.ID_material) === String(newItem.ID_material))?.Unit}
                                </Form.Text>
                            )}
                        </Form.Group>
                    </Col>
                )}

                {newItem.TypeItem === 'Usluga' && (
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label style={labelStyle}>Usluga</Form.Label>
                            <Form.Select style={selectStyle}
                                value={newItem.ID_service}
                                onChange={(e) => {
                                    const selected = service.find((s) => String(s.ID_service) === String(e.target.value));
                                    const unitPrice = parseFloat(selected?.PriceNoTax || 0);
                                    const amount = parseFloat(newItem.Amount || 0);
                                    const totalNoTax = unitPrice * amount;
                                    setNewItem({
                                        ...newItem,
                                        ID_service: e.target.value,
                                        PriceNoTax: totalNoTax,
                                        PriceTax: totalNoTax * 1.25,
                                    });
                                }}
                            >
                                <option value="">Odaberi uslugu</option>
                                {service.map((s) => (
                                    <option key={s.ID_service} value={s.ID_service}>
                                        {s.Name} ({s.PriceTax} €)
                                    </option>
                                ))}


                            </Form.Select>
                        </Form.Group>
                    </Col>
                )}
                <Col md={6}>
                    <Form.Group>
                        <Form.Label style={labelStyle}>Količina</Form.Label>
                        <Form.Control
                            type="number"
                            min="0"
                            step="0.01"
                            value={newItem.Amount}
                            onChange={(e) => {
                                const amount = parseFloat(e.target.value);
                                let priceNoTax = newItem.PriceNoTax;
                                let priceTax = newItem.PriceTax;

                                if (newItem.TypeItem === 'Usluga') {
                                    const selected = service.find((s) => String(s.ID_service) === String(newItem.ID_service));
                                    priceNoTax = (selected?.PriceService || 0) * amount;
                                    priceTax = priceNoTax * 1.25;
                                } else if (newItem.TypeItem === 'Materijal') {
                                    const selected = service.find((s) => String(s.ID_service) === String(newItem.ID_service));
                                    priceNoTax = (selected?.SellingPrice || 0) * amount;
                                    priceTax = priceNoTax * 1.25;
                                }

                                setNewItem({ ...newItem, Amount: amount, PriceNoTax: priceNoTax, PriceTax: priceTax });
                            }}
                        />
                    </Form.Group>
                </Col>
            </Row>
            <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={editingIndex !== null ? handleSaveEditedItem : handleAddItem}>
                    {editingIndex !== null ? "Spremi izmjene" : "Dodaj stavku"}
                </Button>
            </div>
            <hr />
            <Form.Group>
                <Form.Label>Način plaćanja</Form.Label>
                <Form.Control
                    as="select"
                    value={form.PaymentMethod}
                    onChange={(e) => setForm({ ...form, PaymentMethod: e.target.value })}
                >
                    <option value="">Odaberi način plaćanja</option>
                    {payment.map((loc) => (
                        <option key={loc} value={loc}>
                            {loc}
                        </option>
                    ))}
                </Form.Control>
            </Form.Group>
            <br />
            <hr />
            <h2 className="text-lg font-semibold mb-2">Stavke na računu</h2>

            <br />
            {
                receiptItems.length > 0 && (
                    <Table bordered>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Naziv</th>
                                <th>Vrsta</th>
                                <th>Količina</th>
                                <th>JM</th>
                                <th>Jedinična cijena bez PDV-a</th>
                                <th>PDV (%)</th>
                                <th>Jedinična cijena s PDV-om</th>
                                <th>Iznos PDV-a</th>
                                <th>Ukupna cijena s PDV-om</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {receiptItems.map((item, index) => {
                                let ID = '-';
                                let name = '-';
                                let type = item.TypeItem;
                                let amount = parseFloat(item.Amount || 0);
                                let jm = '-';
                                let priceNoTax = 0;
                                let priceTax = 0;
                                let tax = 25;

                                if (type === 'Materijal') {
                                    const material = materials.find(m => String(m.ID_material) === String(item.ID_material));
                                    if (material) {
                                        ID = material.ID_material;
                                        name = material.NameMaterial;
                                        jm = material.Unit;
                                        priceNoTax = parseFloat(material.SellingPrice || 0);
                                        tax = 25;
                                        priceTax = priceNoTax * (1 + tax / 100);
                                    }
                                } else if (type === 'Usluga') {
                                    const serviceItem = service.find(s => String(s.ID_service) === String(item.ID_service));
                                    if (serviceItem) {
                                        ID = serviceItem.ID_service;
                                        name = serviceItem.Name;
                                        jm = 'usluga';
                                        priceNoTax = parseFloat(serviceItem.PriceNoTax || 0);
                                        priceTax = parseFloat(serviceItem.PriceTax || 0);
                                        tax = parseFloat(serviceItem.Tax || 25);
                                    }
                                }

                                const totalNoTax = priceNoTax * amount;
                                const totalTax = (priceTax - priceNoTax) * amount;
                                const totalPriceTax = totalNoTax + totalTax;

                                return (
                                    <tr key={index}>
                                        <td>{ID}</td>
                                        <td>{name}</td>
                                        <td>{type}</td>
                                        <td>{amount}</td>
                                        <td>{jm}</td>
                                        <td>{priceNoTax.toFixed(2)}</td>
                                        <td>{tax}%</td>
                                        <td>{priceTax.toFixed(2)}</td>
                                        <td>{totalTax.toFixed(2)}</td>
                                        <td>{totalPriceTax.toFixed(2)}</td>
                                        <td>

                                            <Button
                                                size="sm"
                                                variant="warning"
                                                className="me-2"
                                                onClick={() => startEditing(index)}
                                            >
                                                Uredi
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => deleteItem(index)}
                                            >
                                                Obriši
                                            </Button>

                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>

                        {/* Ukupni zbrojevi ispod tablice */}
                        <tfoot>
                            {(() => {
                                let totalNoTax = 0;
                                let totalTax = 0;
                                let totalWithTax = 0;

                                receiptItems.forEach(item => {
                                    let amount = parseFloat(item.Amount || 0);
                                    let priceNoTax = 0;
                                    let priceTax = 0;

                                    if (item.TypeItem === 'Materijal') {
                                        const material = materials.find(m => String(m.ID_material) === String(item.ID_material));
                                        if (material) {
                                            priceNoTax = parseFloat(material.SellingPrice || 0);
                                            priceTax = priceNoTax * 1.25;
                                        }
                                    } else if (item.TypeItem === 'Usluga') {
                                        const serviceItem = service.find(s => String(s.ID_service) === String(item.ID_service));
                                        if (serviceItem) {
                                            priceNoTax = parseFloat(serviceItem.PriceNoTax || 0);
                                            priceTax = parseFloat(serviceItem.PriceTax || 0);
                                        }
                                    }

                                    totalNoTax += priceNoTax * amount;
                                    totalTax += (priceTax - priceNoTax) * amount;
                                    totalWithTax += priceTax * amount;
                                });

                                return (
                                    <>
                                        <tr style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                                            <td colSpan={5} style={{ textAlign: 'right' }}>Ukupno bez PDV-a:</td>
                                            <td>{totalNoTax.toFixed(2)} €</td>
                                            <td style={{ textAlign: 'right' }}>PDV:</td>
                                            <td>{totalTax.toFixed(2)} €</td>
                                            <td style={{ textAlign: 'right' }}>Ukupno:</td>
                                            <td>{totalWithTax.toFixed(2)} €</td>
                                            <td></td>
                                        </tr>
                                        <tr style={{ backgroundColor: '#f9f9f9' }}>
                                            <td colSpan={10} style={{ textAlign: 'right', fontStyle: 'italic' }}>
                                                Način plaćanja: <strong>{form.PaymentMethod || 'Nije odabrano'}</strong>
                                            </td>
                                            <td></td>
                                        </tr>
                                    </>
                                );
                            })()}
                        </tfoot>

                    </Table>
                )
            }

            <div className="text-end mt-3">
                <Button variant="success" onClick={handleSubmitReceipt}>Spremi račun</Button>
            </div>
        </Card >
    );
};

export default CreateReceipt;
