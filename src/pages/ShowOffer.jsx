import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Table, InputGroup, FormControl } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import { Link } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';

const ShowOffer = () => {
    const [offers, setOffers] = useState([]);
    const [client, setClient] = useState([]);
    const [users, setUsers] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [searchUser, setSearchUser] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); //za modal za brisanje
    const [deleteId, setDeleteId] = useState(null);//za modal za brisanje
    const [selectedOffer, setSelectedOffer] = useState(null); //odabir ponude za odabir plaćanja
    const [showModal, setShowModal] = useState(false); //postavljanje načina plaćanja
    const [paymentMethod, setPaymentMethod] = useState('');

    const [typeEnum, setTypeEnum] = useState([]);

    const [payment, setPayment] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const offersPerPage = 30;


    useEffect(() => {
        fetchOffers();
        fetchClients();
        fetchUsers();
        fetchPayment();
    }, []);


    // Dohvati sve ponude
    const fetchOffers = async () => {
        try {
            const res = await axios.get('/api/aplication/getAllOffer');
            setOffers(res.data);
        } catch (error) {
            console.error('Greška pri dohvaćanju ponuda:', error);
            toast.error('Ne mogu dohvatiti ponude.');
        }
    };

    const fetchClients = async () => {
        try {
            const res = await axios.get('/api/aplication/getAllClients');
            setClient(res.data);
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

    const getClientType = (id) => {
        const foundClient = client.find(s => s.ID_client === id);
        return foundClient ? foundClient.TypeClient : 'Nepoznato';
    };

    const getClientName = (id) => {
        const foundClient = client.find(c => c.ID_client === id);
        if (!foundClient) return 'Nepoznato';
        return foundClient.TypeClient === 'Tvrtka' ? foundClient.Name : foundClient.ContactName;
    };

    const getUserName = (id) => {
        const user = users.find(u => u.ID_user === id);
        return user ? user.Name : 'Nepoznat';
    };

    const fetchPayment = async () => {
        try {
            const res = await axios.get('/api/aplication/getPaymentEnum');
            setPayment(res.data);
        } catch (error) {
            console.error('Greška pri dohvaćanju načina plaćanja', error);
        }
    };

    //postavljanje datuma u dd.mm.yy
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');     // dd
        const month = String(date.getMonth() + 1).padStart(2, '0'); // mm
        const year = date.getFullYear();     // yy (zadnje 2 znamenke godine)
        return `${day}.${month}.${year}`;
    };

    const openCreateReceiptModal = (offer) => {
        setSelectedOffer(offer);
        setPaymentMethod('');  // Resetiraj, neka nema odabira na početku
        setShowModal(true);
    };



    const confirmDeleteOffer = (id) => {
        setDeleteId(id);
        setShowDeleteConfirm(true);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/aplication/deleteOffer/${deleteId}`);
            toast.success('Ponuda obrisana.');
            fetchOffers();
        } catch (error) {
            console.error('Greška pri brisanju:', error);
            toast.error('Brisanje ponude nije uspjelo.');
        } finally {
            setShowDeleteConfirm(false);
            setDeleteId(null);
        }
    };

    const handleCreateReceipt = async () => {
            console.log("Odabrani način plaćanja:", paymentMethod);  // provjeri vrijednost
        try {
            await axios.post('/api/aplication/createReceiptFromOffer', {
                ID_offer: selectedOffer.ID_offer,
                ID_user: selectedOffer.ID_user, // ako uzimaš iz ponude
                PaymentMethod: paymentMethod
            });
            toast.success("Račun uspješno kreiran.");
            setShowModal(false);
            setPaymentMethod(''); // resetira odabir
        } catch (error) {
            console.error("Greška prilikom kreiranja računa:", error);
            toast.error("Greška prilikom kreiranja računa.");
        }
    };



    const filteredOffers = offers.filter((offer) => {
        const clientName = getClientName(offer.ID_client).toLowerCase();
        const userName = getUserName(offer.ID_user).toLowerCase();

        return (
            clientName.includes(searchName.toLowerCase()) &&
            userName.includes(searchUser.toLowerCase())
        );
    });

    if (sortConfig.key) {
        filteredOffers.sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    const indexOfLast = currentPage * offersPerPage;
    const indexOfFirst = indexOfLast - offersPerPage;
    const currentOffers = filteredOffers.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredOffers.length / offersPerPage);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="container px-3 mt-4">
            {/* Naslov i gumb */}
            <div className="row align-items-center mb-3">
                <div className="col-12 col-md">
                    <h2 className="mb-0">Prikaz svih ponuda</h2>
                </div>
                <div className="col-12 col-md-auto mt-2 mt-md-0 text-md-end">
                    <Button variant="danger" style={{ whiteSpace: 'nowrap' }}>
                        <Link to="/addOffer" className="nav-link text-white">
                            Dodaj novu ponudu
                        </Link>
                    </Button>
                </div>
            </div>
            {/* Filteri (pretraga) */}
            <div className="row g-3 mb-3">
                <div className="col-12 col-md-6 col-lg-4">
                    <InputGroup>
                        <FormControl
                            placeholder="Pretraga po nazivu"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                    </InputGroup>
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <InputGroup>
                        <FormControl
                            placeholder="Pretraga po kreatoru"
                            value={searchUser}
                            onChange={(e) => setSearchUser(e.target.value)}
                        />
                    </InputGroup>
                </div>
            </div>
            {currentOffers.length === 0 ? (
                <p>Nema ponuda.</p>
            ) : (
                <div className="table-responsive">
                    <Table striped bordered hover size="sm" className="mb-3">
                        <thead>
                            <tr>
                                <th>Broj ponude</th>
                                <th>Vrsta klijenta</th>
                                <th>Klijent</th>
                                <th>Datum kreiranja</th>
                                <th>Datum isteka</th>
                                <th>Cijena (s PDV)</th>
                                <th>Ponudu kreirao</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOffers.map((offer) => (
                                <tr key={offer.ID_offer}>
                                    <td>{offer.ID_offer}</td>
                                    <td>{getClientType(offer.ID_client)}</td>
                                    <td>{getClientName(offer.ID_client)}</td>
                                    <td>{formatDate(offer.DateCreate)}</td>
                                    <td>{formatDate(offer.DateEnd)}</td>
                                    <td>{Number(offer.PriceTax).toFixed(2)} €</td>
                                    <td>{getUserName(offer.ID_user)}</td>
                                    <td style={{ whiteSpace: 'nowrap' }}>
                                        <Button variant="secondary" size="sm" className="me-2" >Otvori</Button>
                                        <Button variant="warning" size="sm" className="me-2" onClick={() => openCreateReceiptModal(offer)}> Kreiraj račun </Button>
                                        <Button variant="danger" size="sm" className="me-2"> Izvezi PDF </Button>
                                        <Button variant="danger" size="sm" className="me-2" onClick={() => confirmDeleteOffer(offer.ID_offer)}> X </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
            {/* PAGINATION */}
            <div className="row align-items-center mt-3 px-2">
                <div className="col-12 col-md-6 mb-2 mb-md-0">
                    Prikazuje se {filteredOffers.length === 0 ? 0 : indexOfFirst + 1} - {Math.min(indexOfLast, filteredOffers.length)} od {filteredOffers.length} ponuda
                </div>
                <div className="col-12 col-md-6 text-md-end">
                    <Button
                        variant="secondary"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="me-2"
                    >
                        Prethodna
                    </Button>
                    <span className="align-middle mx-2">Stranica {currentPage} / {totalPages}</span>
                    <Button
                        variant="secondary"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="ms-2"
                    >
                        Sljedeća
                    </Button>
                </div>
            </div>
            {/* MODAL ZA POTVRDU BRISANJA */}
            <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Potvrda brisanja</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Jeste li sigurni da želite obrisati ovu ponudu?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Odustani</Button>
                    <Button variant="danger" onClick={handleDelete}>Obriši</Button>
                </Modal.Footer>
            </Modal>

            {/* MODAL ZA dodavanje plaćanja */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Odaberi način plaćanja</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Način plaćanja</Form.Label>
                        <Form.Control
                            as="select"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            <option value="">Odaberi način plaćanja</option>
                            {payment.map((method) => (
                                <option key={method} value={method}>
                                    {method}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Odustani
                    </Button>
                    <Button variant="danger" onClick={handleCreateReceipt} disabled={!paymentMethod}>
                        Potvrdi
                    </Button>
                </Modal.Footer>
            </Modal>


            <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop />

        </div>
    );
};

export default ShowOffer;
