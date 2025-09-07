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
import { Mail, Lock, User, Palette, Sparkles, Phone, ArrowRight, AlertCircle, Eye, EyeOff, Link } from 'lucide-react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from '../../utils/supabase.js';
import CyberCursorEffect from "@/components/ui/CyberCursorEffect";
import LoadingScreen from "@/components/ui/loading";
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
        <stop offset="0%" stopColor="#F0F4FF" stopOpacity="1" />
        <stop offset="100%" stopColor="#FAFAFF" stopOpacity="0.8" />
      </radialGradient>
     
      <radialGradient id="accentGradient" cx="50%" cy="50%" r="75%">
        <stop offset="0%" stopColor="#6366F1" stopOpacity="1" />
        <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.6" />
      </radialGradient>
      <radialGradient id="darkGradient" cx="50%" cy="50%" r="75%">
        <stop offset="0%" stopColor="#111827" stopOpacity="1" />
        <stop offset="100%" stopColor="#0A0F1C" stopOpacity="0.9" />
      </radialGradient>
     
      <filter id="blurFilter">
        <feGaussianBlur stdDeviation="50" />
      </filter>
    </defs>
   
    {/* Light Mode Patterns */}
    <g className="opacity-100 dark:opacity-0">
      <circle cx="400" cy="250" r="200" fill="url(#lightGradient)" filter="url(#blurFilter)" />
      <circle cx="1000" cy="400" r="300" fill="url(#lightGradient)" opacity="0.8" />
      <circle cx="700" cy="700" r="150" fill="url(#accentGradient)" opacity="0.7" />
      <polygon points="900,300 1200,600 600,600" fill="url(#lightGradient)" opacity="0.5" />
      <ellipse cx="1200" cy="700" rx="450" ry="300" fill="url(#lightGradient)" filter="url(#blurFilter)" />
    </g>
   
    {/* Dark Mode Patterns */}
    <g className="opacity-0 dark:opacity-100">
      <circle cx="400" cy="250" r="350" fill="url(#darkGradient)" filter="url(#blurFilter)" />
      <polygon points="700,500 1100,800 500,800" fill="url(#darkGradient)" opacity="0.8" />
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
  }, [apiError])

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

  // Show loading screen when processing
  if (isLoading) {
    return <LoadingScreen />;
  }

  const renderInput = (label, name, type, placeholder, icon) => {
    const isPassword = type === 'password';
    const isPhone = name === 'phoneNumber';
    const showPasswordToggle = isPassword && (name === 'password' ? showPassword : showConfirmPassword);
    
    return (
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground dark:text-foreground">{label}</label>
        <div className="relative">
          <div className="absolute left-3 top-3 h-5 w-5 text-primary dark:text-primary">
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
              bg-surface dark:bg-surface 
              text-foreground dark:text-foreground 
              placeholder:text-foreground/60 dark:placeholder:text-foreground/60
              rounded-xl 
              border-2 border-primary/30 dark:border-primary/40 
              focus:outline-none 
              focus:ring-2 focus:ring-primary dark:focus:ring-primary 
              focus:border-primary dark:focus:border-primary
              transition-all duration-300 ease-in-out
              ${errors[name] ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50 dark:hover:border-primary/60'}
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
              className="absolute right-3 top-3 text-primary dark:text-primary hover:text-primary-hover dark:hover:text-primary-hover focus:outline-none transition-colors duration-200"
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
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 
              animate-in 
              slide-in-from-top-2 
              fade-in 
              duration-300 
              ease-out
              font-medium"
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
      bg-background dark:bg-background 
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
      <AuthBackgroundSVG className="z-0" />
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
          className="mb-6 bg-surface dark:bg-surface border-l-4 border-accent dark:border-accent text-foreground dark:text-foreground p-4 rounded-xl shadow-lg backdrop-blur-sm"
        >
          <AlertDescription className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-accent dark:text-accent" />
            <span className="font-medium">
              {authMode === 'login' ? 'Welcome back to DreamForge!' : 'Welcome to DreamForge! Let\'s create something amazing.'}
            </span>
          </AlertDescription>
        </motion.div>
      )}

      {showVerificationAlert && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6 bg-surface dark:bg-surface border-2 border-primary/40 dark:border-primary/50 rounded-xl p-6 shadow-xl backdrop-blur-sm"
        >
          <div className="flex items-start space-x-4">
            <AlertCircle className="h-6 w-6 text-accent dark:text-accent mt-1 flex-shrink-0" />
            <div className="flex-1">
              <AlertTitle className="text-foreground dark:text-foreground font-bold text-lg mb-2">
                Verify your email
              </AlertTitle>
              <AlertDescription className="text-foreground/80 dark:text-foreground/80 text-sm leading-relaxed mb-4">
                We&apos;ve sent a verification link to <span className="font-bold text-primary dark:text-primary">{registeredEmail}</span>.
                Please check your email and click the link to verify your account.
                Once verified, you can sign in to your account.
              </AlertDescription>
              <Button
                className="w-full bg-primary hover:bg-primary-hover dark:bg-primary dark:hover:bg-primary-hover text-white font-medium py-2 transition-colors duration-200"
                onClick={() => switchMode('login')}
              >
                Go to Sign In
              </Button>
            </div>
          </div>
        </motion.div>
      )}

        

        {!showVerificationAlert && (
          <Card className="w-full 
          bg-surface dark:bg-surface 
          border-2 border-primary/30 dark:border-primary/40
          shadow-2xl 
          dark:shadow-2xl 
          rounded-2xl 
          overflow-hidden 
          max-w-full
          backdrop-blur-sm">
            <CardHeader className="bg-surface dark:bg-surface py-8 px-6 border-b border-primary/20 dark:border-primary/30">
              <div className="flex items-center justify-center mb-6">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 100 100" 
                  className="h-16 w-16 text-primary dark:text-primary"
                  aria-hidden="true"
                >
                <circle cx="50" cy="50" r="48" fill="url(#forgeGradient)"/>
                <defs>
                  <linearGradient id="forgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="1"/>
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity="1"/>
                  </linearGradient>
                </defs>
                <path d="M30 55 Q50 35, 70 55" fill="none" stroke="white" strokeWidth="4"/>
                <path d="M30 55 L20 45 Q15 40, 25 35 Q35 30, 40 35" fill="none" stroke="white" strokeWidth="4"/>
                <path d="M70 55 L80 45 Q85 40, 75 35 Q65 30, 60 35" fill="none" stroke="white" strokeWidth="4"/>
                <circle cx="50" cy="55" r="8" fill="white"/>
                <path d="M40 70 Q50 80, 60 70" fill="none" stroke="white" strokeWidth="3"/>
              </svg>
              </div>
              <CardTitle className="text-center text-3xl font-bold text-foreground dark:text-foreground mb-3">
                {authMode === 'login' ? 'Welcome to DreamForge' : 'Join DreamForge'}
              </CardTitle>
              <CardDescription className="text-center text-foreground/70 dark:text-foreground/70 text-base">
                {authMode === 'login' 
                  ? 'Sign in to continue your creative journey' 
                  : 'Choose your role in the creative community'}
              </CardDescription>
            </CardHeader>
            <CardContent className="w-full 
            space-y-6 
            text-left 
            px-6 
            sm:px-8 
            py-8">
            {authMode === 'register' && (
              <div className="space-y-4">
                <label className="text-foreground dark:text-foreground text-sm font-bold block">
                  Choose Account Type
                </label>
                <Tabs 
                  defaultValue="customer" 
                  className="w-full"
                  onValueChange={(value) => setUserType(value)}
                >
                  <TabsList className="grid w-full grid-cols-2 bg-surface dark:bg-surface border border-primary/20 dark:border-primary/30 p-2 rounded-lg h-14">
                    <TabsTrigger 
                      value="customer" 
                      className="flex items-center justify-center gap-2 
                        data-[state=active]:bg-primary 
                        data-[state=active]:text-white 
                        dark:data-[state=active]:bg-primary 
                        dark:data-[state=active]:text-white
                        data-[state=inactive]:text-foreground/70
                        dark:data-[state=inactive]:text-foreground/70
                        data-[state=inactive]:hover:text-foreground
                        dark:data-[state=inactive]:hover:text-foreground
                        focus:outline-none focus:ring-0
                        border-none
                        transition-all duration-200
                        rounded-md
                        h-10
                        mx-1
                        text-sm
                        font-medium"
                    >
                      <Palette className="h-4 w-4" />
                      Patron
                    </TabsTrigger>
                    <TabsTrigger 
                      value="agent" 
                      className="flex items-center justify-center gap-2 
                        data-[state=active]:bg-primary 
                        data-[state=active]:text-white 
                        dark:data-[state=active]:bg-primary 
                        dark:data-[state=active]:text-white
                        data-[state=inactive]:text-foreground/70
                        dark:data-[state=inactive]:text-foreground/70
                        data-[state=inactive]:hover:text-foreground
                        dark:data-[state=inactive]:hover:text-foreground
                        focus:outline-none focus:ring-0
                        border-none
                        transition-all duration-200
                        rounded-md
                        h-10
                        mx-1
                        text-sm
                        font-medium"
                    >
                      <Sparkles className="h-4 w-4" />
                      Creator
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="customer" className="mt-4">
                    <div className="bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 p-4 rounded-xl border-2 border-primary/20 dark:border-primary/30 backdrop-blur-sm">
                      <h3 className="text-foreground dark:text-foreground font-semibold mb-2 flex items-center gap-2">
                        <Palette className="h-5 w-5 text-primary dark:text-primary" />
                        Patron Account
                      </h3>
                      <p className="text-sm text-foreground/70 dark:text-foreground/70">
                        Connect with professional creators and commission amazing creative work. 
                        Browse portfolios, request quotes, and bring your creative vision to life.
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="agent" className="mt-4">
                    <div className="bg-gradient-to-br from-accent/5 to-primary/5 dark:from-accent/10 dark:to-primary/10 p-4 rounded-xl border-2 border-accent/20 dark:border-accent/30 backdrop-blur-sm">
                      <h3 className="text-foreground dark:text-foreground font-semibold mb-2 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-accent dark:text-accent" />
                        Creator Account
                      </h3>
                      <p className="text-sm text-foreground/70 dark:text-foreground/70">
                        Professional creators offering specialized creative services. 
                        Showcase your portfolio, get discovered, and take on exciting projects.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Improved Specialty Selection for Agent */}
            {authMode === 'register' && userType === 'agent' && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground dark:text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent dark:text-accent" />
                  Specialty
                </Label>
                <div className="relative">
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleInputChange({
                      target: { name: 'department', value }
                    })}
                    disabled={isLoading}
                  >
                    <SelectTrigger 
                      className="w-full 
                        bg-gradient-to-r from-surface to-surface/80 dark:from-surface dark:to-surface/80
                        text-foreground dark:text-foreground 
                        rounded-xl 
                        border-2 border-accent/30 dark:border-accent/40 
                        focus:ring-2 focus:ring-accent dark:focus:ring-accent 
                        focus:border-accent dark:focus:border-accent
                        hover:border-accent/50 dark:hover:border-accent/60
                        hover:bg-gradient-to-r hover:from-accent/5 hover:to-primary/5 dark:hover:from-accent/10 dark:hover:to-primary/10
                        transition-all duration-300 ease-in-out
                        h-12
                        shadow-sm
                        backdrop-blur-sm"
                      style={{ opacity: isLoading ? 0.5 : 1 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-gradient-to-r from-accent to-primary opacity-60"></div>
                        <SelectValue 
                          placeholder="Choose your specialty" 
                          className="text-foreground/80 dark:text-foreground/80 font-medium" 
                        />
                      </div>
                    </SelectTrigger>
                    <SelectContent 
                      className="bg-gradient-to-br from-surface via-surface to-surface/95 dark:from-surface dark:via-surface dark:to-surface/95
                        border-2 border-accent/30 dark:border-accent/40 
                        rounded-xl 
                        shadow-2xl 
                        dark:shadow-2xl
                        backdrop-blur-lg
                        max-h-60
                        overflow-hidden"
                    >
                      <div className="p-2 border-b border-accent/20 dark:border-accent/30 mb-2">
                        <div className="text-xs font-semibold text-accent dark:text-accent uppercase tracking-wider flex items-center gap-2">
                          <Sparkles className="h-3 w-3" />
                          Select Specialty
                        </div>
                      </div>
                      <div className="space-y-1 px-1">
                        {DEPARTMENTS.map((dept, index) => (
                          <SelectItem 
                            key={dept} 
                            value={dept}
                            className="hover:bg-gradient-to-r hover:from-accent/10 hover:to-primary/10 
                              dark:hover:from-accent/20 dark:hover:to-primary/20 
                              focus:bg-gradient-to-r focus:from-accent/15 focus:to-primary/15 
                              dark:focus:from-accent/25 dark:focus:to-primary/25 
                              transition-all duration-200
                              text-foreground 
                              dark:text-foreground
                              cursor-pointer
                              py-3
                              px-3
                              rounded-lg
                              font-medium
                              text-sm
                              border-l-2 border-transparent
                              hover:border-l-accent dark:hover:border-l-accent
                              focus:border-l-accent dark:focus:border-l-accent
                              group"
                            style={{
                              animationDelay: `${index * 20}ms`
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-accent/60 to-primary/60 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200"></div>
                              <span className="group-hover:translate-x-1 transition-transform duration-200">
                                {dept}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {authMode === 'register' && (
                  <>
                    {renderInput('Full Name', 'fullName', 'text', 'Enter your full name', <User />)}

                    {userType === 'agent' && (
                      <>
                      <div>
                        <Label className="text-sm font-semibold text-foreground dark:text-foreground">Speciality</Label>
                        <div className="relative mt-2">
                          <Select
                            value={formData.department}
                            onValueChange={(value) => handleInputChange({
                              target: { name: 'department', value }
                            })}
                            disabled={isLoading}
                          >
                            <SelectTrigger 
                              className="w-full 
                                bg-surface dark:bg-surface 
                                text-foreground dark:text-foreground 
                                rounded-xl 
                                border-2 border-primary/30 dark:border-primary/40 
                                focus:ring-2 focus:ring-primary dark:focus:ring-primary 
                                focus:border-primary dark:focus:border-primary
                                hover:border-primary/50 dark:hover:border-primary/60
                                transition-all duration-300 ease-in-out
                                h-12
                                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}"
                            >
                              <SelectValue placeholder="Choose Speciality" className="text-foreground/60 dark:text-foreground/60" />
                            </SelectTrigger>
                            <SelectContent 
                              className="bg-surface dark:bg-surface 
                                border-2 border-primary/30 dark:border-primary/40 
                                rounded-xl 
                                shadow-2xl 
                                dark:shadow-2xl
                                backdrop-blur-sm
                                max-h-60"
                            >
                              {DEPARTMENTS.map((dept) => (
                                <SelectItem 
                                  key={dept} 
                                  value={dept}
                                  className="hover:bg-primary/10 
                                    dark:hover:bg-primary/20 
                                    focus:bg-primary/10 
                                    dark:focus:bg-primary/20 
                                    transition-colors duration-200
                                    text-foreground 
                                    dark:text-foreground
                                    cursor-pointer
                                    py-2"
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
              className="w-full 
                bg-primary dark:bg-primary 
                hover:bg-primary-hover dark:hover:bg-primary-hover 
                text-white 
                p-4
                text-base
                font-semibold
                rounded-xl 
                group 
                transition-all duration-300 ease-in-out 
                transform hover:-translate-y-1 
                hover:shadow-xl
                focus:outline-none focus:ring-4 focus:ring-primary/30 dark:focus:ring-primary/40
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none"
              disabled={isLoading}
            >
              <span className="flex items-center justify-center gap-3">
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </Button>
              </form>
            </CardContent>
  
            <CardFooter className="bg-surface dark:bg-surface py-6 rounded-b-2xl border-t border-primary/20 dark:border-primary/30">
              <p className="text-sm text-center w-full text-foreground dark:text-foreground">
                {authMode === 'login' ? (
                  <>
                    New to DreamForge?{' '}
                    <button
                      onClick={() => !isLoading && switchMode('register')}
                      disabled={isLoading}
                      className="text-primary dark:text-primary 
                        hover:text-primary-hover dark:hover:text-primary-hover 
                        focus:outline-none 
                        focus:ring-0
                        border-none
                        font-semibold
                        transition-colors 
                        duration-300 
                        underline-offset-4 
                        hover:underline
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}"
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
                      className="text-primary dark:text-primary 
                        hover:text-primary-hover dark:hover:text-primary-hover 
                        focus:outline-none 
                        focus:ring-0
                        border-none
                        font-semibold
                        transition-colors 
                        duration-300 
                        underline-offset-4 
                        hover:underline
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}"
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