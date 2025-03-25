import ReactDOM from 'react-dom/client';
import React from 'react';

// Self-defined Module
import Login from './Login.js';
import User from './User.js';
import Admin from './Admin.js';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isLoggedIn: false, asAdmin: false, username: 'ERROR', darkMode: false };
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.adminToggle = this.adminToggle.bind(this);
    this.darkToggle = this.darkToggle.bind(this);
  }

  login(asAdmin=false, username='ERROR', darkMode=false) {
    this.setState({ isLoggedIn: true, asAdmin, username, darkMode });
  }

  logout() {
    this.setState({ isLoggedIn: false, asAdmin: false });
  }
  
  adminToggle() {
    this.setState({ asAdmin: !this.state.asAdmin });
  }

  darkToggle() {
    this.regenSession();
    this.setState({ darkMode: !this.state.darkMode });
  }

  async regenSession() {
    const data = { asAdmin: this.state.asAdmin, darkMode: !this.state.darkMode };
    await fetch('http://localhost:8080/session-regen', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  render() {
    return !this.state.isLoggedIn ? (
        <Login handler={this.login} />
    ) : this.state.asAdmin ? (
        <Admin toggler={this.adminToggle} darkMode={this.state.darkMode} darkToggle={this.darkToggle} logout={this.logout} username={this.state.username} />
    ) : (
        <User toggler={this.adminToggle} darkMode={this.state.darkMode} darkToggle={this.darkToggle} logout={this.logout} username={this.state.username} />
    );
  }
}

export default App;