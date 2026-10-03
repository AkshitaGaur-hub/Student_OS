import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/auth';

export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = authService.hasRole(allowedRoles);
    if (!hasPermission) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

