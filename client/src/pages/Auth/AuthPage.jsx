import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Lock, User, Palette, Sparkles, Phone, ArrowRight, Loader2, AlertCircle, Eye, EyeOff, Link } from 'lucide-react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from '../../utils/supabase.js';
import CyberCursorEffect from "@/components/ui/CyberCursorEffect";
import { Toaster } from '@/components/ui/toaster.jsx';
import { toast } from '@/hooks/use-toast.js';
import PageSounds from '../../locales/PageSounds';


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

  useEffect(() => {
    if (apiError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: apiError,
        duration: 5000 // optional: how long the toast stays visible
      })
    }
  }, [apiError, toast])

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


  const renderInput = (label, name, type, placeholder, icon) => {
    const isPassword = type === 'password';
    const isPhone = name === 'phoneNumber';
    const showPasswordToggle = isPassword && (name === 'password' ? showPassword : showConfirmPassword);
    
    return (
      <div className="space-y-2">
        <label className="text-sm font-semibold text-violet-800 dark:text-violet-200">{label}</label>
        <div className="relative">
          <div className="absolute left-3 top-3 h-5 w-5 text-violet-500 dark:text-violet-400">
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
            className={`
              pl-10 ${isPassword ? 'pr-10' : ''} 
              w-full p-3 
              bg-violet-50 dark:bg-violet-900/30 
              text-violet-900 dark:text-violet-100 
              rounded-xl 
              border border-violet-200 dark:border-violet-700 
              focus:outline-none 
              focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 
              transition duration-300 ease-in-out
              ${errors[name] ? 'border-red-500 focus:ring-red-500' : ''}
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
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
              className="absolute right-3 top-3 text-violet-500 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 focus:outline-none transition"
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
            <p className="mt-1 text-sm text-red-600 dark:text-red-400 
              animate-in 
              slide-in-from-top-2 
              fade-in 
              duration-300 
              ease-out"
            >
              {errors[name]}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen 
      min-w-full 
      bg-white 
      dark:bg-gray-900 
      relative 
      overflow-x-hidden 
      overflow-y-auto 
      py-8 
      px-4 
      sm:px-6 
      lg:px-8
      flex 
      items-center 
      justify-center">
      <AuthBackgroundSVG className="z-0 "/>
      <CyberCursorEffect />
      <Toaster />
      <div className="relative 
        z-10 
        w-full 
        max-w-md 
        sm:max-w-lg 
        mx-auto">
      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4 bg-violet-100 dark:bg-violet-900 border-l-4 border-violet-500 text-violet-700 dark:text-violet-200 p-4 rounded-lg shadow-sm"
        >
          <AlertDescription className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            {authMode === 'login' ? 'Welcome back to DreamForge!' : 'Welcome to DreamForge! Let\'s create something amazing.'}
          </AlertDescription>
        </motion.div>
      )}

      {showVerificationAlert && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-4 bg-violet-50 dark:bg-violet-900 border border-violet-200 dark:border-violet-700 rounded-lg p-4 shadow-md"
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-violet-600 dark:text-violet-400 mt-1" />
            <div>
              <AlertTitle className="text-violet-800 dark:text-violet-200 font-semibold">
                Verify your email
              </AlertTitle>
              <AlertDescription className="text-violet-600 dark:text-violet-300 mt-2 text">
                We`ve sent a verification link to <span className="font-bold">{registeredEmail}</span>.
                Please check your email and click the link to verify your account.
                Once verified, you can sign in to your account.
              </AlertDescription>
              <Button
                className="mt-4 w-full bg-violet-600 hover:bg-violet-700 dark:bg-violet-800 dark:hover:bg-violet-700 text-white"
                onClick={() => switchMode('login')}
              >
                Go to Sign In
              </Button>
            </div>
          </div>
        </motion.div>
      )}

        

        {!showVerificationAlert && (
          <Card className=" w-full 
          dark:bg-violet-900/50 
          dark:border-violet-700 
          shadow-xl 
          dark:shadow-2xl 
          rounded-2xl 
          overflow-hidden 
          max-w-full">
            <CardHeader className="bg-violet-100 dark:bg-violet-900/30 py-6 px-6">
              <div className="flex items-center justify-center mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 100 100" 
                  className="h-12 w-12 text-violet-600 dark:text-violet-400"
                  aria-hidden="true"
                >
                <circle cx="50" cy="50" r="48" fill="url(#forgeGradient)"/>
                <defs>
                  <linearGradient id="forgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4A90E2" stopOpacity="1"/>
                    <stop offset="100%" stopColor="#6D41A3" stopOpacity="1"/>
                  </linearGradient>
                </defs>
                <path d="M30 55 Q50 35, 70 55" fill="none" stroke="white" strokeWidth="4"/>
                <path d="M30 55 L20 45 Q15 40, 25 35 Q35 30, 40 35" fill="none" stroke="white" strokeWidth="4"/>
                <path d="M70 55 L80 45 Q85 40, 75 35 Q65 30, 60 35" fill="none" stroke="white" strokeWidth="4"/>
                <circle cx="50" cy="55" r="8" fill="white"/>
                <path d="M40 70 Q50 80, 60 70" fill="none" stroke="white" strokeWidth="3"/>
              </svg>
              </div>
              <CardTitle className="text-center text-2xl font-bold text-violet-900 dark:text-violet-100 mb-2">
                {authMode === 'login' ? 'Welcome to DreamForge' : 'Join DreamForge'}
              </CardTitle>
              <CardDescription className="text-center text-violet-700 dark:text-violet-300">
                {authMode === 'login' 
                  ? 'Sign in to continue your creative journey' 
                  : 'Choose your role in the creative community'}
              </CardDescription>
            </CardHeader>
            <CardContent className="w-full 
            space-y-4 
            text-left 
            px-4 
            sm:px-6 
            lg:px-8">
            {authMode === 'register' && (
                <div className="space-y-4">
                  <label className="text-violet-800 dark:text-violet-200 text-sm font-bold block">
                    Choose Account Type
                  </label>
                  <Tabs 
                    defaultValue="customer" 
                    className="w-full"
                    onValueChange={(value) => setUserType(value)}
                  >
                    <TabsList className="grid w-full grid-cols-2 bg-violet-100 dark:bg-violet-900/50">
                      <TabsTrigger 
                        value="customer" 
                        className={`
                          flex items-center gap-2 
                          data-[state=active]:bg-white 
                          data-[state=active]:text-violet-800 
                          dark:data-[state=active]:bg-violet-800 
                          dark:data-[state=active]:text-white
                          focus:outline-none focus:ring-0
                          border-none
                        `}
                      >
                        <Palette className="h-5 w-5" />
                        Patron
                      </TabsTrigger>
                      <TabsTrigger 
                        value="agent" 
                        className={`
                          flex items-center gap-2 
                          data-[state=active]:bg-white 
                          data-[state=active]:text-violet-800 
                          dark:data-[state=active]:bg-violet-800 
                          dark:data-[state=active]:text-white
                          focus:outline-none focus:ring-0
                          border-none
                        `}
                      >
                        <Sparkles className="h-5 w-5" />
                        Creator
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="customer" className="mt-4">
                      <div className="bg-violet-50 dark:bg-violet-900/30 p-4 rounded-lg border border-violet-200 dark:border-violet-700">
                        <h3 className="text-violet-800 dark:text-violet-200 font-semibold mb-2">
                          Patron Account
                        </h3>
                        <p className="text-sm text-violet-600 dark:text-violet-300">
                          Looking to commission creative work or hire talent for your projects. 
                          Browse portfolios, post projects, and connect with skilled creators.
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="agent" className="mt-4">
                      <div className="bg-violet-50 dark:bg-violet-900/30 p-4 rounded-lg border border-violet-200 dark:border-violet-700">
                        <h3 className="text-violet-800 dark:text-violet-200 font-semibold mb-2">
                          Creator Account
                        </h3>
                        <p className="text-sm text-violet-600 dark:text-violet-300">
                          Professional creators offering specialized creative services. 
                          Showcase your portfolio, get discovered, and take on exciting projects.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {authMode === 'register' && (
                  <>
                    {renderInput('Full Name', 'fullName', 'text', 'Enter your full name', <User />)}

                    {userType === 'agent' && (
                      <>
                      <div>
                        <Label className="text-sm font-semibold text-violet-800 dark:text-violet-200">Speciality</Label>
                        <div className="relative mt-2">
                          <Select
                            value={formData.department}
                            onValueChange={(value) => handleInputChange({
                              target: { name: 'department', value }
                            })}
                            disabled={isLoading}
                            className={`p-4`}
                          >
                            <SelectTrigger 
                              className={`
                                w-full 
                                bg-violet-50 dark:bg-violet-900/30 
                                text-violet-900 dark:text-violet-100 
                                rounded-xl 
                                border-violet-200 dark:border-violet-700 
                                focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 
                                transition duration-300 ease-in-out
                                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                              `}
                            >
                              <SelectValue placeholder="Choose Speciality" className="text-violet-600 dark:text-violet-300" />
                            </SelectTrigger>
                            <SelectContent 
                              className="
                                bg-white dark:bg-violet-900 
                                border-violet-200 dark:border-violet-700 
                                rounded-xl 
                                shadow-lg 
                                dark:shadow-xl
                              "
                              maxheight="160px"
                            >
                              {DEPARTMENTS.map((dept) => (
                                <SelectItem 
                                  key={dept} 
                                  value={dept}
                                  className="
                                    hover:bg-violet-100 
                                    dark:hover:bg-violet-800 
                                    focus:bg-violet-100 
                                    dark:focus:bg-violet-800 
                                    transition duration-200
                                    text-violet-800 
                                    dark:text-violet-200
                                  "
                                >
                                  {dept}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
              className="
                w-full 
                bg-violet-600 dark:bg-violet-500 
                hover:bg-violet-700 dark:hover:bg-violet-600 
                text-white 
                p-3 
                rounded-xl 
                group 
                transition duration-300 ease-in-out 
                transform hover:-translate-y-1 
                hover:shadow-lg
                focus:outline-none focus:ring-0
              "
              disabled={isLoading}
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {authMode === 'login' ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  <>
                    {authMode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
                  </>
                )}
              </span>
            </Button>
              </form>
            </CardContent>
  
            <CardFooter className="bg-violet-50 dark:bg-violet-900/20 py-4 rounded-b-xl">
              <p className="text-sm text-center w-full text-violet-800 dark:text-violet-200">
                {authMode === 'login' ? (
                  <>
                    New to DreamForge?{' '}
                    <button
                      onClick={() => !isLoading && switchMode('register')}
                      disabled={isLoading}
                      className={`
                        text-violet-600 dark:text-violet-400 
                        hover:text-violet-700 dark:hover:text-violet-300 
                        focus:outline-none 
                        focus:ring-0
                        border-none
                        transition-colors 
                        duration-300 
                        underline-offset-4 
                        hover:underline
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
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
                      className={`
                        text-violet-600 dark:text-violet-400 
                        hover:text-violet-700 dark:hover:text-violet-300 
                        focus:outline-none 
                        focus:ring-0
                        border-none
                        transition-colors 
                        duration-300 
                        underline-offset-4 
                        hover:underline
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
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
      <PageSounds />
    </div>
  );
};

export default AuthPages;