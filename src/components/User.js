import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
//import ModeToggle from './ModeToggle.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import styled from 'styled-components';

class User extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isAdmin: false, darkMode: this.props.darkMode };
    this.darkToggle = this.darkToggle.bind(this);
    this.destroySession = this.destroySession.bind(this);
  }

  darkToggle() {
    this.props.darkToggle();
    this.setState({ darkMode: !this.state.darkMode });
  }

  async componentDidMount() {
    await this.checkAdmin();
    await this.regenSession();
  }

  async checkAdmin() {
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
        this.setState({ isAdmin: sessionData.isAdmin });
      }
    } else {
      console.log('ERR: No active session found.');
    }
  }

  async regenSession() {
    const data = { asAdmin: false, darkMode: this.state.darkMode };
    await fetch('http://localhost:8080/session-regen', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  async destroySession() {
    await fetch('http://localhost:8080/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.props.logout();
  }

  render() {
    const { darkMode } = this.state;
    return (
      <BrowserRouter>
        <div style={{backgroundColor: darkMode ? '#222' : 'white', minHeight: '100vh' }}>
          <BodyContainer darkMode={darkMode}>
            <Routes>
              <Route path="/" element={<UserGuide /*darkMode={darkMode}*/ />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BodyContainer>
        </div>
      </BrowserRouter>
    );
  }
}

// Optional: Default route component (if you want to redirect or show a default page)
const UserGuide = () => (
  <div>
    <h2>Welcome to the User Interface</h2>
    <p>There will be options to select Game or Leaderboard.</p>
  </div>
);

const Navbar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #ff5722;
  color: white;
  font-family: 'Montserrat', sans-serif;
`;

const NavList = styled.ul`
  list-style-type: none;
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 0;
  padding: 0;
`;

const NavLink = styled(Link)`
  color: #fff;
  text-decoration: none;
  padding: 10px;
  border-radius: 4px;
  &:hover {
    background-color: #fff;
    color: #e64a19;
  }
`;

const UserInfoContainer = styled.div`
  display: flex;
  align-items: center;
  color: white;
  gap: 10px;
`;

const Username = styled.div`
  margin-right: 10px;
`;

const UserIcon = styled.i`
  font-size: 24px;
  padding: 12px;
  cursor: pointer;
  color: white;
  border-radius: 16px;
  &:hover {
    background-color: #fff;
    color: #e64a19;
  }
`;

const BodyContainer = styled.div`
  margin: 30px;
  background-color: ${({ darkMode }) => (darkMode ? '#222' : '#fff3e0')}; /* Dark mode background */
  color: ${({ darkMode }) => (darkMode ? '#fff' : '#333')}; /* Text color */
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-family: 'Poppins', sans-serif;
`;

const ToggleButton = styled.button`
  background-color: ${({ darkMode }) => (darkMode ? '#555' : '#ff5722')}; 
  color: ${({ darkMode }) => (darkMode ? '#fff' : '#fff')}; 
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;

  &:hover {
    background-color: ${({ darkMode }) => (darkMode ? '#666' : '#e64a19')}; 
    transform: scale(1.05);
  }
`;

export default User;