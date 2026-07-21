import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import EmployeeLayout from '../components/EmployeeLayout';
import global from '../styles/global.module.css';
import buttons from '../styles/buttons.module.css';
import form from '../styles/forms.module.css';

function RegisterCustomerPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await api.post('/api/users/register', { name, email, password }, config);
      setMessage('Employee registered successfully!');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <EmployeeLayout title="Register a New Customer">
      <div className={form.formContainer} style={{ width: '50%', margin: 'auto' }}>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className={form.formGroup}>
            <label htmlFor="name">Name:</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="new-password" />
          </div>
          <div className={form.formGroup}>
            <label htmlFor="email">Email:</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="new-password" />
          </div>
          <div className={form.formGroup}>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
          </div>
          <div className={form.formGroup}>
            <label htmlFor="confirmPassword">Password (again, to confirm)</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
          </div>

          <p className={global.passwordReqs}>
              {`Minimum password length is 8 characters and must contain at least one of:
  - Uppercase letter
  - Lowercase letter
  - Number
  - Symbol`}
          </p>
          <div className={form.formActions} style={{ justifyContent: 'center', gap: '1rem' }}>
            <button type="submit" className={buttons.submitButton}>Register Customer</button>
            <button type="button" className={buttons.cancelButton} onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
      </div>
    </EmployeeLayout>
  );
}

export default RegisterCustomerPage;
