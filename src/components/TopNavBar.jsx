import React from "react";
import { Navbar, Container, Nav, Badge } from "react-bootstrap";
import { FaBell, FaEnvelope } from "react-icons/fa";

const TopNavBar = () => {
  return (
    <Navbar bg="light" expand="lg" className="shadow-sm px-4">
      <Container fluid>
        <Navbar.Brand className="fw-bold text-danger">ADMIN</Navbar.Brand>
        <Nav className="ms-auto d-flex align-items-center gap-4">
          <div className="position-relative">
            <FaBell size={18} />
            <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
              3+
            </Badge>
          </div>

          <div className="position-relative">
            <FaEnvelope size={18} />
            <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
              7
            </Badge>
          </div>

          <div className="vr" /> {/* Okomita linija */}
          
          <div className="d-flex align-items-center">
            <span className="me-2 text-muted">Douglas McGee</span>
          </div>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default TopNavBar;
