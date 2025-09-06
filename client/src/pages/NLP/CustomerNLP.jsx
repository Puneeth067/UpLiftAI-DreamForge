import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, Bot, User, MessageCircleQuestion 
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// More comprehensive NLP Intent Matching
const generateNLPResponse = (message) => {
  const lowercaseMessage = message.toLowerCase().trim();

  const intents = [
    {
      patterns: [
        'hi', 'hello', 'hey', 'howdy', 
        'greetings', 'good morning', 'good afternoon', 'good evening'
      ],
      responses: [
        "Welcome to DreamForge! I'm your intelligent guide to connecting with amazing creators.",
        "Hi there! Ready to turn your creative vision into reality? Let's explore how we can help.",
        "Hello! Excited to help you discover and collaborate with talented creators across various disciplines."
      ]
    },
    {
      patterns: [
        'how does this work', 'platform explained', 'explain dreamforge', 
        'what is this platform', 'how to use'
      ],
      responses: [
        "DreamForge is your ultimate creator collaboration platform:\n• Browse diverse creator portfolios\n• Post detailed project requirements\n• Receive tailored proposals\n• Manage projects seamlessly\n• Secure payments and transparent communication",
        "Our platform simplifies creative collaborations:\n1. Create your project vision\n2. Get matched with verified creators\n3. Communicate and iterate\n4. Track project milestones\n5. Celebrate your completed project!"
      ]
    },
    {
      patterns: [
        'find creators', 'how to hire', 'looking for talent', 
        'need a creator', 'hire freelancer', 'find talent', 'How can I find the right creator for my project?'
      ],
      responses: [
        "Finding the perfect creator is easy on DreamForge:\n• Use advanced skill filters\n• Review comprehensive portfolios\n• Check verified skill badges\n• Analyze past project performance\n• Direct messaging and proposal system",
        "Creator discovery made simple:\n1. Define your project needs\n2. Use our smart matching algorithm\n3. Review creator profiles\n4. Compare skills and portfolios\n5. Send personalized project invitations"
      ]
    },
    {
      patterns: [
        'how can i find the right creator for my project', 
        'find the right creator', 
        'matching creators', 
        'creator selection process'
      ],
      responses: [
        "Finding the perfect creator on DreamForge is a streamlined process:\n• Use our advanced skill matching algorithm\n• Filter creators by expertise, past projects, and ratings\n• Review comprehensive portfolios with detailed work samples\n• Check verified skill badges and performance metrics\n• Send personalized project invitations with clear briefs",
        "Our creator matching process is designed for precision:\n1. Define your project requirements in detail\n2. Review creator projects and experience\n3. Communicate directly with potential collaborators"
      ]
    },
    {
      patterns: [
        'what makes dreamforge unique', 
        'dreamforge advantages', 
        'platform differentiators', 
        'why choose dreamforge'
      ],
      responses: [
        "DreamForge stands out through several unique features:\n• Intelligent creator matching powered by advanced AI\n• Comprehensive creator verification process\n• Transparent project milestones and secure payments\n• Diverse talent pool across multiple creative disciplines\n• Built-in collaboration and communication tools\n• Performance tracking and accountability metrics",
        "Our platform revolutionizes creative collaboration:\n1. Cutting-edge AI-driven talent discovery\n2. Rigorous creator verification and skill validation\n3. End-to-end project management\n4. Secure, milestone-based funding\n5. Community-driven quality assurance\n6. Global talent accessibility"
      ]
    },
    {
      patterns: [
        'how does creator verification work', 
        'creator verification process', 
        'how do you verify creators', 
        'creator authentication'
      ],
      responses: [
        "Our creator verification is a comprehensive, multi-step process:\n• Identity Verification: Government ID and address confirmation\n• Professional Portfolio Review: Extensive assessment of past work\n• Skill Validation: Technical tests and practical skill demonstrations\n• Performance Tracking: Ongoing evaluation of project completions\n• Peer and Client Reviews: Transparent feedback mechanism\n• Continuous Monitoring: Regular skill and performance updates",
        "DreamForge's creator verification ensures top-tier talent:\n1. Rigorous background checks\n2. Portfolio quality assessment\n3. Skills testing across multiple domains\n4. Real-world project performance analysis\n5. Continuous professional development tracking\n6. Transparent rating and review system"
      ]
    }
  ];

  // Exact and partial match intent detection
  for (const intent of intents) {
    for (const pattern of intent.patterns) {
      if (lowercaseMessage === pattern || lowercaseMessage.includes(pattern)) {
        return intent.responses[Math.floor(Math.random() * intent.responses.length)];
      }
    }
  }

  // More contextual fallback responses
  const fallbackResponses = [
    "I'm here to help! Would you like to know about our creator matching, project collaboration, or platform features?",
    "I'm an AI assistant for DreamForge. Could you rephrase your question about creators, projects, or platform capabilities?",
    "Let me assist you! I can explain our platform's features, help you find creators, or guide you through the collaboration process."
  ];

  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
};

const CustomerNLP = ({ userData }) => {
  // More specific and action-oriented predefined prompts
  const predefinedPrompts = [
    "How can I find the right creator for my project?",
    "Explain DreamForge's collaboration process",
    "What makes DreamForge unique?",
    "How does creator verification work?"
  ];

  const [messages, setMessages] = useState([
    { 
      id: 0, 
      text: `Hi ${userData?.fullname || 'Creator'}! I'm your DreamForge AI assistant. Select a prompt or ask a question about finding, hiring, or collaborating with creators.`, 
      sender: 'bot' 
    }
  ]);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: "smooth", 
      block: "end",
      inline: "nearest"
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendPrompt = (prompt) => {
    if (prompt) {
      const userMessage = { 
        id: messages.length + 1, 
        text: prompt, 
        sender: 'user' 
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setSelectedPrompt('');
      
      setIsTyping(true);
      
      setTimeout(() => {
        const botResponse = { 
          id: messages.length + 2, 
          text: generateNLPResponse(prompt), 
          sender: 'bot' 
        };
        
        setMessages(prevMessages => [...prevMessages, botResponse]);
        setIsTyping(false);
      }, 1000);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center w-full mx-0 max-w-none mt-8 p-16 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-3xl">
        <Card className="flex flex-col h-[80vh] overflow-hidden">
          <CardHeader className="text-center space-y-2 p-4 border-b">
            <h1 className="text-3xl font-bold text-violet-800 dark:text-white tracking-tight flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-purple-600" />
              DreamForge Assistant
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your AI-powered guide to creator collaboration
            </p>
          </CardHeader>

          <CardContent className="flex-grow overflow-hidden p-0">
          <ScrollArea className="h-[calc(100vh-300px)] px-4 py-2">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex items-start mb-4 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div className={`flex items-center ${
                    msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    {msg.sender === 'bot' ? (
                      <Bot className="w-8 h-8 mr-2 ml-2 text-purple-600" />
                    ) : (
                      <User className="w-8 h-8 mr-2 ml-2 text-blue-600" />
                    )}
                    <div 
                      className={`p-3 rounded-lg text-left max-w-[70%] ${
                        msg.sender === 'user' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {msg.text.split('\n').map((line, index) => (
                        <p key={index} className="mb-2 last:mb-0">{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center justify-start mb-4">
                  <Bot className="w-8 h-8 mr-2 text-purple-600" />
                  <div className="p-3 bg-gray-100 rounded-lg text-left">
                    <div className="typing-indicator flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-4 border-t">
            <Card className="w-full border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardContent className="p-0">
                <div className="px-4 py-3 flex items-center space-x-4">
                  <MessageCircleQuestion className="w-6 h-6 text-gray-500" />
                  <Select 
                    value={selectedPrompt} 
                    onValueChange={(value) => {
                      setSelectedPrompt(value);
                      handleSendPrompt(value);
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a quick prompt">
                        {selectedPrompt || "Select a quick prompt"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedPrompts.map((prompt, index) => (
                        <SelectItem key={index} value={prompt}>
                          {prompt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
};

CustomerNLP.propTypes = {
  userData: PropTypes.object
};

export default CustomerNLP;