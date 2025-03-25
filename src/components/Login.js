import React from "react";
import styled from 'styled-components';
import PasswordStrengthChecker from './PasswordStrengthChecker.js'

const { LOGIN_OK, LOGIN_NOUSER, LOGIN_WRONGPW, LOGIN_NOADMIN, LOGIN_ERR } = require('../constants.js');

// Security Start //

function pemToArrayBuffer(pem) {
  pem = String(pem)
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
  // Import the public key
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

  // Encrypt a message
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

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isRegistering: false, asAdmin: false, msg: '', password: '', error: false };
    this.submit = this.submit.bind(this);
  }

  async componentDidMount() {
    // Check session on mount
    await this.checkSession();
  }

  async checkSession() {
    const response = await fetch('http://localhost:8080/session', {
      method: 'POST',
      credentials: 'include', // Ensure cookies are sent with the request
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const sessionData = await response.json();
      if (sessionData) {
        console.log(sessionData.darkMode);
        this.props.handler(sessionData.asAdmin, sessionData.name, sessionData.darkMode); // set isLoggedIn true in index.js
      }
    } else {
      console.log('No active session found.');
    }
  }

  async attemptLogin() {
    let name = document.getElementById('name').value;
    let password = document.getElementById('password').value;
    let asAdmin = this.state.asAdmin;

    const resp_pw = await fetch('http://localhost:8080/encrypt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    let a = await resp_pw.json()

    let key = a.en

    password = await encryptMessage(key, password);

    let data = { name, password, asAdmin };


    const response = await fetch('http://localhost:8080/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });

    const loginResult = await response.text();
    this.handleLoginResponse(loginResult, name);
  }

  register = async () => {
    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;
    const isAdmin = this.state.asAdmin;
    const data = { name, password, isAdmin };

    if (!isPasswordValid(password)) {
      this.setState({
        msg: 'The password setup is not vaild',
        error: true,
      });
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
      this.setState({ isRegistering: false, msg: 'Registration successful!', error: false });
    } else {
      this.setState({ msg: 'User already exists!', error: true });
    }
  }

  handleLoginResponse(loginResult, name) {
    console.log(loginResult)
    switch (loginResult) {
      case LOGIN_OK:
        this.props.handler(this.state.asAdmin, name); // login
        break;
      case LOGIN_NOUSER:
        this.setState({ msg: `User ${name} not found!`, error: true });
        break;
      case LOGIN_WRONGPW:
        this.setState({ msg: 'Wrong password!', error: true });
        break;
      case LOGIN_NOADMIN:
        this.setState({ msg: `User ${name} is not an Admin!`, error: true });
        break;
      case LOGIN_ERR:
      default:
        this.setState({ msg: 'ERR', error: true });
        break;
    }
  }

  password_change = async () => {
    this.setState({ password: document.getElementById('password').value })
  }


  submit = async (event) => {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;
    if (!name || !password) {
      this.setState({ msg: 'Please fill in all fields.', error: true });
    }
    else {
      this.state.isRegistering ? this.register() : this.attemptLogin();
    }
  }

  render() {
    const { isRegistering, asAdmin, password } = this.state;

    return (
      <Container>
        <FormContainer>
          <Title>{isRegistering ? 'Register' : 'Login'}</Title>
          <SubTitle>
            {asAdmin ? (
              <ToggleButton onClick={() => this.setState({ asAdmin: false, msg: '', error: false })}>As User</ToggleButton>
            ) : (
              'As User'
            )}
            {asAdmin ? 'As Admin' : <ToggleButton onClick={() => this.setState({ asAdmin: true, msg: '', error: false })}>As Admin</ToggleButton>}
          </SubTitle>

          {isRegistering ? (
            <ToggleButton onClick={() => this.setState({ isRegistering: false, msg: '', error: false })}>Back to Login</ToggleButton>
          ) : (
            ''
          )}
          <Form id="postForm">
            <Input type="text" id="name" name="name" placeholder="Username" />
            <Input onChange={this.password_change} type="password" id="password" name="password" placeholder="Password" />
            {isRegistering ? (
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
            ) : (
              <></>
            )}
            <Button onClick={this.submit}>{isRegistering ? 'Register' : 'Login'}</Button>
            <p style={{ textAlign: 'center', color: 'red' }}>{this.state.msg}</p>
          </Form>
          {!isRegistering ? (
            <>
              <br />
              <ToggleButton onClick={() => this.setState({ isRegistering: true, msg: '', error: false })}>Register Now</ToggleButton>
            </>
          ) : (
            <></>
          )}
        </FormContainer>
      </Container>
    );
  }
}

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
  background-color: #fff3e0;  /* Light orange background */
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
