import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import global from '../styles/global.module.css';
import buttons from '../styles/buttons.module.css';
import form from '../styles/forms.module.css';
import layout1 from '../styles/layout1.module.css';

function ResetPasswordTokenPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const { data } = await api.put(`/api/users/reset-password/${token}`, { password });
      setMessage(data.message);
      localStorage.removeItem('userInfo'); // Clear any existing user session
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    }
  };

  return (
    <div className={layout1.pageContainer}>
      <div className={layout1.leftHalf}>
        <img src="/logo.png" alt="Comic Collective Logo" className={layout1.logo} />
      </div>
      <div className={layout1.rightHalf}>
        <div className={form.formContainer}>
          <h1>Reset Your Password</h1>
          {error && <p className={global.error}>{error}</p>}
          {message && <p className={global.success}>{message}</p>}
          {!message && (
            <form onSubmit={handleSubmit}>
              <div className={form.formGroup}>
                <label htmlFor="password">New Password</label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className={form.formGroup}>
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              <div className={form.formActions}>
                <button type="submit" className={buttons.submitButton}>Reset Password</button>
              </div>
            </form>
          )}
          {message && (
            <Link to="/login" className={global.link}>Proceed to Login</Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordTokenPage;