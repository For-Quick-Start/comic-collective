import React from 'react';
import CustomerLayout from '../components/CustomerLayout';
import EmployeeLayout from '../components/EmployeeLayout';
import global from '../styles/global.module.css';

function SettingsPage() {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const pageContent = (
    <div>
      <p><a href="/resetpass" className={global.link}>Reset Password</a></p>
    </div>
  );

  if (userInfo?.role === 'employee') {
    return <EmployeeLayout title="Settings">{pageContent}</EmployeeLayout>;
  }

  return <CustomerLayout title="Settings">{pageContent}</CustomerLayout>;
}

export default SettingsPage;
