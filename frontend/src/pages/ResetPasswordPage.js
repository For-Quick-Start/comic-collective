import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import CustomerLayout from '../components/CustomerLayout';
import EmployeeLayout from '../components/EmployeeLayout';
import globalStyles from '../styles/global.module.css';
import buttonsStyles from '../styles/buttons.module.css';
import form from '../styles/forms.module.css';

function ResetPasswordPage() {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await api.put('/api/users/me/reset-password', { password }, config);
      setMessage('Password reset successfully! Redirecting...');
      setTimeout(() => navigate(-1), 2000); // Go back to previous page
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const pageContent = (
    <div className={form.formContainer} style={{ width: '50%', margin: 'auto' }}>
      {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className={form.formGroup}>
          <label htmlFor="password">New Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
        </div>
        <div className={form.formGroup}>
          <label htmlFor="confirmPassword">New Password (again, to confirm)</label>
          <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
        </div>
        <p className={globalStyles.passwordReqs}>
          {`Minimum password length is 8 characters and must contain at least one of:
  - Uppercase letter
  - Lowercase letter
  - Number
  - Symbol`}
        </p>
        <div className={form.formActions} style={{ justifyContent: 'center', gap: '1rem' }}>
          <button type="submit" className={buttonsStyles.submitButton}>Save New Password</button>
          <button type="button" className={buttonsStyles.cancelButton} onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );

  if (userInfo?.role === 'employee') {
    return <EmployeeLayout title="Reset Your Password">{pageContent}</EmployeeLayout>;
  }

  return <CustomerLayout title="Reset Your Password">{pageContent}</CustomerLayout>;
}

export default ResetPasswordPage;
