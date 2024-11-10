import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, Lock, User, Building, Phone, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../utils/supabase.js';

const DEPARTMENTS = [
  'Technical Support',
  'Customer Service',
  'Billing Support',
  'Product Support'
];

const DEFAULT_FORM_DATA = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  department: '', 
  phoneNumber: '',
};

const AuthPages = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  
  const [authMode, setAuthMode] = useState(state?.mode || 'login');
  const [userType, setUserType] = useState(state?.userType || 'customer');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const validateForm = useCallback(() => {
    const newErrors = {};
  
    if (authMode === 'register') {
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      }
      if (!formData.confirmPassword || formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
  
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
  
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, authMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setIsLoading(true);
    
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }
  
    try {
      if (authMode === 'login') {
        // First try to sign in
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        
        if (signInError) {
          throw signInError;
        }

        if (!authData?.user?.id) {
          throw new Error('No user data received after login');
        }

        try {
          // Attempt to fetch profile with retry logic
          let profileData = null;
          let retryCount = 0;
          const maxRetries = 3;

          while (retryCount < maxRetries && !profileData) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authData.user.id)
              .single();

            if (profile) {
              profileData = profile;
              break;
            }

            if (profileError && !profileError.message.includes('policy')) {
              throw profileError;
            }

            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between retries
            }
          }

          if (!profileData) {
            // If we still don't have profile data after retries
            // Create a default profile based on auth data
            const defaultProfile = {
              id: authData.user.id,
              email: authData.user.email,
              fullname: authData.user.user_metadata?.fullName || 'User',
              usertype: authData.user.user_metadata?.userType || 'customer',
              department: authData.user.user_metadata?.department || null,
              phonenumber: authData.user.user_metadata?.phoneNumber || null,
            };

            // Try to create the profile
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .upsert(defaultProfile)
              .select()
              .single();

            if (!createError) {
              profileData = newProfile;
            }
          }

          // Use whatever profile data we have
          const userData = {
            id: authData.user.id,
            email: authData.user.email,
            fullName: profileData?.fullname || authData.user.user_metadata?.fullName || 'User',
            userType: profileData?.usertype || authData.user.user_metadata?.userType || 'customer',
            department: profileData?.department || authData.user.user_metadata?.department,
            phoneNumber: profileData?.phonenumber || authData.user.user_metadata?.phoneNumber,
          };

          const dashboardPath = userData.userType === 'agent' ? '/agentdashboard' : '/customerdashboard';
          
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            navigate(dashboardPath, { 
              replace: true,
              state: { userData }
            });
          }, 1500);

        } catch (profileError) {
          console.error('Profile error:', profileError);
          if (profileError.message.includes('policy')) {
            // If it's a policy error, still allow login with basic user data
            const userData = {
              id: authData.user.id,
              email: authData.user.email,
              fullName: authData.user.user_metadata?.fullName || 'User',
              userType: authData.user.user_metadata?.userType || 'customer',
              department: authData.user.user_metadata?.department,
              phoneNumber: authData.user.user_metadata?.phoneNumber,
            };

            const dashboardPath = userData.userType === 'agent' ? '/agentdashboard' : '/customerdashboard';
            
            setShowSuccess(true);
            setTimeout(() => {
              setShowSuccess(false);
              navigate(dashboardPath, { 
                replace: true,
                state: { userData }
              });
            }, 1500);
          } else {
            throw new Error('Unable to access profile data. Please try again.');
          }
        }
  
      } else {
        if (!formData.fullName) {
          setApiError('Full name is required');
          setIsLoading(false);
          return;
        }

        // Sign up the user
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              fullName: formData.fullName,
              userType: userType,
              department: formData.department,
              phoneNumber: formData.phoneNumber,
            },
          },
        });
        
        if (signUpError) throw signUpError;
  
        const userId = data.user?.id;
        if (!userId) throw new Error('User ID not found after signup');
  
        // Create profile with retry logic
        const profileData = {
          id: userId,
          fullname: formData.fullName || 'Unknown User',
          email: formData.email,
          department: userType === 'agent' ? formData.department : null,
          phonenumber: userType === 'customer' ? formData.phoneNumber : null,
          usertype: userType,
        };

        try {
          const { error: insertError } = await supabase
            .from('profiles')
            .upsert(profileData, {
              onConflict: 'id',
              returning: 'minimal'
            });
  
          if (insertError) {
            // Handle RLS violation
            if (insertError.message.includes('policy')) {
              console.warn('RLS policy violation - proceeding with signup flow');
              setShowSuccess(true);
              setRegisteredEmail(formData.email);
              setShowVerificationAlert(true);
              setTimeout(() => {
                setShowSuccess(false);
              }, 1000);
              return;
            }
            
            // Handle other profile creation errors
            if (insertError.message.includes('profiles_pkey')) {
              setShowSuccess(true);
              setRegisteredEmail(formData.email);
              setShowVerificationAlert(true);
              setTimeout(() => {
                setShowSuccess(false);
              }, 1000);
              return;
            }
            throw insertError;
          }
  
          setShowSuccess(true);
          setRegisteredEmail(formData.email);
          setShowVerificationAlert(true);
          setFormData(DEFAULT_FORM_DATA);
          setTimeout(() => {
            setShowSuccess(false);
          }, 500);
        } catch (insertError) {
          if (!insertError.message.includes('profiles_pkey') && 
              !insertError.message.includes('policy')) {
            throw insertError;
          }
        }
      }

      setFormData(DEFAULT_FORM_DATA);
  
    } catch (error) {
      console.error('Error during authentication:', error);
      if (error.message.includes('not authorized')) {
        setApiError('This email domain is not authorized. Please use an authorized email address.');
      } else if (error.message.includes('policy')) {
        setApiError('Account created successfully. Please verify your email to continue.');
        setShowVerificationAlert(true);
        setRegisteredEmail(formData.email);
      } else {
        setApiError(error.message || 'An error occurred during authentication. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    setErrors({});
    setApiError('');
    setFormData(DEFAULT_FORM_DATA);
    setShowVerificationAlert(false);
  };

  const handleButtonHover = (e, isHovering, type) => {
    const button = e.currentTarget;
    button.style.boxShadow = isHovering ? '0 0 10px rgba(0, 0, 0, 0.15)' : (userType === type ? '0 0 10px rgba(0, 0, 0, 0.2)' : 'none');
    button.style.borderColor = isHovering ? '#D1D5DB' : (userType === type ? '#BFDBFE' : '#E5E7EB');
  };

  const handleButtonFocus = (e) => {
    e.currentTarget.style.outline = 'none';
  };

  const renderInput = (label, name, type, placeholder, icon) => (
    <div>
      <label className="text-sm text-gray-700 font-bold ">{label}</label>
      <div className="mt-1 relative">
        <div className="absolute left-3 top-3 h-5 w-5 text-gray-400">
          {icon}
        </div>
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={isLoading}
          className={`pl-10 w-full p-3 bg-white text-gray-800 rounded-lg border ${
            errors[name] ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        />
        {errors[name] && (
          <p className="mt-1 text-sm text-red-500">{errors[name]}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto pt-12 px-4">
        {showSuccess && (
          <Alert className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
            <AlertDescription>
              {authMode === 'login' ? 'Successfully logged in!' : 'Account created successfully!'}
            </AlertDescription>
          </Alert>
        )}

        {showVerificationAlert && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Verify your email</AlertTitle>
            <AlertDescription className="mt-2">
              We've sent a verification link to <span className="font-medium">{registeredEmail}</span>.
              Please check your email and click the link to verify your account.
              Once verified, you can sign in to your account.
            </AlertDescription>
            <Button
              className="mt-4 w-full"
              variant="outline"
              onClick={() => switchMode('login')}
            >
              Go to Sign In
            </Button>
          </Alert>
        )}

        {apiError && (
          <Alert className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        {!showVerificationAlert && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>
                {authMode === 'login' ? 'Welcome back' : 'Create an account'}
              </CardTitle>
              <CardDescription>
                {authMode === 'login' 
                  ? 'Enter your credentials to access your account' 
                  : 'Choose your account type and fill in your details'}
              </CardDescription>
            </CardHeader>
            <CardContent className="w-full space-y-4 text-left">
              {authMode === 'register' && (
                <div className="space-y-2">
                  <label className="text-gray-700 text-sm font-bold ">Account Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    {['customer', 'agent'].map((type) => (
                      <button
                        key={type}
                        className={`w-full p-4 flex flex-col items-center gap-2 rounded-lg border ${
                          userType === type 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'bg-white border-gray-200'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !isLoading && setUserType(type)}
                        disabled={isLoading}
                        type="button"
                        style={{
                          boxShadow: userType === type ? '0 0 10px rgba(0, 0, 0, 0.2)' : 'none',
                          transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
                          outline: 'none',
                        }}
                        onFocus={handleButtonFocus}
                        onMouseEnter={(e) => handleButtonHover(e, true, type)}
                        onMouseLeave={(e) => handleButtonHover(e, false, type)}
                      >
                        {type === 'customer' ? (
                          <User className="h-6 w-6 text-gray-600" />
                        ) : (
                          <Building className="h-6 w-6 text-gray-600" />
                        )}
                        <span className="text-sm text-gray-700">
                          {type === 'customer' ? 'Customer' : 'Support Agent'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {authMode === 'register' && (
                  <>
                    {renderInput('Full Name', 'fullName', 'text', 'Enter your full name', <User />)}

                    {userType === 'agent' && (
                      <div>
                        <label className="text-sm text-gray-700 font-bold ">Department</label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          disabled={isLoading}
                          className={`mt-1 w-full p-3 bg-white text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                            isLoading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <option value="">Select Department</option>
                          {DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {userType === 'customer' && 
                      renderInput('Phone Number', 'phoneNumber', 'tel', 'Enter your phone number', <Phone />)
                    }
                    </>
                  )}
  
                  {renderInput('Email', 'email', 'email', 'Enter your email', <Mail />)}
                  {renderInput('Password', 'password', 'password', 'Enter your password', <Lock />)}
                  
                  {authMode === 'register' && 
                    renderInput('Confirm Password', 'confirmPassword', 'password', 'Confirm your password', <Lock />)
                  }
  
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg flex items-center justify-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {authMode === 'login' ? 'Signing In...' : 'Creating Account...'}
                      </>
                    ) : (
                      <>
                        {authMode === 'login' ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
  
              <CardFooter>
                <p className="text-sm text-center w-full">
                  {authMode === 'login' ? (
                    <>
                      Don't have an account?{' '}
                      <button
                        onClick={() => !isLoading && switchMode('register')}
                        disabled={isLoading}
                        className={`text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-0 bg-transparent border-none appearance-none ${
                          isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button
                        onClick={() => !isLoading && switchMode('login')}
                        disabled={isLoading}
                        className={`text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-0 bg-transparent border-none appearance-none ${
                          isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </p>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    );
  };
  
  export default AuthPages;