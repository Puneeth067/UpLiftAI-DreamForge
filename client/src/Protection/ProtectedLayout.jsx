// ProtectedLayout.jsx
import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';

const ProtectedLayout = ({ children }) => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default ProtectedLayout;