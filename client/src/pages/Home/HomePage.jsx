import { useState, useEffect, useCallback, memo} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  SearchCheck,
  Star,
  Target,
  ArrowRight,
  Trophy,
  ChevronRight,
  Info,
  Medal
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import CyberCursorEffect from '@/components/ui/CyberCursorEffect';
import PropTypes from 'prop-types';
import PageSounds from '@/locales/PageSounds';
import Footer from '@/components/layout/Footer/Footer';

const HomeBackground = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className="absolute inset-0 w-full h-full -z-10 overflow-hidden"
    preserveAspectRatio="none" 
    viewBox="0 0 1440 900"
  >
    <defs>
      {/* Unique Gradient Definitions */}
      <linearGradient id="lightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f0e6ff" stopOpacity="1" />
        <stop offset="50%" stopColor="#f5f0ff" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
      </linearGradient>
      
      <linearGradient id="darkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1a1a2c" stopOpacity="1" />
        <stop offset="50%" stopColor="#2a2a48" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#121227" stopOpacity="1" />
      </linearGradient>

      {/* Subtle Noise Texture */}
      <filter id="noiseFilter">
        <feTurbulence 
          type="fractalNoise" 
          baseFrequency="0.65" 
          numOctaves="3" 
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0"/>
        <feBlend mode="overlay" in2="SourceGraphic" />
      </filter>

      {/* Geometric Pattern Mask */}
      <pattern id="geometricPattern" patternUnits="userSpaceOnUse" width="100" height="100">
        <path 
          d="M0 0 L50 50 L100 0 L50 100 Z" 
          fill="none" 
          stroke="rgba(128, 90, 213, 0.05)" 
          strokeWidth="1"
        />
      </pattern>
    </defs>

    {/* Background Base */}
    <rect 
      width="100%" 
      height="100%" 
      className="fill-[url(#lightGradient)] dark:fill-[url(#darkGradient)]"
      filter="url(#noiseFilter)"
    />

    {/* Geometric Pattern Overlay */}
    <rect 
      width="100%" 
      height="100%" 
      fill="url(#geometricPattern)" 
      opacity="0.3" 
      className="dark:opacity-10"
    />

    {/* Animated Background Elements */}
    <motion.g 
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.05, 0.15, 0.05] }}
      transition={{ 
        duration: 5, 
        repeat: Infinity, 
        repeatType: "mirror",
        ease: "easeInOut"
      }}
    >
      {/* Dynamic Geometric Shapes with Purple Accent */}
      <motion.circle 
        cx="200" 
        cy="100" 
        r="50" 
        fill="#8a4fff20"
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 20, -20, 0],
          y: [0, -20, 20, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut"
        }}
      />
      
      <motion.circle 
        cx="1200" 
        cy="700" 
        r="70" 
        fill="#6a5acd20"
        animate={{ 
          scale: [1, 0.8, 1.1],
          x: [0, -30, 30, 0],
          y: [0, 30, -30, 0]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut"
        }}
      />
      
      <motion.circle 
        cx="600" 
        cy="500" 
        r="40" 
        fill="#9370db20"
        animate={{ 
          scale: [1, 1.3, 0.9],
          x: [0, 40, -40, 0],
          y: [0, -40, 40, 0]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut"
        }}
      />
    </motion.g>
  </svg>
);  

const FEATURES = {
  customer: [
    { 
      icon: <Trophy className="w-6 h-6" />, 
      title: 'Showcase Portfolio', 
      description: 'Display your best work and expertise to attract the right patrons' 
    },
    { 
      icon: <Target className="w-6 h-6" />, 
      title: 'Find Your Patrons', 
      description: 'Connect with patrons who value your unique creative expertise' 
    },
    { 
      icon: <Star className="w-6 h-6" />, 
      title: 'Build Your Brand', 
      description: 'Grow your reputation and establish yourself in your creative field' 
    }
  ],
  agent: [
    { 
      icon: <SearchCheck className="w-6 h-6" />, 
      title: 'Find Expert Creators', 
      description: 'Discover talented creators who match your project requirements' 
    },
    { 
      icon: <Briefcase className="w-6 h-6" />, 
      title: 'Post Projects', 
      description: 'Share your creative needs and let creators bring your vision to life' 
    },
    { 
      icon: <Medal className="w-6 h-6" />, 
      title: 'Quality Assurance', 
      description: 'Browse portfolios and reviews to find the perfect creative match' 
    }
  ]
};

const FeatureCard = memo(({ icon, title, description }) => {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.05, 
        transition: { duration: 0.2 } 
      }}
      whileTap={{ scale: 0.95 }}
      className="group"
    >
      <Card 
        className="h-full overflow-hidden transition-all duration-300 
        border-transparent 
        group-hover:border-purple-300 
        dark:group-hover:border-purple-700
        group-hover:shadow-lg 
        dark:group-hover:shadow-purple-900/20 
        group-hover:shadow-purple-200/50"
      >
        <CardContent className="p-6 h-full flex flex-col relative overflow-hidden">
          {/* Hover Overlay Effect */}
          <div 
            className="absolute inset-0 bg-purple-50/30 dark:bg-purple-900/20 
            opacity-0 group-hover:opacity-100 
            transition-opacity duration-300 
            pointer-events-none"
          />
          
          <div className="flex items-center justify-center h-12 w-12 rounded-md 
            bg-purple-50 dark:bg-purple-900 
            text-purple-600 dark:text-purple-300 
            transition-transform duration-300 
            group-hover:rotate-12 
            group-hover:scale-110"
          >
            {icon}
          </div>
          <h3 className="mt-4 text-lg font-medium 
            text-gray-900 dark:text-gray-100 
            transition-colors duration-300 
            group-hover:text-purple-600 
            dark:group-hover:text-purple-400">
            {title}
          </h3>
          <p className="mt-2 text-base 
            text-gray-500 dark:text-gray-400 
            flex-grow 
            transition-colors duration-300 
            group-hover:text-gray-700 
            dark:group-hover:text-gray-200">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
);
});
FeatureCard.displayName = 'FeatureCard';

FeatureCard.propTypes = {
  icon: PropTypes.element.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

const HomePage = () => {
  const [userType, setUserType] = useState('customer');
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const handleDashboardNavigation = useCallback(() => {
    if (user) {
      const dashboardType = user.user_metadata?.userType === 'agent' 
        ? '/agentdashboard' 
        : '/customerdashboard';
      navigate(dashboardType);
    }
  }, [user, navigate]);

  const handleGetStarted = useCallback(() => {
    if (user) {
      handleDashboardNavigation();
    } else {
      navigate('/auth', { 
        state: { 
          userType: userType === 'customer' ? 'agent' : 'customer',
          mode: 'register'
        } 
      });
    }
  }, [user, userType, navigate, handleDashboardNavigation]);

  const handleSignIn = useCallback(() => {
    navigate('/auth', {
      state: {
        userType: userType === 'customer' ? 'agent' : 'customer',
        mode: 'login'
      }
    });
  }, [userType, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      const scrolledToBottom = windowHeight + scrollTop >= documentHeight - 100;
      setShowAlert(scrolledToBottom);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-50 to-rose-50 dark:from-indigo-900/70 dark:to-rose-900/70 pb-4 cursor-none">
      <HomeBackground className="z-0"/>
      <CyberCursorEffect />

      <motion.nav 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/95 backdrop-blur-md dark:bg-gray-900/95 shadow-lg dark:shadow-purple-900/20 sticky top-0 z-50 border-b border-purple-100/50 dark:border-purple-800/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <div className="flex items-center space-x-2">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="flex items-center group"
              >
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-200"></div>
                  
                  {/* Logo SVG */}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 100 100" 
                    className="h-8 w-8 relative text-primary transition-transform group-hover:scale-110"
                    aria-hidden="true"
                  >
                    <circle cx="50" cy="50" r="48" fill="url(#forgeGradient)"/>
                    <defs>
                      <linearGradient id="forgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        {/* Use theme-consistent colors */}
                        <stop offset="0%" stopColor="#6366F1" />   {/* Indigo-500 Light / Indigo-400 Dark */}
                        <stop offset="100%" stopColor="#06B6D4" /> {/* Cyan-500 Light / Cyan-400 Dark */}
                      </linearGradient>
                    </defs>
                    <path d="M30 55 Q50 35, 70 55" fill="none" stroke="white" strokeWidth="4"/>
                    <path d="M30 55 L20 45 Q15 40, 25 35 Q35 30, 40 35" fill="none" stroke="white" strokeWidth="4"/>
                    <path d="M70 55 L80 45 Q85 40, 75 35 Q65 30, 60 35" fill="none" stroke="white" strokeWidth="4"/>
                    <circle cx="50" cy="55" r="8" fill="white"/>
                    <path d="M40 70 Q50 80, 60 70" fill="none" stroke="white" strokeWidth="3"/>
                  </svg>
                </div>

                {/* Brand Name */}
                <span className="ml-2 text-xl font-bold text-foreground dark:text-foreground transition-colors group-hover:text-primary dark:group-hover:text-primary">
                  DreamForge
                </span>
              </motion.div>
            </div>


            {/* Navigation Actions */}
            <div className="flex items-center space-x-4">
              {/* User Type Toggle */}
              <div className="hidden sm:flex items-center space-x-2 bg-indigo-100/50 dark:bg-indigo-900/30 backdrop-blur-sm rounded-full p-1 shadow-inner">
                <Button
                  variant={userType === 'customer' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setUserType('customer')}
                  className={`rounded-full transition-all font-medium ${
                    userType === 'customer'
                      ? 'bg-white text-indigo-700 shadow-md dark:bg-indigo-700 dark:text-indigo-200'
                      : 'text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-100 hover:bg-white/50 dark:hover:bg-indigo-700/50'
                  }`}
                  aria-pressed={userType === 'customer'}
                >
                  Creator
                </Button>
                <Button
                  variant={userType === 'agent' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setUserType('agent')}
                  className={`rounded-full transition-all font-medium ${
                    userType === 'agent'
                      ? 'bg-white text-indigo-700 shadow-md dark:bg-indigo-700 dark:text-indigo-200'
                      : 'text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-100 hover:bg-white/50 dark:hover:bg-indigo-700/50'
                  }`}
                  aria-pressed={userType === 'agent'}
                >
                  Patron
                </Button>
              </div>


              {/* Sign In Button */}
              <Button
                variant="outline"
                onClick={handleSignIn}
                className="transition-all font-medium border-2 border-purple-200 dark:border-purple-700 text-gray-800 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600 hover:text-purple-700 dark:hover:text-purple-300 shadow-md hover:shadow-lg"
              >
                Sign In
              </Button>
            </div>
          </div>

          {/* Mobile User Type Toggle */}
          <div className="sm:hidden flex justify-center space-x-4 pb-3">
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-full p-1 shadow-inner">
              <Button
                variant={userType === 'customer' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setUserType('customer')}
                className={`rounded-full transition-all font-medium ${
                  userType === 'customer' 
                    ? 'bg-white text-gray-900 shadow-md dark:bg-gray-700 dark:text-gray-100' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/80 dark:hover:bg-gray-700/80'
                }`}
                aria-pressed={userType === 'customer'}
              >
                Creator
              </Button>
              <Button
                variant={userType === 'agent' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setUserType('agent')}
                className={`rounded-full transition-all font-medium ${
                  userType === 'agent' 
                    ? 'bg-white text-gray-900 shadow-md dark:bg-gray-700 dark:text-gray-100' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/80 dark:hover:bg-gray-700/80'
                }`}
                aria-pressed={userType === 'agent'}
              >
                Patron
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      <main className="relative z-10">
        <div className="relative bg-transparent overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-transparent sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <motion.main 
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28"
              >
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-heading-theme sm:text-5xl  ` md:text-6xl">
                    <span className="block">
                      {userType === 'customer' ? 'Showcase Your Expertise' : 'Find Your Perfect Creator'}
                    </span>
                    <span className="block text-indigo-600 dark:text-indigo-400">
                      {userType === 'customer' ? 'Connect with Dream Projects' : 'Discover Expert Talent'}
                    </span>
                  </h1>
                  <p className="mt-3 text-base-theme sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    {userType === 'customer'
                      ? `Showcase your portfolio, highlight your expertise, and connect with patrons who value your unique creative skills. Build your brand and grow your creative career.`
                      : `Find the perfect creator for your project. Browse portfolios, review expertise, and connect with talented professionals who can bring your vision to life.`}
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        onClick={handleGetStarted}
                        className="w-full sm:w-auto px-8 py-3 text-base font-medium rounded-md shadow-lg hover:shadow-xl transition-all"
                        size="lg"
                      >
                        {userType === 'customer' ? 'Showcase Portfolio' : 'Browse Creators'}
                        <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.main>
            </div>
          </div>
        </div>

        <motion.section 
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="py-12 bg-white dark:bg-gray-800" 
          aria-labelledby="features-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 
                id="features-heading" 
                className="text-3xl font-extrabold text-header-theme sm:text-4xl"
              >
                {userType === 'customer' ? 'Amplify Your Creative Journey' : 'Commission Unique Creations'}
              </h2>
            </div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: { 
                  opacity: 1,
                  transition: { 
                    delayChildren: 0.2,
                    staggerChildren: 0.1 
                  }
                }
              }}
              className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              {FEATURES[userType].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <FeatureCard {...feature} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="bg-indigo-50 mb-4 dark:bg-indigo-900/20 py-12"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-heading-theme sm:text-4xl">
              <span className="block">Ready to dream bigger?</span>
              <span className="block text-indigo-600 dark:text-indigo-400">
                {userType === 'customer' ? 'Your next masterpiece awaits.' : 'Find your perfect creator.'}
              </span>
            </h2>
            <div className="mt-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={user ? handleDashboardNavigation : handleSignIn}
                  variant="outline" 
                  className="px-8 border-2 border-indigo-200 dark:border-indigo-700 text-gray-800 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-md hover:shadow-lg"
                  size="lg"
                >
                  {user ? 'Go to Dashboard' : 'Sign In'}
                  <ChevronRight className="ml-2 w-4 h-4" aria-hidden="true" />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </main>

      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-2 max-w-md mx-auto z-[100]"
          >
            <Alert
              className="bg-indigo-100/90 dark:bg-indigo-900/90 
                backdrop-blur-md 
                border-indigo-200 dark:border-indigo-800
                shadow-lg rounded-xl
                transition-all duration-300"
              role="status"
            >
              <AlertDescription className="flex items-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mr-3"
                >
                  <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                </motion.div>
                <span className="text-base-theme">
                  Currently showing the {userType === 'customer' ? 'creator' : 'patron'} view. 
                  Toggle above to see different perspectives.
                </span>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      <PageSounds />
      <Footer />
    </div>
  );
};

export default HomePage;