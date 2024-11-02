import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Added useLocation import
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, User, Building, Phone, ArrowRight } from 'lucide-react';
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
};

const AuthPages = () => {
  const navigate = useNavigate();
  const { state } = useLocation(); // Added useLocation hook
  
  // Initialize state using location state values if available
  const [authMode, setAuthMode] = useState(state?.mode || 'login');
  const [userType, setUserType] = useState(state?.userType || 'customer');
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState({});

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (authMode === 'register') {
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      }
      
      if (formData.password !== formData.confirmPassword) {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              fullName: formData.fullName,
              userType,
              department: formData.department,
              phoneNumber: formData.phoneNumber,
            },
          },
        });
        if (error) throw error;
      }

      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/dashboard');
      }, 1500);
      
      setFormData(DEFAULT_FORM_DATA);
    } catch (error) {
      console.error('Error during authentication:', error);
    }
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
          className={`pl-10 w-full p-3 bg-white text-gray-800 rounded-lg border ${
            errors[name] ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
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
                      }`}
                      onClick={() => setUserType(type)}
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
                        className="mt-1 w-full p-3 bg-white text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
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

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg">
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>

          <CardFooter>
            <p className="text-sm text-center w-full">
              {authMode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setErrors({});
                      setFormData(DEFAULT_FORM_DATA);
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setErrors({});
                      setFormData(DEFAULT_FORM_DATA);
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AuthPages;