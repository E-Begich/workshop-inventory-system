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
    const [users, setUsers] = useState([]);
    const [typeEnum, setTypeEnum] = useState([]);
    const [offerItems, setOfferItems] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null); // indeks stavke koja se uređuje
    const [form, setForm] = useState({
        ID_client: '',
        ID_user: '',
        DateCreate: new Date().toISOString().split('T')[0],
        DateEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        PriceNoTax: '',
        Tax: 25,
        PriceTax: 0,
    });
    const [newItem, setNewItem] = useState({
        ID_material: '',
        ID_service: '',
        TypeItem: '',
        Amount: '',
        PriceNoTax: 0,
        Tax: 25,
        PriceTax: 0,
    });


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

    const handleAddItem = () => {
        const { ID_material, ID_service, Amount, TypeItem } = newItem;
        // Validacija
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

        setOfferItems([...offerItems, itemToAdd]);
        resetNewItem();
    };

    const resetNewItem = () => {
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
        for (const item of offerItems) {
            if (!item.TypeItem || !item.Amount || (!item.ID_material && !item.ID_service)) {
                toast.error('Jedna ili više stavki su nepotpune.');
                return;
            }
        }

        if (!form.ID_client || !form.ID_user || !form.DateCreate || !form.DateEnd) {
            toast.error('Molimo ispunite sva polja u formi.');
            return;
        }

        for (const item of offerItems) {
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
            const totals = offerItems.reduce(
                (acc, item) => {
                    acc.priceNoTax += parseFloat(item.PriceNoTax || 0);  // već je pomnoženo u handleAddItem
                    acc.priceTax += parseFloat(item.PriceTax || 0);
                    return acc;
                },
                { priceNoTax: 0, priceTax: 0 }
            );
            totals.tax = totals.priceTax - totals.priceNoTax;

            console.log("Totali koji se šalju u ponudu:", totals);

            // ✅ 2. Spoji totals u form prije slanja
            const offerData = {
                ...form,
                PriceNoTax: totals.priceNoTax.toFixed(2),
                Tax: totals.tax.toFixed(2),
                PriceTax: totals.priceTax.toFixed(2),
            };
            console.log(offerData);

            // ✅ 3. Kreiraj ponudu i dohvati ID
            console.log(offerData)
            const res = await axios.post('/api/aplication/addOffer', offerData);
            const createdOfferId = res.data.ID_offer;

            // ✅ 4. Pripremi stavke
            const itemsToSend = offerItems.map(item => ({
                ...item,
                Tax: item.Tax ?? 25,
                ID_offer: createdOfferId,
            }));
            console.log("Items to send:", itemsToSend);

            // ✅ 5. Spremi stavke
            await axios.post('/api/aplication/addOfferItems', itemsToSend);

            toast.success('Ponuda uspješno kreirana!');

            setForm({
                ID_client: '',
                ID_user: '',
                DateCreate: today(),
                DateEnd: addDays(15),
            });

            setOfferItems([]);

        } catch (error) {
            console.error('Greška pri spremanju ponude:', error);
            toast.error('Došlo je do greške pri spremanju ponude.');
        }
    };


    const saveEditedItem = () => {
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
            unitPrice = parseFloat(svc?.PriceNoTax || 0);
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

        const updatedItems = [...offerItems];
        updatedItems[editingIndex] = updatedItem;

        setOfferItems(updatedItems);
        setEditingIndex(null);
        resetNewItem();
    };

    const startEditing = (index) => {
        setEditingIndex(index);
        setNewItem({ ...offerItems[index] });
    };

    const deleteItem = (index) => {
        setOfferItems(offerItems.filter((_, i) => i !== index));
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
                        <th>PDV (%)</th>
                        <th>Jedinična cijena s PDV-om</th>
                        <th>Iznos PDV-a</th>
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

                        if (item.TypeItem === 'Materijal') {
                            const material = materials.find(m => String(m.ID_material) === String(item.ID_material));
                            if (material) {
                                ID = material.ID_material;
                                name = material.NameMaterial;
                                jm = material.Unit;
                                priceNoTax = parseFloat(material.SellingPrice || 0);
                                tax = 25;
                                priceTax = priceNoTax * (1 + tax / 100);
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
                <tfoot>
                    {(() => {
                        let totalNoTax = 0;
                        let totalTax = 0;
                        let totalWithTax = 0;

                        offerItems.forEach(item => {
                            let amount = parseFloat(item.Amount || 0);
                            let priceNoTax = 0;
                            let priceTax = 0;

                            if (item.TypeItem === 'Materijal') {
                                const material = materials.find(m => String(m.ID_material) === String(item.ID_material));
                                if (material) {
                                    priceNoTax = parseFloat(material.SellingPrice || 0);
                                    priceTax = priceNoTax * (1 + (parseFloat(item.Tax || 25) / 100));
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
                            </>
                        );
                    })()}
                </tfoot>
            </Table>

            <div className="text-end mt-3">
            <Button variant="danger" onClick={handleSubmitOffer} className="ms-3">
                Kreiraj ponudu
            </Button>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop />
            </div>
        </Card>
    )
}

export default ShowOffer
