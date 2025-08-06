import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireProfileCompletion?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true, 
  requireProfileCompletion = true,
  redirectTo = '/login' 
}) => {
  const token = localStorage.getItem('token');
  const profileCompleted = localStorage.getItem('profileCompleted') === 'true';
  const isAuthenticated = !!token;
  const location = useLocation();

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // If user is authenticated but trying to access auth pages (login/register)
  if (!requireAuth && isAuthenticated) {
    return <Navigate to={profileCompleted ? "/home" : "/profile/setup"} replace />;
  }

  // If user is authenticated but profile is not completed and trying to access protected pages
  if (requireAuth && isAuthenticated && requireProfileCompletion && !profileCompleted) {
    // Allow access to profile setup page
    if (location.pathname === '/profile/setup') {
      return <>{children}</>;
    }
    // Redirect to profile setup for all other pages
    return <Navigate to="/profile/setup" replace />;
  }

  // If user has completed profile but trying to access setup page
  if (requireAuth && isAuthenticated && profileCompleted && location.pathname === '/profile/setup') {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 