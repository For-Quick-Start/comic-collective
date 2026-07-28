import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import global from '../styles/global.module.css';
import buttons from '../styles/buttons.module.css';
import form from '../styles/forms.module.css';
import layout1 from '../styles/layout1.module.css';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const { data } = await api.post('/api/users/forgot-password', { email });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className={layout1.pageContainer}>
      <div className={layout1.leftHalf}>
        <img src="/logo.png" alt="Comic Collective Logo" className={layout1.logo} />
      </div>
      <div className={layout1.rightHalf}>
        <div className={form.formContainer}>
          <h1>Forgot Password</h1>
          {error && <p className={global.error}>{error}</p>}
          {message && <p className={global.success}>{message}</p>}
          <form onSubmit={handleSubmit}>
            <div className={form.formGroup}>
              <label htmlFor="email">Enter your email address</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className={form.formActions}>
              <button type="submit" className={buttons.submitButton}>Send Reset Link</button>
              <Link to="/login" className={global.link}>Back to Login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;