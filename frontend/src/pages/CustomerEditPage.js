import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import EmployeeLayout from '../components/EmployeeLayout';
import global from '../styles/global.module.css';
import button from '../styles/buttons.module.css';
import form from '../styles/forms.module.css';
import user from '../styles/userCards.module.css';


function CustomerEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const { data } = await api.get(`/api/users/${id}`, config);
        setFormData({
          name: data.name,
          email: data.email,
        });
      } catch (err) {
        setError('Could not fetch book data.');
      }
    };
    fetchBook();
  }, [id]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const userData = { ...formData || null };

      await api.put(`/api/users/${id}`, userData, config);
      setMessage('User updated successfully!');
      setTimeout(() => {
        navigate('/cust');
      }, 3000);

      } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during update.');
    }
  };

  return (
    <EmployeeLayout title="Edit Customer Login">
      {message && <p className={global.success}>{message}</p>}
      {error && <p className={global.error}>{error}</p>}
      <div className={user.cardContainer}>
        <div className={user.userCard}>
          <div className={user.userDetails}>
            <div className={form.formContainer}>
              <form onSubmit={handleSubmit}>
                <div className={form.formGrid}>
                  <div className={form.formGroup}>
                    <label htmlFor="name">Name*:</label>
                    <input id="name" type="text" name="name" value={formData.name} onChange={onChange} required />
                  </div>
                  <div className={form.formGroup}>
                    <label htmlFor="email">Email*:</label>
                    <input id="email" type="email" name="email" value={formData.email} onChange={onChange} required />
                  </div>
                </div>
                <div className={form.formActions}>
                  <button type="button" onClick={() => navigate('/cust')} className={button.cancelButton}>Cancel</button>
                  <button type="submit" className={button.submitButton}>Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}

export default CustomerEditPage;
