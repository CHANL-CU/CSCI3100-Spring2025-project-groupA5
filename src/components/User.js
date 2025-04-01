import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import styled from 'styled-components';
import PacmanGame from './PacmanGame.js';
import Leaderboard from './Leaderboard.js';
import { FaUserCircle } from 'react-icons/fa'; // User icon

// Usage: ./App.js
// Interface for navigating PacmanGame/Leaderboard
const User = (props) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [darkMode, setDarkMode] = useState(props.darkMode);
  const sessionMade = useRef(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <BrowserRouter>
      <Container darkMode={darkMode}>
        <Header>
          <Title>Pac-Man</Title>
          <NavButtons>
            <StyledLink to="/">Game</StyledLink>
            <StyledLink to="/leaderboard">Leaderboard</StyledLink>
          </NavButtons>
          <UserInfo>
            logged in as: {props.username} 
            <UserIcon onClick={toggleDropdown}>
              <FaUserCircle />
            </UserIcon>
            {dropdownOpen && (
              <Dropdown>
                {isAdmin && <DropdownItem onClick={props.adminToggle}>Admin Panel</DropdownItem>}
                <DropdownItem onClick={destroySession}>Logout</DropdownItem>
              </Dropdown>
            )}
          </UserInfo>
        </Header>
        <BodyContainer darkMode={darkMode}>
          <Routes>
            <Route path="/" element={<PacmanGame />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BodyContainer>
      </Container>
    </BrowserRouter>
  );
};

// Styled Components
const Container = styled.div`
  background-color: ${({ darkMode }) => (darkMode ? '#222' : 'white')};
  min-height: 100vh;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #f8f9fa;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
`;

const NavButtons = styled.div`
  display: flex;
  gap: 15px;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: #007bff; // Bootstrap primary color
  &:hover {
    text-decoration: underline;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const UserIcon = styled.div`
  margin-left: 10px;
  cursor: pointer;
  position: relative;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 50px;
  right: 10px;
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const DropdownItem = styled.div`
  padding: 10px;
  cursor: pointer;
  &:hover {
    background-color: #f1f1f1;
  }
`;

const BodyContainer = styled.div`
  margin: 30px;
  background-color: ${({ darkMode }) => (darkMode ? '#222' : '#fff3e0')};
  color: ${({ darkMode }) => (darkMode ? '#fff' : '#333')};
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-family: 'Poppins', sans-serif;
`;

export default User;