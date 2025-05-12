import React, { useEffect, useState } from 'react';
import { Container } from './Admin.js';
import styled from 'styled-components';

const UserCRUD = ({ styles }) => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ name: '', password: '', email: '', highScore: 0, isAdmin: false });
    const [editingUserId, setEditingUserId] = useState(null);
    const [editUserData, setEditUserData] = useState({});
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('${process.env.REACT_APP_API_BASE_URL}/admin/users', {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to fetch users.');
            const usersData = await res.json();
            setUsers(usersData);
        } catch (error) {
            console.error(error);
            alert('Error fetching users.');
        }
    };

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const filterUsers = () => {
        return users.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()));
    };

    const handleCreateChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewUser(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCreate = async () => {
        const { name, password, email, highScore } = newUser;
        if (!name || !password || !email) {
            alert('Please fill in all required fields.');
            return;
        }

        try {
            const payload = { name, password, email, highScore, isAdmin: newUser.isAdmin };
            const res = await fetch('${process.env.REACT_APP_API_BASE_URL}/admin/users', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Failed to create user.');
            alert('User created successfully.');
            setNewUser({ name: '', password: '', email: '', isAdmin: false });
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert(`Error creating user: ${error.message}`);
        }
    };

    const startEdit = (user) => {
        setEditingUserId(user._id);
        setEditUserData({ name: user.name, password: '', email: user.email, highScore: user.highScore, isAdmin: user.isAdmin });
    };

    const cancelEdit = () => {
        setEditingUserId(null);
        setEditUserData({});
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditUserData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const saveEdit = async () => {
        const { name, email, highScore } = editUserData;
        if (!name) {
            alert('Username cannot be empty.');
            return;
        }

        const payload = { name, email, highScore, isAdmin: editUserData.isAdmin };
        if (editUserData.password.trim() !== '') {
            payload.password = editUserData.password;
        }

        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/users/${editingUserId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Failed to update user.');
            alert('User updated successfully.');
            cancelEdit();
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert(`Error updating user: ${error.message}`);
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) throw new Error('Failed to delete user.');
            alert('User deleted successfully.');
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert(`Error deleting user: ${error.message}`);
        }
    };

    const filteredUsers = filterUsers();

    return (
        <div style={styles.section}>
            <h2 style={{ margin: '0 auto', textAlign: 'center' }}>Manage Users</h2>
            <h3>Create New User</h3>
            <div style={styles.formContainer}>
                <input 
                    type="text" 
                    name="name" 
                    value={newUser.name}
                    onChange={handleCreateChange} 
                    placeholder="Username" 
                    style={styles.input}
                />
                <input 
                    type="text" 
                    name="password" 
                    value={newUser.password}
                    onChange={handleCreateChange} 
                    placeholder="Password" 
                    style={styles.input}
                />
                <input 
                    type="email" 
                    name="email" 
                    value={newUser.email}
                    onChange={handleCreateChange} 
                    placeholder="Email" 
                    style={styles.input}
                />
                <input 
                    type="number" 
                    name="highScore" 
                    value={newUser.highScore}
                    onChange={handleCreateChange} 
                    placeholder="High Score" 
                    style={styles.input}
                />
                <label style={styles.checkboxLabel}>
                    Admin?
                    <input 
                        type="checkbox" 
                        name="isAdmin" 
                        checked={newUser.isAdmin} 
                        onChange={handleCreateChange} 
                        style={styles.checkbox}
                    />
                </label>
                <button onClick={handleCreate} style={styles.button}>Create</button>
            </div>
            <hr />
            <h3>Existing Users</h3>
            <input 
                type="text" 
                placeholder="Search by Username" 
                value={searchQuery} 
                onChange={handleSearch} 
                style={styles.input} 
            />
            <Container style={{ overflowY: 'auto', maxHeight: '40vh' }}>
                <ul style={styles.list}>
                    {filteredUsers.map(u => (
                        <li key={u._id} style={styles.listItem}>
                            {editingUserId === u._id ? (
                                <div style={styles.formContainer}>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={editUserData.name} 
                                        onChange={handleEditChange} 
                                        placeholder="Username" 
                                        style={styles.input}
                                    />
                                    <input 
                                        type="text" 
                                        name="password" 
                                        value={editUserData.password} 
                                        onChange={handleEditChange} 
                                        placeholder="Password (leave blank to keep unchanged)" 
                                        style={styles.input}
                                    />
                                    <input 
                                        type="email" 
                                        name="email" 
                                        value={editUserData.email} 
                                        onChange={handleEditChange} 
                                        placeholder="Email" 
                                        style={styles.input}
                                    />
                                    <input 
                                        type="number" 
                                        name="highScore" 
                                        value={editUserData.highScore} 
                                        onChange={handleEditChange} 
                                        placeholder="High Score" 
                                        style={styles.input}
                                    />
                                    <label style={styles.checkboxLabel}>
                                        Admin?
                                        <input 
                                            type="checkbox" 
                                            name="isAdmin" 
                                            checked={editUserData.isAdmin} 
                                            onChange={handleEditChange} 
                                            style={styles.checkbox}
                                        />
                                    </label>
                                    <button onClick={saveEdit} style={styles.button}>Save</button>
                                    <button onClick={cancelEdit} style={styles.button}>Cancel</button>
                                </div>
                            ) : (
                                <div style={styles.userDetails}>
                                    <strong>Username:</strong> {u.name} <br />
                                    <strong>Password:</strong> {u.password} <br />
                                    <strong>Email:</strong> {u.email} <br />
                                    <strong>High Score:</strong> {u.highScore} <br />
                                    <strong>License Key {'(No Edit)'}:</strong> {u.licenseKey} <br />
                                    <strong>Admin:</strong> {u.isAdmin ? 'Yes' : 'No'} <br />
                                    <button onClick={() => startEdit(u)} style={styles.button}>Edit</button>
                                    <button onClick={() => deleteUser(u._id)} style={styles.buttonDelete}>Delete</button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </Container>
        </div>
    );
};

export default UserCRUD;