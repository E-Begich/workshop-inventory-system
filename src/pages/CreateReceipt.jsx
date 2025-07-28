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
    const [receiptItems, setReceiptItems] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);

    const [form, setForm] = useState({
        ReceiptNumber: '',
        ID_client: '',
        DateCreate: new Date().toISOString().split('T')[0],
        PriceNoTax: '',
        Tax: 25,
        PriceTax: 0,
        ID_offer: '',
        ID_user: 0,
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

    const handleAddItem = () => {
        if (
            (!newItem.ID_material && !newItem.ID_service) ||
            (newItem.ID_material && newItem.ID_service) ||
            !newItem.TypeItem ||
            !newItem.Amount
        ) {
            toast.error('Odaberi materijal ili uslugu i unesi količinu.');
            return;
        }

        setReceiptItems([...receiptItems, newItem]);
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

    const calculateTotals = () => {
        let totalNoTax = 0;
        let totalTax = 0;
        let totalWithTax = 0;

        receiptItems.forEach(item => {
            const amount = parseFloat(item.Amount || 0);
            const priceNoTax = parseFloat(item.PriceNoTax || 0);
            const tax = parseFloat(item.Tax || 0);

            totalNoTax += priceNoTax;
            totalTax += priceNoTax * (tax / 100);
        });

        totalWithTax = totalNoTax + totalTax;

        return { totalNoTax, totalTax, totalWithTax };
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
            let totalNoTax = 0;
            let totalTax = 0;

            receiptItems.forEach(item => {
                totalNoTax += parseFloat(item.PriceNoTax || 0);
                totalTax += parseFloat(item.PriceTax || 0);
            });

            // Priprema podataka za kreiranje računa (zaglavlje)
            const receiptData = {
                ...form,
                PriceNoTax: totalNoTax,
                PriceTax: totalTax,
                Tax: form.Tax || 25,
            };

            // 1. Kreiraj račun i dohvati njegov ID
            const res = await axios.post('/api/aplication/addReceipt', receiptData);
            const createdReceiptId = res.data.ID_receipt;

            // 2. Pripremi stavke računa za slanje s ID_receipt
            const itemsToSend = receiptItems.map(item => ({
                ...item,
                ID_receipt: createdReceiptId,
                Tax: item.Tax ?? 25,
            }));

            // 3. Pošalji stavke na backend
            await axios.post('/api/aplication/addReceiptItem', itemsToSend);

            toast.success('Račun uspješno kreiran!');

            // Reset formi i stavki nakon uspješnog spremanja
            setForm({
                ReceiptNumber: '',
                ID_client: '',
                ID_user: 0,
                DateCreate: new Date().toISOString().split('T')[0],
                PriceNoTax: 0,
                Tax: 25,
                PriceTax: 0,
                ID_offer: '',
            });
            setReceiptItems([]);

        } catch (error) {
            console.error('Greška pri spremanju računa:', error);
            toast.error('Došlo je do greške pri spremanju računa.');
        }
    };


    const calculateItemPrice = (item) => {
        const amount = parseFloat(item.Amount || 0);
        let unitPrice = 0;

        if (item.TypeItem === 'Materijal') {
            const selected = materials.find(m => String(m.ID_material) === String(item.ID_material));
            if (selected) unitPrice = parseFloat(selected.SellingPrice || 0);
        } else if (item.TypeItem === 'Usluga') {
            const selected = service.find(s => String(s.ID_service) === String(item.ID_service));
            if (selected) unitPrice = parseFloat(selected.PriceNoTax || 0);
        }

        const priceNoTax = unitPrice * amount;
        const priceTax = priceNoTax * 1.25;

        return { priceNoTax, priceTax };
    };

    const handleEditChange = (key, value) => {
        const updated = { ...newItem, [key]: value };

        if (key === 'ID_material' || key === 'ID_service' || key === 'Amount' || key === 'TypeItem') {
            const { priceNoTax, priceTax } = calculateItemPrice(updated);
            updated.PriceNoTax = priceNoTax;
            updated.PriceTax = priceTax;
        }

        setNewItem(updated);
    };

        const startEditing = (index) => {
        setEditingIndex(index);
        setNewItem({ ...receiptItems[index] });
    };

    const deleteItem = (index) => {
        setReceiptItems(receiptItems.filter((_, i) => i !== index));
    };

    return (
        <Card className="p-4 mt-4">
            <ToastContainer />
            <h4>Kreiraj Račun</h4>
            <Row className="mb-3">
                <Col>
                    <Form.Label>Klijent</Form.Label>
                    <Form.Select value={form.ID_client} onChange={e => setForm({ ...form, ID_client: e.target.value })}>
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
                </Col>
                <Col>
                    <Form.Label>Zaposlenik</Form.Label>
                    <Form.Select value={form.ID_user} onChange={e => setForm({ ...form, ID_user: e.target.value })}>
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
                </Col>
                <Col>
                    <Form.Label>Datum</Form.Label>
                    <Form.Control
                        type="date"
                        value={form.DateCreate}
                        onChange={e => setForm({ ...form, DateCreate: e.target.value })}
                    />
                </Col>
            </Row>

            <hr />

            <Row className="mb-3">
                <Col md={3}>
                    <Form.Label>Tip stavke</Form.Label>
                    <Form.Select
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
                    <Col md={12}>
                        <Form.Group>
                            <Form.Label>Materijal</Form.Label>
                            <Form.Select
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
                    <Col md={12}>
                        <Form.Group>
                            <Form.Label>Usluga</Form.Label>
                            <Form.Select
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

                <Col md={2}>
                    <Form.Group>
                        <Form.Label>Količina</Form.Label>
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
                <Button variant="secondary" onClick={editingIndex !== null ? handleEditChange : handleAddItem}>
                    {editingIndex !== null ? "Spremi izmjene" : "Dodaj stavku"}
                </Button>

            </div>

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
                        <th>Jedinična cijena s PDV-om</th>
                        <th>PDV (%)</th>
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
                                             let totalPriceTax = 0;
                     
                                             if (item.TypeItem === 'Materijal') {
                                                 const material = materials.find(m => String(m.ID_material) === String(item.ID_material));
                                                 if (material) {
                                                     ID = material.ID_material;
                                                     name = material.NameMaterial;
                                                     jm = material.Unit;
                                                     priceNoTax = parseFloat(material.SellingPrice || 0);
                                                     priceTax = priceNoTax * 1.25; // 25% PDV
                                                     totalPriceTax = priceTax * amount;
                                                 }
                                             } else if (item.TypeItem === 'Usluga') {
                                                 const serviceItem = service.find(s => String(s.ID_service) === String(item.ID_service));
                                                 if (serviceItem) {
                                                     ID = serviceItem.ID_service;
                                                     name = serviceItem.Name;
                                                     jm = 'usluga';
                                                     priceNoTax = parseFloat(serviceItem.PriceNoTax || 0);
                                                     priceTax = parseFloat(serviceItem.PriceTax || 0);
                                                     tax = parseFloat(serviceItem.Tax || 25);
                                                     totalPriceTax = priceTax * amount;
                                                 }
                                             }
                     
                                             return (
                                                 <tr key={index}>
                                                     <td>{ID}</td>
                                                     <td>{name}</td>
                                                     <td>{type}</td>
                                                     <td>{amount}</td>
                                                     <td>{jm}</td>
                                                     <td>{priceNoTax.toFixed(2)} €</td>
                                                     <td>{priceTax.toFixed(2)} €</td>
                                                     <td>{tax}%</td>
                                                     <td>{totalPriceTax.toFixed(2)} €</td>
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
