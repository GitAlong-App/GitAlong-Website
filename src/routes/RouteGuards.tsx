import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PageFallback } from '../components/PageFallback';

type GuardProps = {
  children: React.ReactElement;
};

type PublicRouteProps = GuardProps & {
  redirectAuthenticatedTo?: string;
};

export const ProtectedRoute: React.FC<GuardProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageFallback fullScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
};

export const PublicRoute: React.FC<PublicRouteProps> = ({ children, redirectAuthenticatedTo }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <PageFallback fullScreen />;
  }

  if (currentUser && redirectAuthenticatedTo) {
    return <Navigate to={redirectAuthenticatedTo} replace />;
  }

  return children;
};
