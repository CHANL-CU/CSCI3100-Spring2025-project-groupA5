import React, { useEffect, useState } from 'react';

// Usage: ./User.js
// Fetch and display usernames and scores
const Leaderboard = (props) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:8080/leaderboard/users', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch users.');
      const usersData = await res.json();
      setUsers(usersData);
    } catch (error) {
      console.error(error);
      alert('Error fetching users.');
    }
  };

  // Fill the leaderboard with empty rows if there are less than 10 users
  const leaderboardRows = [...users];
  while (leaderboardRows.length < 10) {
    leaderboardRows.push({ name: '', highScore: '-' });
  }

  return (
    <div>
      <h2>Leaderboard</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Ranking</th>
            <th>User</th>
            <th>High Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardRows.map((user, index) => (
            <tr key={index} style={user.name === props.username ? styles.highlightRow : {}}>
              <td>{index + 1}</td>
              <td>{user.name || '-'}</td>
              <td>{user.highScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },
  highlightRow: {
    backgroundColor: '#f0f8ff', // Light blue highlight if user is on the list
  },
};

export default Leaderboard;