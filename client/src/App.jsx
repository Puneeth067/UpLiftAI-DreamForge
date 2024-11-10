// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
// import PrivateRoute from './components/common/PrivateRoute/PrivateRoute';
// import ProtectedLayout from './Protection/ProtectedLayout';
import './App.css';
import './styles/globals.css';

// Lazy load components for better performance
const HomePage = lazy(() => import('./pages/Home/HomePage'));
const AuthPages = lazy(() => import('./pages/Auth/AuthPage'));
const CustomerDashboard = lazy(() => import('./pages/Dashboard/CustomerDashboard'));
const AgentDashboard = lazy(() => import('./pages/Dashboard/AgentDashboard'));
const CustomerChatInterface = lazy(() => import('./pages/Chats/CustomerChatInterface'));
const AgentChatInterface = lazy(() => import('./pages/Chats/AgentChatInterface'));
// const SettingsPage = lazy(() => import('./pages/Profile/SettingsPage'));
// const TicketsPage = lazy(() => import('./pages/Tickets/TicketsPage'));
// const TicketDetailsPage = lazy(() => import('./pages/Tickets/TicketDetailsPage'));
const NotFoundPage = lazy(() => import('./pages/Error/NotFoundPage'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
  </div>
);

// Route configuration object
const ROUTES = {
  PUBLIC: {
    HOME: '/',
    AUTH: '/auth',
    NOT_FOUND: '/404'
  },
  PROTECTED: {
    CUSTOMER: {
      DASHBOARD: '/customerdashboard',
      CHAT: '/customerchatinterface'
    },
    AGENT: {
      DASHBOARD: '/agentdashboard',
      CHAT: '/agentchatinterface'
    }
    //,
    // COMMON: {
    //   SETTINGS: '/settings',
    //   TICKETS: '/tickets',
    //   TICKET_DETAILS: '/tickets/:id'
    // }
  }
};

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes - without AuthProvider and ErrorBoundary */}
          <Route path={ROUTES.PUBLIC.HOME} element={<HomePage />} />
          <Route path={ROUTES.PUBLIC.AUTH} element={<AuthPages />} />
          <Route path={ROUTES.PUBLIC.NOT_FOUND} element={<NotFoundPage />} />

          {/* Protected routes - wrapped with ProtectedLayout */}
          {/* <Route element={<ProtectedLayout />}> */}
            {/* Protected Customer routes */}
            <Route
              path={ROUTES.PROTECTED.CUSTOMER.DASHBOARD}
              element={
                // <PrivateRoute userType="customer">
                  <CustomerDashboard />
                // {/* </PrivateRoute> */}
              }
            />
            <Route
              path={ROUTES.PROTECTED.CUSTOMER.CHAT}
              element={
                // <PrivateRoute userType="customer">
                  <CustomerChatInterface />
                // </PrivateRoute>
              }
            />

            {/* Protected Agent routes */}
            <Route
              path={ROUTES.PROTECTED.AGENT.DASHBOARD}
              element={
                // <PrivateRoute userType="agent">
                  <AgentDashboard />
                // </PrivateRoute>
              }
            />
            <Route
              path={ROUTES.PROTECTED.AGENT.CHAT}
              element={
                // <PrivateRoute userType="agent">
                  <AgentChatInterface />
                // </PrivateRoute>
              }
            />

            {/* Common protected routes
            <Route
              path={ROUTES.PROTECTED.COMMON.SETTINGS}
              element={
                // <PrivateRoute>
                  <SettingsPage />
                // </PrivateRoute>
              }
            />
            <Route
              path={ROUTES.PROTECTED.COMMON.TICKETS}
              element={
                <PrivateRoute>
                  <TicketsPage />
                </PrivateRoute>
              }
            /> */}
            {/* <Route
              path={ROUTES.PROTECTED.COMMON.TICKET_DETAILS}
              element={
                <PrivateRoute>
                  <TicketDetailsPage />
                </PrivateRoute>
              }
            /> */}
          {/* </Route> */}

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to={ROUTES.PUBLIC.NOT_FOUND} replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;