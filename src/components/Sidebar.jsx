// src/components/Sidebar.js
import React from "react";
import './Sidebar.css'; // za dodatni stil ako treba

const Sidebar = () => {
  return (
<div className="d-flex flex-column text-white vh-100 p-3"
     style={{ width: '250px', position: 'fixed', left: 0, top: 0, backgroundColor: '#b22222' }}>
      <h4 className="mb-4">Ovdje ide logo</h4>

      <ul className="nav nav-pills flex-column mb-auto">
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

      <div className="mt-auto text-center">
        <button className="btn btn-light rounded-circle">
          <i className="fas fa-angle-left text-primary"></i>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
