import { useState, useCallback } from 'react';
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
import { Mail, Lock, User, Palette, Sparkles, Phone, ArrowRight, Loader2, AlertCircle, Eye, EyeOff, Link, Wand2, HelpCircle } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from '../../utils/supabase.js';
import CyberCursorEffect from "@/components/ui/CyberCursorEffect";

const AuthBackgroundSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    preserveAspectRatio="xMidYMid slice"
    viewBox="0 0 1440 900"
  >
    <defs>
      <radialGradient id="lightGradient" cx="50%" cy="50%" r="75%">
        <stop offset="0%" stopColor="#F4E6FF" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#E0C4FF" stopOpacity="0.5" />
      </radialGradient>
     
      <radialGradient id="accentGradient" cx="50%" cy="50%" r="75%">
        <stop offset="0%" stopColor="#8A4FFF" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#C6A3FF" stopOpacity="0.4" />
      </radialGradient>
      <radialGradient id="darkGradient" cx="50%" cy="50%" r="75%">
        <stop offset="0%" stopColor="#3A1C6C" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#2A1352" stopOpacity="0.9" />
      </radialGradient>
     
      <filter id="blurFilter">
        <feGaussianBlur stdDeviation="50" />
      </filter>
    </defs>
   
    {/* Light Mode Patterns */}
    <g className="opacity-100 dark:opacity-0">
      <circle cx="400" cy="250" r="200" fill="url(#lightGradient)" filter="url(#blurFilter)" />
      <circle cx="1000" cy="400" r="300" fill="url(#lightGradient)" opacity="0.7" />
      <circle cx="700" cy="700" r="150" fill="url(#accentGradient)" opacity="0.5" />
      <polygon points="900,300 1200,600 600,600" fill="url(#lightGradient)" opacity="0.3" />
      <ellipse cx="1200" cy="700" rx="450" ry="300" fill="url(#lightGradient)" filter="url(#blurFilter)" />
    </g>
   
    {/* Dark Mode Patterns */}
    <g className="opacity-0 dark:opacity-70">
      <circle cx="400" cy="250" r="350" fill="url(#darkGradient)" filter="url(#blurFilter)" />
      <polygon points="700,500 1100,800 500,800" fill="url(#darkGradient)" opacity="0.6" />
      <ellipse cx="1100" cy="600" rx="500" ry="320" fill="url(#darkGradient)" filter="url(#blurFilter)" />
    </g>
  </svg>
);

const DEPARTMENTS = [
  '3D Modeling',
  'Aerial Engineering',
  'Aerospace Engineering',
  'Aerospace Research',
  'AR/VR Development',
  'Artificial Intelligence',
  'Audio Engineering',
  'Bioinformatics',
  'Biotechnology',
  'Blockchain Technology',
  'Brand Strategy',
  'Cinematography',
  'Civil Engineering',
  'Cloud Computing',
  'Cloud Solutions',
  'Composition',
  'Content Strategy',
  'Copywriting',
  'Creative Direction',
  'Creative Technology',
  'Creative Writing',
  'Cybersecurity',
  'Data Science',
  'DevOps',
  'Digital Art',
  'Digital Marketing',
  'Digital Performance',
  'Electrical Engineering',
  'Environmental Science',
  'Film Production',
  'Filmmaking',
  'Game Design',
  'Generative AI',
  'Graphic Design',
  'Illustration',
  'Immersive Experience Design',
  'Industrial Design',
  'Information Security',
  'Innovation Consulting',
  'Interactive Media',
  'IoT Design',
  'IT Support',
  'Machine Learning',
  'Mechanical Engineering',
  'Mobile App Development',
  'Motion Graphics',
  'Music Production',
  'Network Administration',
  'Network Engineering',
  'Performance Art',
  'Podcasting',
  'Product Management',
  'Quantum Computing',
  'Quantum Technology',
  'Robotics Engineering',
  'Software Engineering',
  'Sound Design',
  'Systems Architecture',
  'Technical Documentation',
  'Technical Writing',
  'UI/UX Design',
  'Web Design',
  'Web Development'
];

const DEFAULT_FORM_DATA = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  department: '', 
  phoneNumber: '',
  portfolio: '',
};

// Phone formatting function
const formatPhoneNumber = (value) => {
  if (!value) return value;
  const phoneNumber = value.replace(/[^\d]/g, '');
  const phoneNumberLength = phoneNumber.length;
  
  if (phoneNumberLength < 4) return phoneNumber;
  if (phoneNumberLength < 7) {
    return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3)}`;
  }
  return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6, 10)}`;
};

const validatePortfolioUrl = (url) => {
  if (!url) return true; // Optional field
  try {
    new URL(url);
    return /^(http|https):\/\/[^ "]+$/.test(url); // Ensures URL starts with http(s)
  } catch {
    return false;
  }
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Replace the existing email check with this version
  const checkEmailExists = async (email) => {
    if (!email || typeof email !== 'string') {
      throw new Error('Invalid email format');
    }
  
    try {
      // First attempt: Try using the security definer function
      const { data: functionResult, error: functionError } = await supabase
        .rpc('check_email_exists', { check_email: email });
  
      if (!functionError && typeof functionResult === 'boolean') {
        return functionResult;
      }
  
      // Fallback: If the function call fails, try direct query
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .limit(1);
  
      if (error) {
        console.error('Email check query error:', error);
        
        // If it's a permissions error, assume email doesn't exist
        if (error.code === 'PGRST116' || error.code === '42501') {
          return false;
        }
        
        throw new Error('Email verification failed');
      }
  
      return Array.isArray(data) && data.length > 0;
  
    } catch (error) {
      console.error('Email check error:', error);
      
      // Check for specific error types
      if (error.code === 'PGRST116' || error.code === '42501') {
        return false;
      }
      
      if (error.message?.includes('email verification failed')) {
        throw error;
      }
      
      throw new Error('Unable to verify email availability. Please try again.');
    }
  };

  const validateForm = useCallback(() => {
    const newErrors = {};
  
    if (authMode === 'register') {
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      }
      if (!formData.confirmPassword || formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (userType === 'customer' && formData.phoneNumber) {
        const phoneDigits = formData.phoneNumber.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
          newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
        }
      }
      if (formData.portfolio && !validatePortfolioUrl(formData.portfolio)) {
        newErrors.portfolio = 'Please enter a valid URL starting with http:// or https://';
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
  }, [formData, authMode, userType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle phone number formatting
    if (name === 'phoneNumber') {
      const formattedPhone = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, [name]: formattedPhone }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
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

          // Use whatever profile data we have
          const userData = {
            id: authData.user.id,
            email: authData.user.email,
            fullName: profileData?.fullname || authData.user.user_metadata?.fullName || 'User',
            userType: profileData?.usertype || authData.user.user_metadata?.userType || 'customer',
            department: profileData?.department || authData.user.user_metadata?.department,
            phoneNumber: profileData?.phonenumber || authData.user.user_metadata?.phoneNumber,
            portfolio: profileData?.portfolio || authData.user.user_metadata?.portfolio,
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
              portfolio: authData.user.user_metadata?.portfolio,
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

        if (userType === 'agent' && formData.portfolio) {
          if (!validatePortfolioUrl(formData.portfolio)) {
            setApiError('Please provide a valid portfolio URL');
            setIsLoading(false);
            return;
          }
        }
         
         // Check if email exists
        try {
          const emailExists = await checkEmailExists(formData.email);
          if (emailExists) {
            setApiError('This email is already registered');
            setIsLoading(false);
            return;
          }
        } catch (emailError) {
          console.error('Email check error:', emailError);
          setApiError(emailError.message);
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
              portfolio: formData.portfolio,
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
          portfolio: userType === 'agent' ? formData.portfolio : null,
          usertype: userType,
        };

        console.log('Profile Data Before Insert:', profileData);

        try {

          const { error: insertError } = await supabase
            .from('profiles')
            .upsert(profileData, {
              onConflict: 'id',
              returning: 'minimal'
            });
  
          if (insertError) {
            // Handle RLS violation or profile key conflict
              if (insertError.message.includes('policy') || 
              insertError.message.includes('profiles_pkey')) {

            // If email is unique, proceed with signup flow
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
          }, 1000);
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

  const renderInput = (label, name, type, placeholder, icon) => {
    const isPassword = type === 'password';
    const isPhone = name === 'phoneNumber';
    const showPasswordToggle = isPassword && (name === 'password' ? showPassword : showConfirmPassword);
    
    return (
      <div>
        <label className="text-sm text-gray-700 dark:text-gray-300 font-bold">{label}</label>
        <div className="mt-1 relative">
          <div className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500">
            {icon}
          </div>
          <input
            type={isPassword ? (showPasswordToggle ? 'text' : 'password') : type}
            name={name}
            value={formData[name]}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={isLoading}
            maxLength={isPhone ? 14 : undefined}
            className={`pl-10 ${isPassword ? 'pr-10' : ''} w-full p-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg border ${
              errors[name] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            } placeholder-gray-400 dark:placeholder-gray-500`}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => {
                if (name === 'password') {
                  setShowPassword(!showPassword);
                } else {
                  setShowConfirmPassword(!showConfirmPassword);
                }
              }}
              className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none"
              tabIndex={-1}
            >
              {showPasswordToggle ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
          {errors[name] && (
            <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors[name]}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen min-w-[42rem] bg-white dark:bg-gray-900 relative overflow-x-auto overflow-y-hidden cursor-none">
      <AuthBackgroundSVG className="z-0 "/>
      <CyberCursorEffect />
      <div className="relative z-10 max-w-lg mx-auto pt-12 px-4">
        {showSuccess && (
          <Alert className="mb-4 bg-violet-100 dark:bg-violet-900 border-l-4 border-violet-500 text-violet-700 dark:text-violet-200 p-4">
            <AlertDescription>
              {authMode === 'login' ? 'Welcome back to DreamForge!' : 'Welcome to DreamForge! Let\'s create something amazing.'}
            </AlertDescription>
          </Alert>
        )}

         {/* Add a Help Dialog for account types */}
         {authMode === 'register' && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="absolute top-4 right-4">
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Choose Your Account Type</DialogTitle>
                <DialogDescription>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        <Palette className="h-5 w-5 text-primary" /> Patron
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Looking to commission creative work or hire talent for your projects.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" /> Creator
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Professional creators offering specialized creative services.
                      </p>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )}

        {showVerificationAlert && (
          <Alert className="mb-4 dark:bg-gray-800 dark:border-gray-700">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Verify your email</AlertTitle>
            <AlertDescription className="mt-2 dark:text-gray-300">
              We`ve sent a verification link to <span className="font-medium">{registeredEmail}</span>.
              Please check your email and click the link to verify your account.
              Once verified, you can sign in to your account.
            </AlertDescription>
            <Button
              className="mt-4 w-full dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
              variant="outline"
              onClick={() => switchMode('login')}
            >
              Go to Sign In
            </Button>
          </Alert>
        )}

        

        {!showVerificationAlert && (
          <Card className="w-full dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <Wand2 className="h-8 w-8 text-violet-600 dark:text-violet-400" />
              </div>
              <CardTitle className="text-center dark:text-gray-100">
                {authMode === 'login' ? 'Welcome to DreamForge' : 'Join DreamForge'}
              </CardTitle>
              <CardDescription className="text-center dark:text-gray-400">
                {authMode === 'login' 
                  ? 'Sign in to continue your creative journey' 
                  : 'Choose your role in the creative community'}
              </CardDescription>
            </CardHeader>
            <CardContent className="w-full space-y-4 text-left">
              {authMode === 'register' && (
                <div className="space-y-2">
                  <label className="text-gray-700 dark:text-gray-300 text-sm font-bold">Account Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    {['customer', 'agent'].map((type) => (
                      <button
                        key={type}
                        className={`w-full p-4 flex flex-col items-center gap-2 rounded-lg border ${
                          userType === type 
                            ? 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800' 
                            : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
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
                          <Palette className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                        ) : (
                          <Sparkles className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                        )}
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {type === 'customer' ? 'Patron' : 'Creator'}
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
                      <>
                      <div>
                        <Label className="text-sm text-gray-700 dark:text-gray-300 font-bold">Speciality</Label>
                          <div className="relative">
                            <div className={`w-full p-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-gray-400 dark:placeholder-gray-500`}>
                                <Select 
                                value={formData.department}
                                onValueChange={(value) => handleInputChange({ 
                                  target: { name: 'department', value } 
                                })}
                                disabled={isLoading}                            
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose Speciality" />
                                </SelectTrigger>
                                <SelectContent maxHeight="160px">
                                  {DEPARTMENTS.map((dept) => (
                                    <SelectItem key={dept} value={dept}>
                                      {dept}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>                          
                      </div>
                      {renderInput('Portfolio URL', 'portfolio', 'url', 'https://your-portfolio.com', <Link />)}
                    </>  
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
                  className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white p-3 rounded-lg flex items-center justify-center gap-2"
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
              <p className="text-sm text-center w-full dark:text-gray-300">
                {authMode === 'login' ? (
                  <>
                    New to DreamForge?{' '}
                    <button
                      onClick={() => !isLoading && switchMode('register')}
                      disabled={isLoading}
                      className={`text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 focus:outline-none focus:ring-0 bg-transparent border-none appearance-none ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      Join the community
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => !isLoading && switchMode('login')}
                      disabled={isLoading}
                      className={`text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 focus:outline-none focus:ring-0 bg-transparent border-none appearance-none ${
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

        {apiError && (
          <Alert className="mt-4 mb-4 bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4">
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default AuthPages;