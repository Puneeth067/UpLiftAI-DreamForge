// components/PrivateRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

const PrivateRoute = ({ children, userType: requiredUserType }) => {
  const { user, userType, loading, authError, isInitialized } = useAuth();
  const location = useLocation();

  // Show nothing until auth is initialized
  if (!isInitialized) {
    return null;
  }

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Show error if there's an auth error
  if (authError) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>
          Authentication error: {authError}. Please try signing in again.
        </AlertDescription>
      </Alert>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check user type if specified
  if (requiredUserType && userType !== requiredUserType) {
    const redirectPath = userType === 'agent' ? '/agentdashboard' : '/customerdashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default PrivateRoute;