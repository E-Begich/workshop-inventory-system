import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Modal, Table } from 'react-bootstrap';

const ShowOffer = () => {

    const [materials, setMaterials] = useState([]);
    const [selectedMaterialId, setSelectedMaterialId] = useState(null);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [users, setUsers] = useState([]);


    const [clients, setClients] = useState([]);
    // const [selectedClientId, setSelectedClientId] = useState(null);
    // const [selectedClient, setSelectedClient] = useState(null);

    const [service, setService] = useState([]);
    //   const [offers, setOffers] = useState([]);
    //  const [form, setForm] = useState({ ID_client: '', items: [] });
    //  const [showModal, setShowModal] = useState(false);
    //   const [editingOffer, setEditingOffer] = useState(null);

    const today = () => new Date().toISOString().split('T')[0];
const addDays = (n) => new Date(Date.now() + n * 86400000).toISOString().split('T')[0];


const [services, setServices] = useState([]);
const [offerItems, setOfferItems] = useState([]);

const [newItem, setNewItem] = useState({
  ID_material: '',
  ID_service: '',
  TypeItem: '',
  Amount: '',
});

    const [form, setForm] = useState({
        ID_client: '',
        ID_user: '',
        DateCreate: new Date().toISOString().split('T')[0],
        DateEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });


    useEffect(() => {
        fetchClients();
        fetchService();
        fetchMaterials();
        fetchUsers();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await axios.get('/api/aplication/getAllClients');
            setClients(res.data);
        } catch (error) {
            console.error('Greška pri dohvaćanju klijenata', error);
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

    const fetchMaterials = async () => {
        try {
            const res = await axios.get('/api/aplication/getAllMaterial');
            setMaterials(res.data);
        } catch (error) {
            console.error('Greška pri dohvaćanju dobavljača', error);
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




    return (
        <div className="container px-3 mt-4">
            <h2 className="text-lg font-semibold mb-4">Izrada ponude</h2>
            <Form.Group className="mb-3">
                <Form.Label>Klijent</Form.Label>
                <Form.Select
                    value={form.ID_client}
                    onChange={(e) => setForm({ ...form, ID_client: e.target.value })}
                >
                    <option value="">-- Odaberi klijenta --</option>
                    {clients.map(c => (
                        <option key={c.ID_client} value={c.ID_client}>
                            {c.NameClient}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Zaposlenik</Form.Label>
                <Form.Select
                    value={form.ID_user}
                    onChange={(e) => setForm({ ...form, ID_user: e.target.value })}
                >
                    <option value="">-- Odaberi korisnika --</option>
                    {users.map(u => (
                        <option key={u.ID_user} value={u.ID_user}>
                            {u.Username}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Datum kreiranja</Form.Label>
                <Form.Control type="date" value={form.DateCreate} disabled />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Datum završetka</Form.Label>
                <Form.Control type="date" value={form.DateEnd} disabled />
            </Form.Group>

            <Form.Group className="mb-3">
  <Form.Label>Materijal</Form.Label>
  <Form.Select
    value={newItem.ID_material}
    onChange={(e) => setNewItem({ ...newItem, ID_material: e.target.value })}
  >
    <option value="">-- Odaberi materijal --</option>
    {materials.map(m => (
      <option key={m.ID_material} value={m.ID_material}>
        {m.NameMaterial}
      </option>
    ))}
  </Form.Select>
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>Usluga</Form.Label>
  <Form.Select
    value={newItem.ID_service}
    onChange={(e) => setNewItem({ ...newItem, ID_service: e.target.value })}
  >
    <option value="">-- Odaberi uslugu --</option>
    {services.map(s => (
      <option key={s.ID_service} value={s.ID_service}>
        {s.NameService}
      </option>
    ))}
  </Form.Select>
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>Tip stavke</Form.Label>
  <Form.Select
    value={newItem.TypeItem}
    onChange={(e) => setNewItem({ ...newItem, TypeItem: e.target.value })}
  >
    <option value="">-- Odaberi tip --</option>
    <option value="MATERIAL">Materijal</option>
    <option value="SERVICE">Usluga</option>
  </Form.Select>
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>Količina</Form.Label>
  <Form.Control
    type="number"
    value={newItem.Amount}
    onChange={(e) => setNewItem({ ...newItem, Amount: e.target.value })}
  />
</Form.Group>

<Button onClick={handleAddItem}>Dodaj stavku</Button>
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
        <td>{services.find(s => s.ID_service == item.ID_service)?.NameService || '-'}</td>
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
    );
};



export default ShowOffer
