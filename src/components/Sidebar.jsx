// src/components/Sidebar.js
import React from "react";
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      {/* Hamburger dugme - prikazuje se samo na malim ekranima */}
      <button 
        className="btn btn-danger d-md-none m-2"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <i className="fas fa-bars"></i>
      </button>

      <div 
        className={`sidebar d-flex flex-column text-white vh-100 p-3
          ${isOpen ? 'sidebar-open' : ''}`} 
      >
        <h4 className="mb-4">Ovdje ide logo</h4>

        <ul className="nav nav-pills flex-column mb-auto">
          {/* ... isti sadržaj kao i prije */}
          <li className="nav-item mb-2">
            <a href="#" className="nav-link text-white">
              <i className="fas fa-tachometer-alt me-2"></i>
              Dashboard
            </a>
          </li>
          <li className="nav-item mb-2">
            <a href="#" className="nav-link text-white">
              <i className="fas fa-cogs me-2"></i>
              Components
            </a>
          </li>
          <li className="nav-item mb-2">
            <a href="#" className="nav-link text-white">
              <i className="fas fa-wrench me-2"></i>
              Utilities
            </a>
          </li>
          <li className="nav-item mb-2">
            <a href="#" className="nav-link text-white">
              <i className="fas fa-folder me-2"></i>
              Pages
            </a>
          </li>
          <li className="nav-item mb-2">
            <a href="#" className="nav-link text-white">
              <i className="fas fa-chart-area me-2"></i>
              Charts
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link text-white">
              <i className="fas fa-table me-2"></i>
              Tables
            </a>
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
