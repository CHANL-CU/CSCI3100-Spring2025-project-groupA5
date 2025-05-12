import React, { useState, useEffect } from "react";
import styles from './styles/Login.module.css';
import { motion } from "framer-motion";
import PasswordStrengthChecker from './PasswordStrengthChecker.js';

const { LOGIN_OK, LOGIN_NOUSER, LOGIN_WRONGPW, LOGIN_WRONGKEY, LOGIN_NOADMIN, LOGIN_ERR } = require('../constants.js');

// Functions for enhancing Security //
function pemToArrayBuffer(pem) {
  pem = String(pem);
  const b64 = pem.replace(/(-----(BEGIN|END) PUBLIC KEY-----|\n)/g, '');
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

const str2ab = str => {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

async function encryptMessage(publicKeyPem, msg) {
  const publicKey = await window.crypto.subtle.importKey(
    'spki',
    pemToArrayBuffer(publicKeyPem),
    {
      name: 'RSA-OAEP',
      hash: 'SHA-1'
    },
    false,
    ['encrypt']
  );

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP'
    },
    publicKey,
    str2ab(msg)
  );

  return new Uint8Array(encrypted);
}
// Security End //

const isPasswordValid = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

// Usage: ./App.js
// Login/Register interface
const Login = (props) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [asAdmin, setAsAdmin] = useState(false);
  const [msg, setMsg] = useState('');
  const [password, setPassword] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const response = await fetch('${process.env.REACT_APP_API_BASE_URL}/session', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const sessionData = await response.json();
      if (sessionData) {
        props.login(sessionData.asAdmin, sessionData.name);
      }
    } else {
      console.log('No active session found.');
    }
  };

  const attemptLogin = async () => {
    const name = document.getElementById('name').value;
    const passwordInput = document.getElementById('password').value;
  
    const resp_pw = await fetch('${process.env.REACT_APP_API_BASE_URL}/encrypt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    let a = await resp_pw.json();
    let key = a.en;
  
    const encryptedPassword = await encryptMessage(key, passwordInput);
  
    const data = { name, password: encryptedPassword, asAdmin, licenseKey };
  
    const response = await fetch('${process.env.REACT_APP_API_BASE_URL}/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });
  
    const loginResult = await response.text();
    handleLoginResponse(loginResult, name);
  };

  const register = async () => {
    const name = document.getElementById('name').value;
    const passwordInput = document.getElementById('password').value;
    const isAdmin = asAdmin;
    const data = { name, password: passwordInput, email, isAdmin };
  
    if (!isPasswordValid(passwordInput)) {
      setMsg('The password setup is not valid');
      setError(true);
      return;
    }
  
    const response = await fetch('${process.env.REACT_APP_API_BASE_URL}/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  
    if (response.ok) {
      setIsRegistering(false);
      setMsg('Registration successful! Check your email for the license key.');
      setError(false);
    } else {
      setMsg('User already exists or email is invalid!');
      setError(true);
    }
  };

  const handleLoginResponse = (loginResult, name) => {
    switch (loginResult) {
      case LOGIN_OK:
        props.login(asAdmin, name);
        break;
      case LOGIN_NOUSER:
        setMsg(`User ${name} not found!`);
        setError(true);
        break;
      case LOGIN_WRONGPW:
        setMsg('Wrong password!');
        setError(true);
        break;
      case LOGIN_WRONGKEY:
        setMsg(`Invalid license key!`);
        setError(true);
        break;
      case LOGIN_NOADMIN:
        setMsg(`User ${name} is not an Admin!`);
        setError(true);
        break;
      case LOGIN_ERR:
      default:
        setMsg('ERR');
        setError(true);
        break;
    }
  };

  const handlePasswordChange = () => {
    setPassword(document.getElementById('password').value);
  };

  const submit = async (event) => {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const passwordInput = document.getElementById('password').value;
  
    // Email validity check during registration
    if (isRegistering) {
      const emailInput = document.getElementById('email').value;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
      if (!emailRegex.test(emailInput)) {
        setMsg('Please enter a valid email address.\n(example@gmail.com)');
        setError(true);
        return;
      }
      setEmail(emailInput); // Update state with valid email
    } else {
      // Login requires license key
      if (!licenseKey) {
        setMsg('Please enter your license key.');
        setError(true);
        return;
      }
    }
  
    // Proceed with login or registration
    if (!name || !passwordInput) {
      setMsg('Please fill in all fields.');
      setError(true);
    } else {
      isRegistering ? register() : attemptLogin();
    }
  };

  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.formContainer}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.pacmanLogo}>
          <div className={styles.pacman}></div>
          <div className={styles.dots}>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
          </div>
        </div>

        <h1 className={styles.title}>
          {isRegistering ? 'Register' : 'Login'}
        </h1>

        <div className={styles.modeToggle}>
          <button 
            className={`${styles.toggleBtn} ${!asAdmin ? styles.active : ''}`}
            onClick={() => { setAsAdmin(false); setMsg(''); setError(false); }}
          >
            User Mode
          </button>
          <button 
            className={`${styles.toggleBtn} ${asAdmin ? styles.active : ''}`}
            onClick={() => { setAsAdmin(true); setMsg(''); setError(false); }}
          >
            Admin Mode
          </button>
        </div>

        {isRegistering && (
          <button 
            className={styles.backButton}
            onClick={() => { setIsRegistering(false); setMsg(''); setError(false); }}
          >
            Back to Login
          </button>
        )}

        <form className={styles.form} onSubmit={submit}>
          <div className={styles.inputGroup}>
            <input 
              type="text" 
              id="name" 
              name="name" 
              placeholder="Username"
              className={styles.input}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="Password"
              className={styles.input}
              onChange={handlePasswordChange}
              required 
            />
          </div>

          {isRegistering ? (
            <div className={styles.inputGroup}>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email Address"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          ) : (
            <div className={styles.inputGroup}>
              <input
                type="text"
                id="licenseKey"
                name="licenseKey"
                placeholder="License Key"
                className={styles.input}
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                required
              />
            </div>
          )}

          {isRegistering && (
            <div className={styles.passwordRequirements}>
              <div className={`${styles.requirement} ${password.length >= 8 ? styles.met : ''}`}>
                <span className={styles.checkmark}>✓</span>
                At least 8 characters
              </div>
              <div className={`${styles.requirement} ${/[a-z]/.test(password) ? styles.met : ''}`}>
                <span className={styles.checkmark}>✓</span>
                One lowercase letter
              </div>
              <div className={`${styles.requirement} ${/[A-Z]/.test(password) ? styles.met : ''}`}>
                <span className={styles.checkmark}>✓</span>
                One uppercase letter
              </div>
              <div className={`${styles.requirement} ${/\d/.test(password) ? styles.met : ''}`}>
                <span className={styles.checkmark}>✓</span>
                One number
              </div>
            </div>
          )}

          <button type="submit" className={styles.submitButton}>
            {isRegistering ? 'Create Account' : 'Login'}
          </button>

          {msg && (
            <p className={`${styles.message} ${error ? styles.error : styles.success}`}>
              {msg}
            </p>
          )}
        </form>

        {!isRegistering && (
          <button 
            className={styles.registerLink}
            onClick={() => { setIsRegistering(true); setMsg(''); setError(false); }}
          >
            Need an account? Register Now
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default Login;