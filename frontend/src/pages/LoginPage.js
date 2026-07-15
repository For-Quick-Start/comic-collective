import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import buttonsStyles from '../styles/buttons.module.css';
import layout1Styles from '../styles/layout1.module.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/users/login', { email, password });
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
    <div className={layout1Styles.pageContainer}>
      <div className={layout1Styles.leftHalf}>
        <img src="/logo.png" alt="Comic Collective Logo" className={layout1Styles.logo} />
      </div>
      <div className={layout1Styles.rightHalf}>
        <div className={layout1Styles.formContainer}>
          <h1>Sign in</h1>
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className={layout1Styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={layout1Styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className={layout1Styles.formActions}>
              <button type="submit" className={buttonsStyles.submitButton}>Log in</button>
              <Link to="/resetpass" className={layout1Styles.link}>Forgot password?</Link>
              <Link to="/register" className={layout1Styles.link}>Sign up here</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
