import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  if (!userInfo || !allowedRoles.includes(userInfo.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
