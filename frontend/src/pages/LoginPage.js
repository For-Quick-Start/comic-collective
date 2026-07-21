import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import global from '../styles/global.module.css';
import button from '../styles/buttons.module.css';
import form from '../styles/forms.module.css';
import layout1 from '../styles/layout1.module.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/users/auth/login', { email, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      if (data.role === 'employee') {
        window.location.href = '/dashempl';
      } else if (data.role === 'customer') {
        window.location.href = '/dashcust';
      } else {
        window.location.href = '/';
      }
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
          <h1>Sign in</h1>
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className={form.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={form.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className={form.formActions}>
              <button type="submit" className={button.submitButton}>Log in</button>
              <Link to="/resetpass" className={global.link}>Forgot password?</Link>
              <Link to="/register" className={global.link}>Sign up here</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
