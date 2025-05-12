import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import styled from 'styled-components';
import PacmanGame from './PacmanGame.js';
import Leaderboard from './Leaderboard.js';
import { FaUserCircle } from 'react-icons/fa'; // User icon
import { COLOR_THEMES } from '../constants.js';

// Usage: ./App.js
// Interface for navigating PacmanGame/Leaderboard
const User = (props) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const sessionMade = useRef(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(COLOR_THEMES[0]); // Default theme
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (!sessionMade.current) {
      sessionMade.current = true;
      checkAdmin();
      regenSession();
    }
  }, []);

  const checkAdmin = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth`, {
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
    const data = { asAdmin: false };
    await fetch(`${process.env.REACT_APP_API_BASE_URL}/session-regen`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  };

  const destroySession = async () => {
    await fetch(`${process.env.REACT_APP_API_BASE_URL}/logout`, {
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

  const toggleColorDropdown = () => {
    setColorDropdownOpen(!colorDropdownOpen);
  };

  const handleThemeSelect = (theme) => {
    setSelectedTheme(theme);
    setColorDropdownOpen(false);
  };
  
  const startGame = () => {
    setGameStarted(true);
  }

  const stopGame = () => {
    setGameStarted(false);
  }

  const sendScore = async (score) => {
      const payload = { name: props.username, score };
      if (!payload.name || payload.score === undefined) {
          alert('ERR: Failed to send score.');
          return;
      }
      try {
          const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/update-score`, {
              method: 'PUT',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error('Failed to send score.');
          alert('Your score was uploaded successfully.');
      } catch (error) {
          console.error(error);
          alert(`Error: ${error.message}`);
      }
  };

  return (
    <BrowserRouter>
      <Container>
        <Header>
          <Title>Pac-Man</Title>
          <div style={{position: `relative`}}>
          <ColorThemeButton onClick={toggleColorDropdown}
            style={{
                    backgroundColor: `${selectedTheme[0]}`,
                    color: `${selectedTheme[2]}` 
            }}>
            Color Themes
          </ColorThemeButton>
          {colorDropdownOpen && (
            <ColorDropdown>
              {COLOR_THEMES.map((theme, index) => (
                <ColorCircle title={theme[3]}
                  key={index}
                  onClick={() => handleThemeSelect(theme)}
                  style={{
                    background: `linear-gradient(to right, ${theme[0]}, ${theme[2]})`,
                    border: `2px solid ${theme[1]}`
                  }}
                />
              ))}
            </ColorDropdown>
          )}
          </div>
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
        <BodyContainer>
          <Routes>
            <Route path="/" element={
              gameStarted ? 
              <PacmanGame colorTheme={selectedTheme} sendScore={sendScore} /> : 
              <StartButton onClick={startGame}
              style={{
                backgroundColor: `${selectedTheme[0]}`,
                color: `${selectedTheme[2]}` 
              }}>
              Start Game
              </StartButton>} 
            />
            <Route path="/leaderboard" element={<Leaderboard username={props.username} stopGame={stopGame} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BodyContainer>
      </Container>
    </BrowserRouter>
  );
};

// Styled Components
const Container = styled.div`
  background-color: white;
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

const ColorThemeButton = styled.button`
  margin-left: 0px;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  padding: 8px;
  font-size: 16px;
  &:hover {
    text-decoration: underline;
  }
`;

const ColorDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: -75%;
  background-color: white;
  border: 1px solid #ccc;
  padding: 10px;
  display: flex;
  gap: 10px;
  z-index: 1000;
`;

const ColorCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
`;

const NavButtons = styled.div`
  display: flex;
  gap: 15px;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: #007bff;
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
  margin: 5px;
  background-color: #fff3e0;
  color: #333;
  padding: 5px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-family: 'Poppins', sans-serif;
`;

const StartButton = styled.button`
  margin-left: 0px;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 18px;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

export default User;