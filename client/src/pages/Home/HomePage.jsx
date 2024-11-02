import { useState, useEffect } from 'react';import {
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

const features = {
  user: [
    { icon: <Bot className="w-6 h-6" />, title: '24/7 AI Support', description: 'Get instant answers to your questions with our AI-powered chatbot' },
    { icon: <MessageCircle className="w-6 h-6" />, title: 'Ticket Tracking', description: 'Track your support tickets and their status in real-time' },
    { icon: <Clock className="w-6 h-6" />, title: 'Quick Resolution', description: 'Experience faster resolution times with our intelligent system' }
  ],
  agent: [
    { icon: <BarChart2 className="w-6 h-6" />, title: 'Advanced Analytics', description: 'Access detailed insights and performance metrics' },
    { icon: <Users className="w-6 h-6" />, title: 'Team Collaboration', description: 'Seamlessly work with team members on complex cases' },
    { icon: <Shield className="w-6 h-6" />, title: 'AI Assistance', description: 'Let AI handle routine queries while you focus on complex issues' }
  ]
};

const HomePage = () => {
  const [userType, setUserType] = useState('user');
  const navigate = useNavigate();
  const { session, user } = useAuth(); // Add this hook

  // Check for existing session on mount
  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  const handleGetStarted = () => {
    // Pass the selected userType to auth page
    navigate('/auth', { 
      state: { 
        userType,
        mode: user ? 'login' : 'register' 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">AI Support Hub</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant={userType === 'user' ? 'default' : 'outline'}
                onClick={() => setUserType('user')}
                className="transition-all"
              >
                Customer
              </Button>
              <Button
                variant={userType === 'agent' ? 'default' : 'outline'}
                onClick={() => setUserType('agent')}
                className="transition-all"
              >
                Support Agent
              </Button>
              {session && (
                <Button
                  variant="default"
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
              <div className="max-w-7xl mx-auto">
                <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                  <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                    <div className="sm:text-center lg:text-left">
                      <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                        <span className="block">{userType === 'user' ? 'Get Support' : 'Provide Support'}</span>
                        <span className="block text-blue-600">{userType === 'user' ? 'Powered by AI' : 'Enhanced by AI'}</span>
                      </h1>
                      <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                        {userType === 'user'
                          ? 'Experience lightning-fast support with our AI-powered system. Get instant answers or connect with our expert support team.'
                          : 'Streamline your support workflow with AI assistance. Handle more tickets efficiently while maintaining high-quality customer service.'}
                      </p>
                      <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                        <Button 
                          onClick={handleGetStarted} 
                          className="w-full sm:w-auto px-8 py-3 text-base font-medium rounded-md shadow"
                          size="lg"
                        >
                          {session ? 'Go to Dashboard' : userType === 'user' ? 'Get Started' : 'Join as Agent'}
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </main>
                </div>
              </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="features-container">
          <div className="features-title">
            <h2>
              {userType === 'user' ? 'Why Choose Our Support System?' : 'Empower Your Support Team'}
            </h2>
          </div>

          <div className="features-grid">
            {features[userType].map((feature, index) => (
              <Card key={index} className="feature-card">
                <CardContent className="p-6">
                  <div className="feature-icon-wrapper">
                    {feature.icon}
                  </div>
                  <h3 className="feature-title">
                    {feature.title}
                  </h3>
                  <p className="feature-description">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section bg-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-blue-600">
              {userType === 'user' ? 'Get support in seconds.' : 'Join our support team.'}
            </span>
          </h2>
          <div className="mt-8">
            <Button 
              onClick={handleGetStarted} 
              variant="secondary" 
              className="px-8"
              size="lg"
            >
              {session 
                ? 'Return to Dashboard' 
                : userType === 'user' 
                  ? 'Start Now' 
                  : 'Apply Now'}
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Alert for Demo */}
      <Alert className="alert-demo">
        <AlertDescription>
          Currently showing the {userType === 'user' ? 'customer' : 'support agent'} view. Toggle above to see different perspectives.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default HomePage;