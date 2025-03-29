import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Login from './Login.js';
import User from './User.js';
import Admin from './Admin.js';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [asAdmin, setAsAdmin] = useState(false);
  const [username, setUsername] = useState('ERROR');
  const [darkMode, setDarkMode] = useState(false);

  const login = (admin = false, user = 'ERROR', mode = false) => {
    setIsLoggedIn(true);
    setAsAdmin(admin);
    setUsername(user);
    setDarkMode(mode);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setAsAdmin(false);
  };

  const adminToggle = () => {
    setAsAdmin(prev => !prev);
  };

  const darkToggle = async () => {
    await regenSession();
    setDarkMode(prev => !prev);
  };

  const regenSession = async () => {
    const data = { asAdmin, darkMode: !darkMode };
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
      darkMode={darkMode}
      darkToggle={darkToggle}
      logout={logout}
      username={username}
    />
  ) : (
    <User
      adminToggle={adminToggle}
      darkMode={darkMode}
      darkToggle={darkToggle}
      logout={logout}
      username={username}
    />
  );
};

export default App;