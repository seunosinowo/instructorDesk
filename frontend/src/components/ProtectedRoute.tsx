import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}) => {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    const profileCompleted = localStorage.getItem('profileCompleted') === 'true';
    return <Navigate to={profileCompleted ? "/dashboard" : "/profile/setup"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 