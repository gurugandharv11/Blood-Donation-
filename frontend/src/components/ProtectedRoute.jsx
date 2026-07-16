import React from 'react';
import { Navigate } from 'react-router-dom';
import { Auth } from '../services/api';
import { useToast } from './ToastContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { showError } = useToast();

  if (!Auth.isLoggedIn() || Auth.isExpired()) {
    Auth.clear();
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = Auth.getRole();
    if (!allowedRoles.includes(userRole)) {
      // Direct back to dashboard or home, display error toast
      setTimeout(() => {
        showError('You do not have permission to access this page.');
      }, 100);
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};
