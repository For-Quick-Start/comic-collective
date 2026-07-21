import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import EmployeeLayout from '../components/EmployeeLayout';
import global from '../styles/global.module.css';
import buttons from '../styles/buttons.module.css';
import userCards from '../styles/userCards.module.css';

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
      const { data } = await api.get('/api/users', config);
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
      await api.put(`/api/users/${id}`, { status: newStatus }, config);
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
        await api.delete(`/api/users/${id}`, config);
        fetchUsers(); // Refresh the list
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  };

  return (
    <EmployeeLayout title="Employees">
      {error && <p className={global.error}>{error}</p>}
      <a href="/regempl">
        <button className={buttons.submitButton}>Add a New Employee</button>
      </a>
      <div className={userCards.cardContainer}>
        {users.map((user) => (
          <div key={user._id} className={userCards.userCard}>
            <div className={userCards.userCardTitle}>
              <h2>{user.name}</h2>
            </div>
            <div className={userCards.userCardContent}>
              <div className={userCards.detailsRow}>
                <div className={userCards.detailsSection}>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Status:</strong> {user.status}</p>
                </div>
              </div>
              <div className={userCards.actionsRow}>
                <button onClick={() => navigate(`/empledit/${user._id}`)} className={buttons.editButton}>Edit</button>
                <button onClick={() => navigate(`/admin-reset-password/${user._id}`)} className={buttons.resetButton}>Reset Password</button>
                <button onClick={() => handleStatusChange(user._id, user.status === 'active' ? 'disabled' : 'active')} className={buttons.disableButton}>
                  {user.status === 'active' ? 'Disable' : 'Enable'}
                </button>
                <button onClick={() => handleDelete(user._id)} className={buttons.deleteButton}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </EmployeeLayout>
  );
}

export default EmployeesListPage;
