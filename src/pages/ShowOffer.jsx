import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Modal, Table } from 'react-bootstrap';


const ShowOffer = () => {

    const [materials, setMaterials] = useState([]);
    const [service, setService] = useState([]);
    const [clients, setClients] = useState([]);
    const [form, setForm] = useState({
        ID_client: '',
        ID_user: '',
        DateCreate: new Date().toISOString().split('T')[0],
        DateEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    const [users, setUsers] = useState([]);

    const today = () => new Date().toISOString().split('T')[0];
    const addDays = (n) => new Date(Date.now() + n * 86400000).toISOString().split('T')[0];



    useEffect(() => {
        fetchClients();
        fetchUsers();
        fetchMaterials();
        fetchService();
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

    const [offerItems, setOfferItems] = useState([]);

    const [newItem, setNewItem] = useState({
        ID_material: '',
        ID_service: '',
        TypeItem: '',
        Amount: '',
    });

    const handleAddItem = () => {
        // Validacija
        if (
            (!newItem.ID_material && !newItem.ID_service) ||
            (newItem.ID_material && newItem.ID_service) ||
            !newItem.TypeItem ||
            !newItem.Amount
        ) {
            alert("Unesi ili materijal ili uslugu (ne oba), i sve obavezne podatke.");
            return;
        }

        setOfferItems([...offerItems, newItem]);
        setNewItem({ ID_material: '', ID_service: '', TypeItem: '', Amount: '' });
    };

    const handleSubmitOffer = async () => {
        try {
            // 1. Kreiraj ponudu
            const res = await axios.post('/api/aplication/createOffer', form);
            const createdOfferId = res.data.ID_offer;

            // 2. Kreiraj stavke
            for (const item of offerItems) {
                await axios.post('/api/aplication/createOfferItem', {
                    ...item,
                    ID_offer: createdOfferId
                });
            }

            alert('Ponuda uspješno kreirana!');
            // Po želji: reset stanja
            setOfferItems([]);
            setForm({
                ID_client: '',
                ID_user: '',
                DateCreate: today(),
                DateEnd: addDays(15),
            });
        } catch (err) {
            console.error('Greška:', err);
            alert('Greška pri spremanju ponude');
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

            {/* Klijent i gumb u istoj liniji */}
            <div style={flexRowStyle}>
                <label style={labelStyle}>Klijent</label>
                <Form.Select
                    style={selectStyle}
                    value={form.ID_client}
                    onChange={(e) => setForm({ ...form, ID_client: e.target.value })}
                >
                    <option value="">-- Odaberi klijenta --</option>
                    {clients.map(c => (
                        <option key={c.ID_client} value={c.ID_client}>
                            {c.Name ? c.Name : c.ContactName}
                        </option>
                    ))}
                </Form.Select>
                <Button variant="danger" style={{ whiteSpace: 'nowrap' }}>
                    Dodaj novog klijenta
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
                    <option value="">-- Odaberi zaposlenika --</option>
                    {users.map(c => (
                        <option key={c.ID_user} value={c.ID_user}>
                            {c.Name} {/* dodaj prezime po potrebi */}
                        </option>
                    ))}
                </Form.Select>
                <Button variant="danger" style={{ whiteSpace: 'nowrap' }}>
                    Dodaj novog zaposlenika
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

            <Table bordered hover size="sm">
                <thead>
                    <tr>
                        <th>Materijal</th>
                        <th>Usluga</th>
                        <th>Tip</th>
                        <th>Količina</th>
                    </tr>
                </thead>
                <tbody>
                    {offerItems.map((item, index) => (
                        <tr key={index}>
                            <td>{materials.find(m => m.ID_material == item.ID_material)?.NameMaterial || '-'}</td>
                            <td>{service.find(s => s.ID_service == item.ID_service)?.NameService || '-'}</td>
                            <td>{item.TypeItem}</td>
                            <td>{item.Amount}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Button variant="secondary" onClick={handleAddItem}>
                + Dodaj stavku
            </Button>

            <Button variant="primary" onClick={handleSubmitOffer} className="ms-3">
                ✅ Kreiraj ponudu
            </Button>

        </div>



    )
}

export default ShowOffer
