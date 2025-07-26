// src/components/Sidebar.js
import React from "react";
import './Sidebar.css';
import { Link } from "react-router-dom"; // koristi za navigaciju unutar SPA

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      {/* Hamburger gumb - prikazuje se samo na malim ekranima */}
      <button
        className="btn btn-danger d-md-none m-2"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <i className="fas fa-bars" />
      </button>

      <div
        className={`sidebar d-flex flex-column text-white vh-100 p-3 ${isOpen ? 'sidebar-open' : ''}`}
      >
        <h4 className="mb-4">Ovdje ide logo</h4>

        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item mb-2">
            <Link to="/" className="nav-link text-white">
              <i className="fas fa-tachometer-alt me-2" />
              Početna
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/getAllUsers" className="nav-link text-white">
              <i className="fas fa-folder me-2" />
              Korisnici - zaposlenici
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/getAllClients" className="nav-link text-white">
              <i className="fas fa-folder me-2" />
              Klijenti
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/getAllMaterial" className="nav-link text-white">
              <i className="fas fa-folder me-2" />
              Materijali
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/getAllSupplier" className="nav-link text-white">
              <i className="fas fa-folder me-2" />
              Dobavljači
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/getAllService" className="nav-link text-white">
              <i className="fas fa-folder me-2" />
              Usluge
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/getAllOffer" className="nav-link text-white">
              <i className="fas fa-folder me-2" />
              Izrada ponude
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/invoices/create" className="nav-link text-white">
              <i className="fas fa-folder me-2" />
              Izrada računa
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/offers/history" className="nav-link text-white">
              <i className="fas fa-folder me-2" />
              Povijest ponuda
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/invoices/history" className="nav-link text-white">
              <i className="fas fa-folder me-2" />
              Povijest računa
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/activity" className="nav-link text-white">
              <i className="fas fa-folder me-2" />
              Aktivnosti
            </Link>
          </li>
        </ul>

        {/* Dugme za zatvaranje sidebar-a na malim ekranima */}
        <button
          className="btn btn-light rounded-circle sidebar-close-btn d-md-none"
          onClick={toggleSidebar}
          aria-label="Close sidebar"
        >
          &times;
        </button>
      </div>
    </>
  );
};

export default Sidebar;
