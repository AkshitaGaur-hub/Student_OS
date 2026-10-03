import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/auth';

export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && user) {
    const userRole = (user.role || '').toUpperCase();
    const hasRole = allowedRoles.some((r) => r.toUpperCase() === userRole);
    if (!hasRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
