import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Table, Row, Col, Card } from 'react-bootstrap';
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const ShowOffer = () => {
    const [materials, setMaterials] = useState([]);
    const [service, setService] = useState([]);
    const [clients, setClients] = useState([]);
    const [typeEnum, setTypeEnum] = useState([]);
    const [form, setForm] = useState({
        ID_client: '',
        ID_user: '',
        DateCreate: new Date().toISOString().split('T')[0],
        DateEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    const [users, setUsers] = useState([]);
    const [offerItems, setOfferItems] = useState([]);
    const [newItem, setNewItem] = useState({
        ID_material: '',
        ID_service: '',
        TypeItem: '',
        Amount: '',
        PriceNoTax: 0,
        Tax: 25,
        PriceTax: 0,
    });
    const [editingIndex, setEditingIndex] = useState(null); // indeks stavke koja se uređuje


    const today = () => new Date().toISOString().split('T')[0];
    const addDays = (n) => new Date(Date.now() + n * 86400000).toISOString().split('T')[0];


    useEffect(() => {
        fetchClients();
        fetchUsers();
        fetchMaterials();
        fetchService();
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
            console.error('Greška pri dohvaćanju dobavljača', error);
        }
    };

    const fetchService = async () => {
        try {
            const res = await axios.get('/api/aplication/getAllService');
            setService(res.data);
        } catch (error) {
            console.error('Greška pri dohvaćanju usluga', error);
        }
    };

    const fetchTypeItem = async () => {
        try {
            const res = await axios.get('/api/aplication/getTypeItemEnum');
            setTypeEnum(res.data);
            //  console.log(res.data)
        } catch (error) {
            console.error('Greška pri dohvaćanju', error);

        }
    };

    const startEditing = (index) => {
        setEditingIndex(index);
        setNewItem({ ...offerItems[index] });
    };

    const handleAddItem = () => {
        // Validacija
        if (
            (!newItem.ID_material && !newItem.ID_service) ||
            (newItem.ID_material && newItem.ID_service) ||
            !newItem.TypeItem ||
            !newItem.Amount
        ) {
            //alert("Odaberi materijal ili uslugu!");
            toast.error('Odaberi materijal ili uslugu!');
            return;
        }

        setOfferItems([...offerItems, newItem]);
        setNewItem({
            ID_material: '',
            ID_service: '',
            TypeItem: '',
            Amount: '',
            PriceNoTax: 0,
            Tax: 25,          // vrati default PDV
            PriceTax: 0,
        });
    };

    const handleSubmitOffer = async () => {
        // console.log('Šaljem stavke:', offerItems);

        for (const item of offerItems) {
            if (!item.TypeItem || !item.Amount || (!item.ID_material && !item.ID_service)) {
                // alert('Jedna ili više stavki su nepotpune.');
                toast.error('Jedna ili više stavki su nepotpune.');
                return;
            }
        }

        // ✅ Validacija forme (klijent, zaposlenik, datumi)
        if (!form.ID_client || !form.ID_user || !form.DateCreate || !form.DateEnd) {
            toast.error('Molimo ispunite sva polja u formi.');
            return;
        }


        try {
            // 1. Kreiraj ponudu i dohvati ID
            const res = await axios.post('/api/aplication/addOffer', form);
            const createdOfferId = res.data.ID_offer;

            // 2. Prije slanja offerItems, mapiraj ih i osiguraj Tax
            const itemsToSend = offerItems.map(item => ({
                ...item,
                Tax: item.Tax ?? 25,  // ako Tax nije postavljen, stavi 25
                ID_offer: createdOfferId,
            }));

            // 3. Pošalji stavke na backend
            await axios.post('/api/aplication/addOfferItems', itemsToSend);

            toast.success('Ponuda uspješno kreirana!');
            // reset formi itd...
            setOfferItems([]);
            setForm({
                ID_client: '',
                ID_user: '',
                DateCreate: today(),
                DateEnd: addDays(15),
            });
        } catch (err) {
            console.error('Greška:', err);
            toast.error('Greška pri spremanju ponude!');
        }
    };

    const saveEditedItem = () => {
        const updatedItems = [...offerItems];

        const editedItem = { ...newItem };

        const amount = parseFloat(editedItem.Amount || 0);
        let priceNoTax = 0;
        let priceTax = 0;

        if (editedItem.TypeItem === 'Materijal') {
            const selected = materials.find(m => String(m.ID_material) === String(editedItem.ID_material));
            if (selected) {
                priceNoTax = parseFloat(selected.SellingPrice || 0) * amount;
                priceTax = priceNoTax * 1.25;
            }
        } else if (editedItem.TypeItem === 'Usluga') {
            const selected = service.find(s => String(s.ID_service) === String(editedItem.ID_service));
            if (selected) {
                priceNoTax = parseFloat(selected.PriceNoTax || 0) * amount;
                priceTax = priceNoTax * 1.25;
            }
        }

        editedItem.PriceNoTax = priceNoTax;
        editedItem.PriceTax = priceTax;

        updatedItems[editingIndex] = editedItem;
        setOfferItems(updatedItems);
        setEditingIndex(null);

        setNewItem({
            ID_material: '',
            ID_service: '',
            TypeItem: '',
            Amount: '',
            PriceNoTax: 0,
            Tax: 25,
            PriceTax: 0,
        });
    };


    const deleteItem = (index) => {
        const updatedItems = offerItems.filter((_, i) => i !== index);
        setOfferItems(updatedItems);
        if (editingIndex === index) {
            setEditingIndex(null);
            setNewItem({
                ID_material: '',
                ID_service: '',
                TypeItem: '',
                Amount: '',
                PriceNoTax: 0,
                Tax: 25,
                PriceTax: 0,
            });
        }
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
        <div className="container-fluid px-2 mt-4">
            <h2 className="text-lg font-semibold mb-4">Izrada ponude</h2>
            <br />
            {/* Klijent i gumb u istoj liniji */}
            <div style={flexRowStyle}>
                <label style={labelStyle}>Klijent</label>
                <Form.Select
                    style={selectStyle}
                    value={form.ID_client}
                    onChange={(e) => setForm({ ...form, ID_client: e.target.value })}
                >
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
                <label style={labelStyle}>Zaposlenik</label>
                <Form.Select
                    style={selectStyle}
                    value={form.ID_user}
                    onChange={(e) => setForm({ ...form, ID_user: e.target.value })}
                >
                    <option value="">Odaberi zaposlenika</option>
                    {users.map(c => (
                        <option key={c.ID_user} value={c.ID_user}>
                            {c.Name} {c.Lastname}
                        </option>
                    ))}
                </Form.Select>
                <Button variant="danger" style={{ whiteSpace: 'nowrap' }}>
                    <Link to="/getAllUsers" className="nav-link text-white">
                        Dodaj novog zaposlenika
                    </Link>
                </Button>
            </div>

            {/* Datumi u istoj liniji */}
            <div style={flexRowStyle}>
                <Form.Group style={{ flex: 1, marginBottom: 0 }}>
                    <Form.Label>Datum kreiranja</Form.Label>
                    <Form.Control type="date" value={form.DateCreate} disabled />
                </Form.Group>

                <Form.Group style={{ flex: 1, marginLeft: '1rem', marginBottom: 0 }}>
                    <Form.Label>Datum završetka</Form.Label>
                    <Form.Control type="date" value={form.DateEnd} disabled />
                </Form.Group>
            </div>
            <Card className="mb-4 shadow-sm">
                <Card.Header as="h5">Dodavanje stavki u ponudu</Card.Header>
                <Card.Body>
                    <Form>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Tip stavke</Form.Label>
                                    <Form.Select
                                        value={newItem.TypeItem}
                                        onChange={(e) =>
                                            setNewItem({
                                                ...newItem,
                                                TypeItem: e.target.value,
                                                ID_material: '',
                                                ID_service: '',
                                                PriceNoTax: 0,
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
                                </Form.Group>
                            </Col>

                            <Col md={6}>
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

                        <Row className="mb-3">
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
                        </Row>

                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" onClick={editingIndex !== null ? saveEditedItem : handleAddItem}>
                                {editingIndex !== null ? "Spremi izmjene" : "Dodaj stavku"}
                            </Button>

                        </div>
                    </Form>
                </Card.Body>
            </Card>


            <Table bordered hover size="sm">
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
                    {offerItems.map((item, index) => {
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


            <Button variant="danger" onClick={handleSubmitOffer} className="ms-3">
                Kreiraj ponudu
            </Button>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop />
        </div>



    )
}

export default ShowOffer
