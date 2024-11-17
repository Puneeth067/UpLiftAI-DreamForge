import { useState, useEffect, useCallback, memo } from 'react';
import {
  Shield,
  MessageCircle,
  BarChart2,
  Users,
  ArrowRight,
  Bot,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const FEATURES = {
  customer: [
    { 
      icon: <Bot className="w-6 h-6" />, 
      title: '24/7 AI Support', 
      description: 'Get instant answers to your questions with our AI-powered chatbot' 
    },
    { 
      icon: <MessageCircle className="w-6 h-6" />, 
      title: 'Ticket Tracking', 
      description: 'Track your support tickets and their status in real-time' 
    },
    { 
      icon: <Clock className="w-6 h-6" />, 
      title: 'Quick Resolution', 
      description: 'Experience faster resolution times with our intelligent system' 
    }
  ],
  agent: [
    { 
      icon: <BarChart2 className="w-6 h-6" />, 
      title: 'Advanced Analytics', 
      description: 'Access detailed insights and performance metrics' 
    },
    { 
      icon: <Users className="w-6 h-6" />, 
      title: 'Team Collaboration', 
      description: 'Seamlessly work with team members on complex cases' 
    },
    { 
      icon: <Shield className="w-6 h-6" />, 
      title: 'AI Assistance', 
      description: 'Let AI handle routine queries while you focus on complex issues' 
    }
  ]
};

const FeatureCard = memo(({ icon, title, description }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </CardContent>
  </Card>
));

FeatureCard.displayName = 'FeatureCard';

const HomePage = () => {
  const [userType, setUserType] = useState('customer');
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

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
          userType: userType === 'customer' ? 'customer' : 'agent',
          mode: 'register'
        } 
      });
    }
  }, [user, userType, navigate, handleDashboardNavigation]);

  const handleSignIn = useCallback(() => {
    navigate('/auth', {
      state: {
        userType: userType === 'customer' ? 'customer' : 'agent',
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-100">AI Support Hub</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant={userType === 'customer' ? 'default' : 'outline'}
                onClick={() => setUserType('customer')}
                className="transition-all"
                aria-pressed={userType === 'customer'}
              >
                Customer
              </Button>
              <Button
                variant={userType === 'agent' ? 'default' : 'outline'}
                onClick={() => setUserType('agent')}
                className="transition-all"
                aria-pressed={userType === 'agent'}
              >
                Support Agent
              </Button>
              <Button
                variant="outline"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="relative bg-white dark:bg-gray-800 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-white dark:bg-gray-800 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-gray-100 sm:text-5xl md:text-6xl">
                    <span className="block">
                      {userType === 'customer' ? 'Get Support' : 'Provide Support'}
                    </span>
                    <span className="block text-blue-600 dark:text-blue-400">
                      {userType === 'customer' ? 'Powered by AI' : 'Enhanced by AI'}
                    </span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 dark:text-gray-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    {userType === 'customer'
                      ? 'Experience lightning-fast support with our AI-powered system. Get instant answers or connect with our expert support team.'
                      : 'Streamline your support workflow with AI assistance. Handle more tickets efficiently while maintaining high-quality customer service.'}
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <Button 
                      onClick={handleGetStarted}
                      className="w-full sm:w-auto px-8 py-3 text-base font-medium rounded-md shadow dark:shadow-gray-900/10"
                      size="lg"
                    >
                      {userType === 'customer' ? 'Get Started' : 'Join as Agent'}
                      <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>

        <section className="py-12 bg-white dark:bg-gray-800" aria-labelledby="features-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 
                id="features-heading" 
                className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 sm:text-4xl"
              >
                {userType === 'customer' ? 'Why Choose Our Support System?' : 'Empower Your Support Team'}
              </h2>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES[userType].map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-blue-50 dark:bg-blue-900/20 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
              <span className="block">Ready to get started?</span>
              <span className="block text-blue-600 dark:text-blue-400">
                {userType === 'customer' ? 'Get support in seconds.' : 'Join our support team.'}
              </span>
            </h2>
            <div className="mt-8">
              <Button 
                onClick={user ? handleDashboardNavigation : handleSignIn}
                variant="outline" 
                className="px-8"
                size="lg"
              >
                {user ? 'Go to Dashboard' : 'Sign In'}
                <ChevronRight className="ml-2 w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {showAlert && (
        <Alert 
          className="fixed bottom-4 left-4 right-4 max-w-md mx-auto transition-opacity duration-300"
          role="status"
        >
          <AlertDescription>
            Currently showing the {userType === 'customer' ? 'customer' : 'support agent'} view. 
            Toggle above to see different perspectives.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default HomePage;