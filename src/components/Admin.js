import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import UserCRUD from './UserCRUD.js';
import styled from 'styled-components';

// Usage: ./App.js
const Admin = (props) => {
  const sessionMade = useRef(false);

  useEffect(() => {
    if (!sessionMade.current) {
      sessionMade.current = true;
      regenSession();
    }
  }, []);

  const regenSession = async () => {
    const data = { asAdmin: true };
    await fetch('http://localhost:8080/session-regen', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  };

  const destroySession = async () => {
    await fetch('http://localhost:8080/logout', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    props.logout();
  };

  return (
    <BrowserRouter>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1>Admin Panel</h1>
          <p>Currently logged in as: {props.username}</p>
        </header>
        <nav className='container container-fluid'>
          <div className='row'>
            <div className='col' style={styles.ul}>
              <RoundedButton><NavLink to="/users">Manage Users</NavLink></RoundedButton>
            </div>
            <div className='col-3'>
              <div className='container container-fluid'>
                <div className='row'>
                  <div className='col' style={{ padding: '10px' }}>
                    <button onClick={props.adminToggle} style={styles.button}>
                      User Mode
                    </button>
                  </div>
                  <div className='col'>
                    <button onClick={destroySession} style={styles.logoutButton}>Logout</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <hr />
        <Container>
          <main style={styles.main}>
            <Routes>
              <Route path="/" element={<AdminGuide />} />
              <Route path="/users" element={<UserCRUD styles={styles} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </Container>
      </div>
    </BrowserRouter>
  );
};

// Optional: Default route component
const AdminGuide = () => (
  <div>
    <h2>Welcome to the Admin Panel</h2>
    <p>Please select an option from the navigation menu.</p>
  </div>
);

// Styling
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    backgroundImage: 'linear-gradient(to bottom, rgb(194, 220, 255), white)',
  },
  header: {
    textAlign: 'center',
    color: '#1c2e50',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  ul: {
    listStyleType: 'none',
    display: 'flex',
    gap: '20px',
    padding: 0,
    margin: 0,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    padding: '10px 30px',
  },
  main: {
    marginTop: '20px',
  },
  section: {
    marginBottom: '40px',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
  },
  listItem: {
    border: '1px solid #bdc3c7',
    padding: '15px',
    marginBottom: '10px',
    borderRadius: '5px',
    backgroundColor: '#ffffff',
    overflowX: 'auto',
  },
  userDetails: {
    whiteSpace: 'pre-wrap',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  input: {
    padding: '10px',
    fontSize: '14px',
    borderRadius: '4px',
    border: '1px solid #2980b9',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  checkbox: {
    width: '16px',
    height: '16px',
  },
  button: {
    padding: '8px 12px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    width: 'fit-content',
    fontSize: '1vw',
    maxWidth: '100%',
  },
  buttonDelete: {
    padding: '8px 12px',
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    marginLeft: '10px',
    fontSize: '1vw',
    maxWidth: '100%',
  },
};

const Container = styled.div`
  padding: 2rem;
  background-color: rgba(205, 230, 247, 0.7);
  border: 2px solid #007bff;
  border-radius: 25px; 
  color: #333;
  margin: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
`;

const RoundedButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 25px; 
  padding: 10px 20px;
  font-size: 14px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, background-color 0.05s ease;

  &:hover {
    background-color: #fff; 
    transform: scale(1.1); 
  }
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-family: 'Montserrat', sans-serif;
  padding: 10px;
  border-radius: 4px;
  display: inline-block;
  transition: color 0.3s ease;

  ${RoundedButton}:hover & {
    color: #007bff; 
  }
`;

export default Admin;
export { Container };