import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import EmployeeLayout from '../components/EmployeeLayout';
import global from '../styles/global.module.css';
import buttons from '../styles/buttons.module.css';
import form from '../styles/forms.module.css';


function AdminResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [targetUser, setTargetUser] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const { data } = await api.get(`/api/users/${id}`, config);
        setTargetUser(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not fetch user data');
      }
    };

    fetchUser();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
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
      await api.put(`/api/users/${id}/reset-password`, { password }, config);
      setMessage('Password reset successfully!');
      setTimeout(() => navigate(-1), 2000); // Go back to previous page after 2 seconds
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  if (!targetUser && !error) {
    return <EmployeeLayout title="Reset Password"><div>Loading...</div></EmployeeLayout>;
  }

  return (
    <EmployeeLayout title={`Reset ${targetUser ? targetUser.name : 'User'}'s Password`}>
      <div className={form.formContainer} style={{ width: '50%', margin: 'auto' }}>
        {message && <p className={global.success}>{message}</p>}
        {error && <p className={global.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className={form.formGroup}>
            <label htmlFor="password">New Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
          </div>
          <div className={form.formGroup}>
            <label htmlFor="confirmPassword">Confirm New Password</label>
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
            <button type="submit" className={buttons.submitButton}>Save Password</button>
            <button type="button" className={buttons.cancelButton} onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
      </div>
    </EmployeeLayout>
  );
}

export default AdminResetPasswordPage;