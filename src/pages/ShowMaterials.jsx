import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Table } from 'react-bootstrap';

const ShowMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    NameMaterial: '',
    CodeMaterial: '',
    Amount: '',
    Unit: '',
    Location: '',
    Description: '',
    MinAmount: '',
    PurchasePrice: '',
    SellingPrice: '',
    ID_supplier: '',
    TypeChange: ''
  });
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [search, setSearch] = useState({ naziv: '', sifra: '' });
  const [sortOrder, setSortOrder] = useState({ field: '', asc: true });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 30;

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    const res = await axios.get('/api/aplication/getAllMaterial');
    setMaterials(res.data);
  };

  useEffect(() => {
    let data = [...materials];

    data = data.filter(mat =>
      mat.NameMaterial.toLowerCase().includes(search.naziv.toLowerCase()) &&
      mat.CodeMaterial.toLowerCase().includes(search.sifra.toLowerCase())
    );

    if (sortOrder.field) {
      data.sort((a, b) => {
        const valA = a[sortOrder.field];
        const valB = b[sortOrder.field];
        if (valA < valB) return sortOrder.asc ? -1 : 1;
        if (valA > valB) return sortOrder.asc ? 1 : -1;
        return 0;
      });
    }

    setFiltered(data);
    setCurrentPage(1);
  }, [search, sortOrder, materials]);

  const handleAddMaterial = async () => {
    try {
      await axios.post('/api/aplication/addMaterial', formData);
      setShowModal(false);
      fetchMaterials();
      setFormData({
        NameMaterial: '',
        CodeMaterial: '',
        Amount: '',
        Unit: '',
        Location: '',
        Description: '',
        MinAmount: '',
        PurchasePrice: '',
        SellingPrice: '',
        ID_supplier: '',
        TypeChange: ''
      });
    } catch (error) {
      console.error('Greška prilikom dodavanja materijala:', error);
    }
  };

  const handleDelete = async () => {
    await axios.delete(`/api/materials/${deleteId}`);
    setShowDeleteConfirm(false);
    fetchMaterials();
  };

  const handleSort = (field) => {
    if (sortOrder.field === field) {
      setSortOrder({ ...sortOrder, asc: !sortOrder.asc });
    } else {
      setSortOrder({ field, asc: true });
    }
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filtered.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  return (
    <div className="px-4 mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Materijali</h2>
        <Button variant="danger" onClick={() => setShowModal(true)}>Dodaj materijal</Button>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <Form.Control
            type="text"
            placeholder="Pretraži po nazivu"
            value={search.naziv}
            onChange={(e) => setSearch({ ...search, naziv: e.target.value })}
            className="mb-2"
          />
        </div>
        <div className="col-md-6">
          <Form.Control
            type="text"
            placeholder="Pretraži po šifri"
            value={search.sifra}
            onChange={(e) => setSearch({ ...search, sifra: e.target.value })}
            className="mb-2"
          />
        </div>
      </div>

      <Table striped bordered hover responsive size="sm">
        <thead>
          <tr>
            {[
              { label: 'ID', field: 'ID_material' },
              { label: 'Naziv', field: 'NameMaterial' },
              { label: 'Šifra', field: 'CodeMaterial' },
              { label: 'Količina', field: 'Amount' },
              { label: 'Jedinica', field: 'Unit' },
              { label: 'Lokacija', field: 'Location' },
              { label: 'Opis', field: 'Description' },
              { label: 'Min. količina', field: 'MinAmount' },
              { label: 'Nabavna cijena', field: 'PurchasePrice' },
              { label: 'Prodajna cijena', field: 'SellingPrice' },
              { label: 'ID dobavljača', field: 'ID_supplier' },
              { label: 'Tip promjene', field: 'TypeChange' },
            ].map(col => (
              <th key={col.field} onClick={() => handleSort(col.field)} style={{ cursor: 'pointer' }}>
                {col.label} {sortOrder.field === col.field ? (sortOrder.asc ? '▲' : '▼') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentRows.map((mat) => (
            <tr key={mat.ID_material}>
              <td>{mat.ID_material}</td>
              <td>{mat.NameMaterial}</td>
              <td>{mat.CodeMaterial}</td>
              <td>{mat.Amount}</td>
              <td>{mat.Unit}</td>
              <td>{mat.Location}</td>
              <td>{mat.Description}</td>
              <td>{mat.MinAmount}</td>
              <td>{mat.PurchasePrice}</td>
              <td>{mat.SellingPrice}</td>
              <td>{mat.ID_supplier}</td>
              <td>{mat.TypeChange}</td>
              <td>
                <Button variant="warning" size="sm" className="me-2">Uredi</Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setDeleteId(mat.ID_material);
                    setShowDeleteConfirm(true);
                  }}
                >
                  Obriši
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* PAGINACIJA */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          Prikazujem {indexOfFirstRow + 1} - {Math.min(indexOfLastRow, filtered.length)} od {filtered.length} materijala
        </div>
        <div>
          <Button
            variant="outline-primary"
            size="sm"
            className="me-2"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            ⬅️ Prethodna
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              variant={currentPage === i + 1 ? "primary" : "outline-primary"}
              size="sm"
              className="me-1"
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="outline-primary"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Sljedeća ➡️
          </Button>
        </div>
      </div>


      {/* Modal za dodavanje materijala */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Dodaj novi materijal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Naziv materijala</Form.Label>
              <Form.Control
                type="text"
                value={formData.NameMaterial}
                onChange={(e) => setFormData({ ...formData, NameMaterial: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Šifra materijala</Form.Label>
              <Form.Control
                type="text"
                value={formData.CodeMaterial}
                onChange={(e) => setFormData({ ...formData, CodeMaterial: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Količina</Form.Label>
              <Form.Control
                type="number"
                value={formData.Amount}
                onChange={(e) => setFormData({ ...formData, Amount: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Jedinica</Form.Label>
              <Form.Select
                value={formData.Unit}
                onChange={(e) => setFormData({ ...formData, Unit: e.target.value })}
              >
                <option value="">Odaberi jedinicu</option>
                <option value="Metri">Metri</option>
                <option value="Centimetri">Centimetri</option>
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Lokacija</Form.Label>
              <Form.Select
                value={formData.Location}
                onChange={(e) => setFormData({ ...formData, Location: e.target.value })}
              >
                <option value="">Odaberi lokaciju</option>
                <option value="Skladiste 1">Skladište 1</option>
                <option value="Skladiste 2">Skladište 2</option>
                <option value="Skladiste 3">Skladište 3</option>
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Opis </Form.Label>
              <Form.Control
                type="text"
                value={formData.Description}
                onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Minimalna količina (količina nakon koje bi trebalo napraviti narudžbu)</Form.Label>
              <Form.Control
                type="number"
                value={formData.MinAmount}
                onChange={(e) => setFormData({ ...formData, MinAmount: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Nabavna cijena (bez PDV-a)</Form.Label>
              <Form.Control
                type="number"
                value={formData.PurchasePrice}
                onChange={(e) => setFormData({ ...formData, PurchasePrice: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Prodajna cijena (bez PDV-a)</Form.Label>
              <Form.Control
                type="number"
                value={formData.SellingPrice}
                onChange={(e) => setFormData({ ...formData, SellingPrice: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Dobavljač</Form.Label>
              <Form.Control
                type="number"
                value={formData.cijena}
                onChange={(e) => setFormData({ ...formData, cijena: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Vrsta promjene</Form.Label>
              <Form.Control
                type="number"
                value={formData.cijena}
                onChange={(e) => setFormData({ ...formData, cijena: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Zatvori</Button>
          <Button variant="success" onClick={handleAddMaterial}>Spremi</Button>
        </Modal.Footer>
      </Modal>

      {/* Potvrda brisanja */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Potvrda brisanja</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Jeste li sigurni da želite obrisati ovaj materijal?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Odustani</Button>
          <Button variant="danger" onClick={handleDelete}>Obriši</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ShowMaterials;
