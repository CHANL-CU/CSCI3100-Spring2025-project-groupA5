import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import styled from 'styled-components';

const User = (props) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [darkMode, setDarkMode] = useState(props.darkMode);
  const sessionMade = useRef(false);

  const darkToggle = () => {
    props.darkToggle();
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    checkAdmin();
    if (!sessionMade.current) {
      sessionMade.current = true;
      regenSession();
    }
  }, [darkMode]);

  const checkAdmin = async () => {
    const response = await fetch('http://localhost:8080/auth', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const sessionData = await response.json();
      if (sessionData) {
        setIsAdmin(sessionData.isAdmin);
      }
    } else {
      console.log('ERR: No active session found.');
    }
  };

  const regenSession = async () => {
    const data = { asAdmin: false, darkMode };
    await fetch('http://localhost:8080/session-regen', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  };

  const destroySession = async () => {
    await fetch('http://localhost:8080/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    props.logout();
  };

  return (
    <BrowserRouter>
      <div style={{ backgroundColor: darkMode ? '#222' : 'white', minHeight: '100vh' }}>
        <BodyContainer darkMode={darkMode}>
          <Routes>
            <Route path="/" element={<UserGuide />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BodyContainer>
      </div>
    </BrowserRouter>
  );
};

// Optional: Default route component
const UserGuide = () => (
  <div>
    <h2>Welcome to the User Interface</h2>
    <p>There will be options to select Game or Leaderboard.</p>
  </div>
);

// Styled components
const BodyContainer = styled.div`
  margin: 30px;
  background-color: ${({ darkMode }) => (darkMode ? '#222' : '#fff3e0')}; /* Dark mode background */
  color: ${({ darkMode }) => (darkMode ? '#fff' : '#333')}; /* Text color */
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-family: 'Poppins', sans-serif;
`;

export default User;