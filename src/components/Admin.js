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
    await fetch('${process.env.REACT_APP_API_BASE_URL}/session-regen', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  };

  const destroySession = async () => {
    await fetch('${process.env.REACT_APP_API_BASE_URL}/logout', {
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
const theme = {
  primary: '#2C3E50',
  secondary: '#34495E',
  accent: '#3498DB',
  success: '#2ECC71',
  danger: '#E74C3C',
  warning: '#F1C40F',
  background: '#ECF0F1',
  white: '#FFFFFF',
  gray: '#95A5A6',
  text: '#2C3E50',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  shadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  shadowHover: '0 8px 15px rgba(0, 0, 0, 0.2)',
};

const styles = {
  container: {
    fontFamily: "'Inter', sans-serif",
    padding: '24px',
    backgroundColor: theme.background,
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center',
    color: theme.text,
    marginBottom: '2rem',
    padding: '2rem',
    backgroundColor: theme.white,
    borderRadius: theme.borderRadius,
    boxShadow: theme.shadow,
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    padding: '1rem',
    backgroundColor: theme.white,
    borderRadius: theme.borderRadius,
    boxShadow: theme.shadow,
  },
  ul: {
    listStyleType: 'none',
    display: 'flex',
    gap: '20px',
    padding: 0,
    margin: 0,
  },
  logoutButton: {
    backgroundColor: theme.danger,
    color: theme.white,
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    padding: '10px 30px',
  },
  main: {
    backgroundColor: theme.white,
    borderRadius: theme.borderRadius,
    padding: '2rem',
    boxShadow: theme.shadow,
  },
  section: {
    marginBottom: '40px',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
  },
  listItem: {
    border: '1px solid',
    borderColor: theme.gray,
    padding: '15px',
    marginBottom: '10px',
    borderRadius: '5px',
    backgroundColor: theme.white,
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
    border: '1px solid',
    borderColor: theme.accent
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
    backgroundColor: theme.success,
    color: theme.white,
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    width: 'fit-content',
    fontSize: '1vw',
    maxWidth: '100%',
  },
  buttonDelete: {
    padding: '8px 12px',
    backgroundColor: theme.danger,
    color: theme.white,
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
  background-color: ${theme.white};
  border-radius: ${theme.borderRadius};
  color: ${theme.text};
  margin: 1.5rem 0;
  box-shadow: ${theme.shadow};
  transition: ${theme.transition};

  &:hover {
    box-shadow: ${theme.shadowHover};
  }
`;

const RoundedButton = styled.button`
  background-color: ${theme.accent};
  color: ${theme.white};
  border: none;
  border-radius: ${theme.borderRadius};
  padding: 12px 24px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: ${theme.shadow};
  transition: ${theme.transition};

  &:hover {
    background-color: ${theme.secondary};
    transform: translateY(-2px);
    box-shadow: ${theme.shadowHover};
  }
`;

const NavLink = styled(Link)`
  color: ${theme.white};
  text-decoration: none;
  font-weight: 500;
  transition: ${theme.transition};

  &:hover {
    color: ${theme.white};
    opacity: 0.9;
  }
`;

export default Admin;
export { Container };