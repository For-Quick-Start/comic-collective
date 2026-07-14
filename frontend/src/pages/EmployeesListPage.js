import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EmployeeLayout from '../components/EmployeeLayout';
import globalStyles from '../styles/global.module.css';
import buttonsStyles from '../styles/buttons.module.css';
// import layout2Styles from '../styles/layout2.module.css';
import userCardsStyles from '../styles/userCards.module.css';

function EmployeesListPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const fetchUsers = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get('/api/users', config);
      setUsers(data.filter((user) => user.role === 'employee'));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not fetch users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.put(`/api/users/${id}`, { status: newStatus }, config);
      fetchUsers(); // Refresh the list
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        await axios.delete(`/api/users/${id}`, config);
        fetchUsers(); // Refresh the list
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  };

  return (
    <EmployeeLayout title="Employees">
      {error && <p className={globalStyles.error}>{error}</p>}
      <a href="/regempl">
        <button className={buttonsStyles.submitButton}>Add a New Employee</button>
      </a>
      <div className={userCardsStyles.cardContainer}>
        {users.map((user) => (
          <div key={user._id} className={userCardsStyles.userCard}>
            <div className={userCardsStyles.userCardTitle}>
              <h2>{user.name}</h2>
            </div>
            <div className={userCardsStyles.userCardContent}>
              <div className={userCardsStyles.detailsRow}>
                <div className={userCardsStyles.detailsSection}>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Status:</strong> {user.status}</p>
                </div>
              </div>
              <div className={userCardsStyles.actionsRow}>
                <button onClick={() => navigate(`/custedit/${user._id}`)} className={buttonsStyles.editButton}>Edit</button>
                <button onClick={() => navigate(`/admin-reset-password/${user._id}`)} className={buttonsStyles.resetButton}>Reset Password</button>
                <button onClick={() => handleStatusChange(user._id, user.status === 'active' ? 'disabled' : 'active')} className={buttonsStyles.disableButton}>
                  {user.status === 'active' ? 'Disable' : 'Enable'}
                </button>
                <button onClick={() => handleDelete(user._id)} className={buttonsStyles.deleteButton}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </EmployeeLayout>
  );
}

export default EmployeesListPage;
