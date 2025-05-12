import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Login from './Login.js';
import User from './User.js';
import Admin from './Admin.js';

// Usage: ../index.js
// Highest-level component, direct user to Login, and User/Admin after login
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [asAdmin, setAsAdmin] = useState(false);
  const [username, setUsername] = useState('ERROR');

  const login = (admin = false, user = 'ERROR') => {
    setIsLoggedIn(true);
    setAsAdmin(admin);
    setUsername(user);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setAsAdmin(false);
  };

  const adminToggle = () => {
    setAsAdmin(prev => !prev);
  };

  const regenSession = async () => {
    const data = { asAdmin };
    await fetch('http://localhost:8080/session-regen', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  };

  return !isLoggedIn ? (
    <Login login={login} />
  ) : asAdmin ? (
    <Admin
      adminToggle={adminToggle}
      logout={logout}
      username={username}
    />
  ) : (
    <User
      adminToggle={adminToggle}
      logout={logout}
      username={username}
    />
  );
};

export default App;