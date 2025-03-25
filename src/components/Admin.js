import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
//import ModeToggle from './ModeToggle.js';
import styled from 'styled-components';

class Admin extends React.Component {
  constructor(props) {
    super(props);
    this.destroySession = this.destroySession.bind(this);
  }

  async componentDidMount() {
    await this.regenSession();
  }

  async regenSession() {
    const data = { asAdmin: true };
    await fetch('http://localhost:8080/session-regen', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  async destroySession() {
    await fetch('http://localhost:8080/logout', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    this.props.logout();
  }

  render() {
    return (
      <BrowserRouter>
        <div style={styles.container}>
          <header style={styles.header}>
            <h1>Admin Panel</h1>
            <p>Currently logged in as: {this.props.username}</p>
          </header>
          <nav className='container container-fluid'>
            <div className='row'>
              <div className='col' style={styles.ul}>
                <RoundedButton><NavLink to="/events">Manage Events</NavLink></RoundedButton>
                <RoundedButton><NavLink to="/users">Manage Users</NavLink></RoundedButton>
                <RoundedButton><NavLink to="/locations">Manage Locations</NavLink></RoundedButton>
                <RoundedButton><NavLink to="/announcements">Manage Announcements</NavLink></RoundedButton>
              </div>
              <div className='col-3'>
                <div className='container container-fluid'>
                  <div className='row'>
                    <div className='col' style={{padding:'10px'}}>
                      {/*<ModeToggle toggler={this.props.toggler} asAdmin={true}/>*/}
                    </div>
                    <div className='col'>
                      <button onClick={this.destroySession} style={styles.logoutButton}>Logout</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          <hr />
          <Container>
            <main style={styles.main}>
              <Routes>
                <Route path="/" element={<AdminGuide />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </Container>
          </div>
      </BrowserRouter>
    );
  }
}

// Optional: Default route component (if you want to redirect or show a default page)
const AdminGuide = () => (
  <div>
    <h2>Welcome to the Admin Panel</h2>
    <p>Please select an option from the navigation menu.</p>
  </div>
);

// Styling
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    backgroundImage: 'linear-gradient(to bottom,rgb(194, 220, 255),white,white,white,white)',
    //backgroundColor: '#f0f4f8', // Light background for cold theme
  },
  header: {
    textAlign: 'center',
    color: '#1c2e50', // Darker text for contrast
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  ul: {
    listStyleType: 'none',
    display: 'flex',
    gap: '20px',
    padding: 0,
    margin: 0,
  },
  li: {
    display: 'inline',
  },
  // navLink: {
  //   textDecoration: 'none',
  //   color: '#007bff',
  //   padding: '10px 15px',
  //   borderRadius: '4px',
  //   transition: 'background-color 0.3s, color 0.3s',
  // },
  navLinkHover: {
    backgroundColor: '#007bff',
    color: 'white',
  },
  logoutButton: {
    backgroundColor: '#e74c3c', // Red for logout to draw attention
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    padding: '10px 30px',
  },
  main: {
    marginTop: '20px',
  },
  section: {
    marginBottom: '40px',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
  },
  listItem: {
    border: '1px solid #bdc3c7', // Light gray border
    padding: '15px',
    marginBottom: '10px',
    borderRadius: '5px',
    backgroundColor: '#ffffff', // White background for items
    overflowX:'auto'
  },
  eventDetails: {
    whiteSpace: 'pre-wrap',
  },
  userDetails: {
    whiteSpace: 'pre-wrap',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  input: {
    padding: '10px',
    fontSize: '14px',
    borderRadius: '4px',
    border: '1px solid #2980b9', // Blue border
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  checkbox: {
    width: '16px',
    height: '16px',
  },
  button: {
    padding: '8px 12px',
    backgroundColor: '#4CAF50', // Green
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    width: 'fit-content',
    fontSize:'1vw',
    maxWidth:'100%',
  },
  buttonDelete: {
    padding: '8px 12px',
    backgroundColor: '#e74c3c', // Red for delete action
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    marginLeft: '10px',
    fontSize:'1vw',
    maxWidth:'100%'
  },
};

const Container = styled.div`
  padding: 2rem;
  background-color:rgba(205, 230, 247, 0.7);
  border: 2px solid #007bff;
  border-radius: 25px; 
  color: #333;
  margin: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
`;
const RoundedButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 25px; 
  padding: 10px 20px;
  font-size: 14px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add box shadow */
  transition: transform 0.2s ease, background-color 0.05s ease; /* Smooth transition for hover effects */

  &:hover {
    background-color: #fff; /* Change background color on hover */
    transform: scale(1.1); /* Increase size on hover */
  }
`;
const NavLink = styled(Link)`
  color: white; /* Default link color */
  text-decoration: none;
  font-family: 'Montserrat', sans-serif; /* Corrected property name */
  padding: 10px; /* Remove quotes around value */
  border-radius: 4px; /* Remove quotes around value */
  display: inline-block; /* Ensure it behaves like a block element for padding */
  transition: color 0.3s ease; /* Smooth transition for color change */

  ${RoundedButton}:hover & {
    color: #007bff; /* Change link color to orange on button hover */
  }
`;

export default Admin;