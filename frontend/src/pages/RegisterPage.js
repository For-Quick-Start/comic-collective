import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import global from '../styles/global.module.css';
import buttons from '../styles/buttons.module.css';
import form from '../styles/forms.module.css';
import layout1 from '../styles/layout1.module.css';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const { data } = await api.post('/api/users/register', { name, email, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      window.location.href = '/dashcust';
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
          <h1>Register</h1>
          {error && <p className={global.error}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className={form.formGroup}>
              <label htmlFor="name">Name</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="new-password" />
            </div>
            <div className={form.formGroup}>
              <label htmlFor="email">Email</label>
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

            <div className={form.formActions}>
              <button type="submit" className={buttons.submitButton}>Register</button>
              <Link to="/login" className={global.link}>Already have an account? Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
