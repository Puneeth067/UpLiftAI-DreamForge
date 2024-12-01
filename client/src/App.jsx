// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
// import PrivateRoute from './components/common/PrivateRoute/PrivateRoute';
// import ProtectedLayout from './Protection/ProtectedLayout';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';
import './styles/globals.css';

// Lazy load components for better performance
const HomePage = lazy(() => import('./pages/Home/HomePage'));
const AuthPages = lazy(() => import('./pages/Auth/AuthPage'));
const CustomerDashboard = lazy(() => import('./pages/Dashboard/CustomerDashboard'));
const AgentDashboard = lazy(() => import('./pages/Dashboard/AgentDashboard'));
const CustomerChatInterface = lazy(() => import('./pages/Chats/CustomerChatInterface'));
const AgentChatInterface = lazy(() => import('./pages/Chats/AgentChatInterface'));
const CustomerTickets = lazy(() => import('./pages/Tickets/CustomerTickets'));
const AgentTickets = lazy(() => import('./pages/Tickets/AgentTickets'));
const SettingsPage = lazy(() => import('./pages/Profile/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage'));
const AgentPortfolio = lazy(() => import('./pages/Portfolio/AgentPortfolio'));
const NotFoundPage = lazy(() => import('./pages/Error/NotFoundPage'));
const CreatorDiscoverPage = lazy(() => import('./pages/Portfolio/CreatorDiscoverPage'));

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
      CHAT: '/customerchatinterface',
      TICKET: '/customertickets',
      PORTFOLIOVIEW: '/portfolioview'
    },
    AGENT: {
      DASHBOARD: '/agentdashboard',
      CHAT: '/agentchatinterface',
      TICKET: '/agenttickets',
      PORTFOLIO: '/portfolio'
    },
    COMMON: {
      PROFILE: '/profile',
      SETTING: '/settings',
    }
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
      <ThemeProvider>
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

              <Route
                path={ROUTES.PROTECTED.CUSTOMER.TICKET}
                element={
                  // <PrivateRoute userType="agent">
                    <CustomerTickets />
                  // </PrivateRoute>
                }
              />

              <Route path={ROUTES.PROTECTED.CUSTOMER.PORTFOLIOVIEW} element={<CreatorDiscoverPage />} />

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

              <Route
                path={ROUTES.PROTECTED.AGENT.PORTFOLIO}
                element={
                  <AgentPortfolio />
                }
              />            

              <Route
                path={ROUTES.PROTECTED.AGENT.TICKET}
                element={
                  // <PrivateRoute userType="agent">
                    <AgentTickets />
                  // </PrivateRoute>
                }
              />

              {/* Common protected routes
              ProfilePage */}
              <Route
                path={ROUTES.PROTECTED.COMMON.PROFILE}
                element={
                  // <PrivateRoute>
                    <ProfilePage />
                  //</PrivateRoute> 
                }
              />

              <Route
                path={ROUTES.PROTECTED.COMMON.SETTING}
                element={
                  // <PrivateRoute>
                    <SettingsPage />
                  //</PrivateRoute> 
                }
              />
              

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to={ROUTES.PUBLIC.NOT_FOUND} replace />} />
          </Routes>
        </Suspense>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;