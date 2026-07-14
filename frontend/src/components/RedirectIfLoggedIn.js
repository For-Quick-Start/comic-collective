import React from 'react';
import { Navigate } from 'react-router-dom';

const RedirectIfLoggedIn = ({ children }) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  if (userInfo) {
    if (userInfo.role === 'employee') {
      return <Navigate to="/dashempl" replace />;
    } else if (userInfo.role === 'customer') {
      return <Navigate to="/dashcust" replace />;
    }
  }

  return children;
};

export default RedirectIfLoggedIn;