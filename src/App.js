import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ShowMaterials from './pages/ShowMaterials';
import Sidebar from "./components/Sidebar";
import TopNavBar from "./components/TopNavBar";

const App = () => {
  return (
    <BrowserRouter>
      <div className="d-flex">
        {/* Sidebar */}
        <Sidebar />

        <div className="flex-grow-1" style={{ marginLeft: "250px", minHeight: "100vh" }}>
          {/* Gornja traka */}
          <TopNavBar />

          {/* Glavni sadržaj ispod navbara */}
          <div className="p-4" style={{ paddingTop: "80px" }}>
            <Routes>
              <Route path="/" element={<ShowMaterials />} />
              <Route path="/getAllMaterial" element={<ShowMaterials />} />
              <Route path="/getAllSupplier" element={<ShowMaterials />} />
              {/* Dodaj ovdje druge rute po potrebi */}
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
