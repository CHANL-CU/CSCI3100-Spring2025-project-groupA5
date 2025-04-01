import React, { useState, useEffect } from "react";
import styled from 'styled-components';
import PasswordStrengthChecker from './PasswordStrengthChecker.js';

const { LOGIN_OK, LOGIN_NOUSER, LOGIN_WRONGPW, LOGIN_NOADMIN, LOGIN_ERR } = require('../constants.js');

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
    const response = await fetch('http://localhost:8080/session', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const sessionData = await response.json();
      if (sessionData) {
        props.login(sessionData.asAdmin, sessionData.name, sessionData.darkMode);
      }
    } else {
      console.log('No active session found.');
    }
  };

  const attemptLogin = async () => {
    const name = document.getElementById('name').value;
    const passwordInput = document.getElementById('password').value;
  
    const resp_pw = await fetch('http://localhost:8080/encrypt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    let a = await resp_pw.json();
    let key = a.en;
  
    const encryptedPassword = await encryptMessage(key, passwordInput);
  
    const data = { name, password: encryptedPassword, asAdmin, licenseKey };
  
    const response = await fetch('http://localhost:8080/login', {
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
  
    const response = await fetch('http://localhost:8080/register', {
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
    <Container>
      <FormContainer>
        <Title>{isRegistering ? 'Register' : 'Login'}</Title>
        <SubTitle>
          {asAdmin ? (
            <ToggleButton onClick={() => { setAsAdmin(false); setMsg(''); setError(false); }}>As User</ToggleButton>
          ) : (
            'As User'
          )}
          {asAdmin ? 'As Admin' : <ToggleButton onClick={() => { setAsAdmin(true); setMsg(''); setError(false); }}>As Admin</ToggleButton>}
        </SubTitle>

        {isRegistering && (
          <ToggleButton onClick={() => { setIsRegistering(false); setMsg(''); setError(false); }}>Back to Login</ToggleButton>
        )}
        <Form id="postForm" onSubmit={submit}>
          <Input type="text" id="name" name="name" placeholder="Username" required />
          <Input onChange={handlePasswordChange} type="password" id="password" name="password" placeholder="Password" required />  
          {isRegistering ? (
            <>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </>
          ) : (
            <Input
              type="text"
              id="licenseKey"
              name="licenseKey"
              placeholder="License Key"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              required
            />
          )}
          {isRegistering && (
            <>
              <PasswordStrengthChecker password={password} />
              <PasswordRequirements>
                <Requirement>
                  <RequirementIcon met={password.length >= 8} />
                  At least 8 characters
                </Requirement>
                <Requirement>
                  <RequirementIcon met={/[a-z]/.test(password)} />
                  At least one lowercase letter
                </Requirement>
                <Requirement>
                  <RequirementIcon met={/[A-Z]/.test(password)} />
                  At least one uppercase letter
                </Requirement>
                <Requirement>
                  <RequirementIcon met={/\d/.test(password)} />
                  At least one number
                </Requirement>
              </PasswordRequirements>
            </>
          )}
          <Button type="submit">{isRegistering ? 'Register' : 'Login'}</Button>
          <p style={{ textAlign: 'center', color: 'red' }}>{msg}</p>
        </Form>
        {!isRegistering && (
          <>
            <br />
            <ToggleButton onClick={() => { setIsRegistering(true); setMsg(''); setError(false); }}>Register Now</ToggleButton>
          </>
        )}
      </FormContainer>
    </Container>
  );
};

const PasswordRequirements = styled.div`
  margin-bottom: 1rem;
`;

const Requirement = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const RequirementIcon = styled.span`
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: ${props => (props.met ? '#4dff4d' : '#ccc')};
  margin-right: 0.5rem;
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #fff3e0; /* Light orange background */
`;

const FormContainer = styled.div`
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 2rem;
  text-align: center;
  margin-bottom: 1.5rem;
  color: #ff5722; /* Vibrant orange */
`;

const SubTitle = styled.h2`
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 1rem;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #ffab40; /* Orange border */
  border-radius: 0.25rem;
  font-size: 1rem;
  background-color: #fff;
  color: #333;

  &:focus {
    outline: none;
    border-color: #ff5722; /* Darker orange on focus */
    box-shadow: 0 0 0 3px rgba(255, 87, 34, 0.25);
  }
`;

const Button = styled.button`
  padding: 0.8rem 1.2rem;
  background-color: #ff5722; /* Primary vibrant orange */
  color: #ffffff;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 1rem;

  &:hover {
    background-color: #e64a19; /* Darker shade for hover */
  }
`;

const ToggleButton = styled(Button)`
  background-color: transparent;
  color: #ff5722; /* Primary orange */
  font-size: 0.7rem;
  font-weight: bold; 
  border: 1px solid #ff5722;
  margin: 10px;
  &:hover {
    background-color: #ff5722;
    color: #ffffff;
  }
`;

export default Login;