import React from 'react';
import CustomerLayout from '../components/CustomerLayout';
import EmployeeLayout from '../components/EmployeeLayout';
import layout1Styles from '../styles/layout1.module.css';

function SettingsPage() {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const pageContent = (
    <div>
      <p><a href="/resetpass" className={layout1Styles.link}>Reset Password</a></p>
    </div>
  );

  if (userInfo?.role === 'employee') {
    return <EmployeeLayout title="Settings">{pageContent}</EmployeeLayout>;
  }

  return <CustomerLayout title="Settings">{pageContent}</CustomerLayout>;
}

export default SettingsPage;
