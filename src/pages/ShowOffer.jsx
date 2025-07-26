import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Modal, Table, Row, Col, Card } from 'react-bootstrap';

import { Link } from "react-router-dom";


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
                    <option value="">-- Odaberi klijenta --</option>
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
                    <option value="">-- Odaberi zaposlenika --</option>
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

            <Form.Group className="mb-3">
                <Form.Label>Tip stavke</Form.Label>
                <Form.Select
                    value={newItem.TypeItem}
                    onChange={(e) => setNewItem({ ...newItem, TypeItem: e.target.value, ID_material: '', ID_service: '' })}
                >
                    <option value="">-- Odaberi tip --</option>
                    <option value="Materijal">Materijal</option>
                    <option value="Usluga">Usluga</option>
                </Form.Select>
            </Form.Group>

            {newItem.TypeItem === 'Materijal' && (
                <Form.Group className="mb-3">
                    <Form.Label>Materijal</Form.Label>
                    <Form.Select
                        value={newItem.ID_material}
                        onChange={(e) => {
                            const selected = materials.find(m => m.ID_material == e.target.value);
                            setNewItem({
                                ...newItem,
                                ID_material: e.target.value,
                                PriceNoTax: selected?.PricePerMeter || 0,
                                PriceTax: selected?.PricePerMeter * 1.25 || 0  // ako je PDV 25%
                            });
                        }}
                    >
                        <option value="">-- Odaberi materijal --</option>
                        {materials.map(m => (
                            <option key={m.ID_material} value={m.ID_material}>{m.NameMaterial}</option>
                        ))}
                    </Form.Select>
                </Form.Group>
            )}

            {newItem.TypeItem === 'Usluga' && (
                <Form.Group className="mb-3">
                    <Form.Label>Usluga</Form.Label>
                    <Form.Select
                        value={newItem.ID_service}
                        onChange={(e) => {
                            const selected = service.find(s => s.ID_service == e.target.value);
                            const total = selected?.PriceService * newItem.Amount;
                            setNewItem({
                                ...newItem,
                                ID_service: e.target.value,
                                PriceNoTax: total || 0,
                                PriceTax: (total || 0) * 1.25
                            });
                        }}
                    >
                        <option value="">-- Odaberi uslugu --</option>
                        {service.map(s => (
                            <option key={s.ID_service} value={s.ID_service}>{s.Name}</option>
                        ))}
                    </Form.Select>
                </Form.Group>
            )}

            <Form.Group className="mb-3">
                <Form.Label>Količina</Form.Label>
                <Form.Control
                    type="number"
                    value={newItem.Amount}
                    onChange={(e) => {
                        const amount = parseFloat(e.target.value);
                        let priceNoTax = newItem.PriceNoTax;
                        let priceTax = newItem.PriceTax;

                        if (newItem.TypeItem === 'Usluga') {
                            const selected = service.find(s => s.ID_service == newItem.ID_service);
                            priceNoTax = (selected?.PriceService || 0) * amount;
                            priceTax = priceNoTax * 1.25;
                        }

                        setNewItem({ ...newItem, Amount: amount, PriceNoTax: priceNoTax, PriceTax: priceTax });
                    }}
                />
            </Form.Group>

            <Form.Group>
            <Button variant="secondary" onClick={handleAddItem}>
                + Dodaj stavku
            </Button>
            </Form.Group>

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
    </tr>
  </thead>
  <tbody>
    {offerItems.map((item, index) => {
      let id = '-';
      let naziv = '-';
      let vrsta = item.TypeItem;
      let kolicina = parseFloat(item.Amount || 0);
      let jm = '-';
      let cijenaBezPDV = 0;
      let cijenaSaPDV = 0;
      let pdvPostotak = 25;
      let ukupnoSaPDV = 0;

      if (item.TypeItem === 'Materijal') {
        const material = materials.find(m => m.ID_material == item.ID_material);
        if (material) {
          id = material.ID_material;
          naziv = material.NameMaterial;
          jm = material.Unit;
          cijenaBezPDV = parseFloat(material.SellingPrice || 0);
          cijenaSaPDV = cijenaBezPDV * 1.25; // 25% PDV
          ukupnoSaPDV = cijenaSaPDV * kolicina;
        }
      } else if (item.TypeItem === 'Usluga') {
        const serviceItem = service.find(s => s.ID_service == item.ID_service);
        if (serviceItem) {
          id = serviceItem.ID_service;
          naziv = serviceItem.Name;
          jm = 'usluga';
          cijenaBezPDV = parseFloat(serviceItem.PriceNoTax || 0);
          cijenaSaPDV = parseFloat(serviceItem.PriceTax || 0);
          pdvPostotak = parseFloat(serviceItem.Tax || 25);
          ukupnoSaPDV = cijenaSaPDV * kolicina;
        }
      }

      return (
        <tr key={index}>
          <td>{id}</td>
          <td>{naziv}</td>
          <td>{vrsta}</td>
          <td>{kolicina}</td>
          <td>{jm}</td>
          <td>{cijenaBezPDV.toFixed(2)} €</td>
          <td>{cijenaSaPDV.toFixed(2)} €</td>
          <td>{pdvPostotak}%</td>
          <td>{ukupnoSaPDV.toFixed(2)} €</td>
        </tr>
      );
    })}
  </tbody>
</Table>


            <Button variant="primary" onClick={handleSubmitOffer} className="ms-3">
                 Kreiraj ponudu
            </Button>

        </div>



    )
}

export default ShowOffer
