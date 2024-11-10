// AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchUserType = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('usertype')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserType(data.usertype);
      return data.usertype;
    } catch (error) {
      console.error('Error fetching user type:', error);
      setAuthError(error.message);
      setUserType(null);
      return null;
    }
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            await fetchUserType(session.user.id);
          } else {
            setUser(null);
            setUserType(null);
          }
        }
      } catch (error) {
        if (mounted) {
          setAuthError(error.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        setLoading(true);
        try {
          if (session?.user) {
            setUser(session.user);
            await fetchUserType(session.user.id);
          } else {
            setUser(null);
            setUserType(null);
          }
        } catch (error) {
          setAuthError(error.message);
        } finally {
          setLoading(false);
        }
      }
    });

    initializeAuth();

    // Cleanup
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    user,
    userType,
    loading,
    authError,
    isInitialized,
    clearAuthError,
    fetchUserType
  };

  return (
    <AuthContext.Provider value={value}>
      {isInitialized ? children : null}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};