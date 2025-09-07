import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, User, MessageCircleQuestion, Sparkles 
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import LoadingScreen from "@/components/ui/loading";

// Smart Knowledge Base Response System
const generateKnowledgeResponse = (message) => {
  const lowercaseMessage = message.toLowerCase().trim();

  const knowledgeBase = [
    {
      patterns: [
        'hi', 'hello', 'hey', 'howdy', 
        'greetings', 'good morning', 'good afternoon', 'good evening'
      ],
      responses: [
        "Welcome to DreamForge! I'm your smart assistant ready to help you navigate our creator collaboration platform.",
        "Hi there! Ready to discover amazing creators and bring your projects to life? I'm here to guide you.",
        "Hello! Excited to help you explore our platform and connect with talented creators across various specialties."
      ]
    },
    {
      patterns: [
        'how does this work', 'platform explained', 'explain dreamforge', 
        'what is this platform', 'how to use'
      ],
      responses: [
        "DreamForge is your premier creator collaboration hub:\n• Explore diverse creator portfolios and specialties\n• Submit detailed project briefs with your vision\n• Receive customized proposals from verified creators\n• Manage projects with built-in tools and milestones\n• Secure payments with transparent communication",
        "Our platform streamlines creative partnerships:\n1. Define your project vision and requirements\n2. Get matched with skilled, verified creators\n3. Collaborate through our messaging system\n4. Track progress with milestone checkpoints\n5. Celebrate your successful project completion!"
      ]
    },
    {
      patterns: [
        'find creators', 'how to hire', 'looking for talent', 
        'need a creator', 'hire freelancer', 'find talent', 'How can I find the right creator for my project?'
      ],
      responses: [
        "Discovering the perfect creator on DreamForge is straightforward:\n• Browse by specialty categories and skill sets\n• Review detailed portfolios with past work samples\n• Check creator ratings and client testimonials\n• Use our advanced filtering system\n• Send direct messages with project details",
        "Creator discovery made efficient:\n1. Browse our curated creator categories\n2. Use filters to narrow down by skills and experience\n3. Review comprehensive creator profiles\n4. Compare portfolios and client feedback\n5. Reach out with personalized project invitations"
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
        "Finding your ideal creator on DreamForge follows a proven approach:\n• Start by clearly defining your project scope and style preferences\n• Browse creators by category and review their specialized portfolios\n• Check verified badges and client testimonials\n• Use our comparison tools to evaluate multiple creators\n• Initiate conversations with detailed project briefs",
        "Our creator selection process is designed for success:\n1. Clarify your project vision and requirements\n2. Explore creator profiles with detailed work samples\n3. Review ratings, testimonials, and completion rates\n4. Compare multiple creators side-by-side\n5. Communicate directly to ensure the perfect fit"
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
        "DreamForge distinguishes itself through several key advantages:\n• Curated creator network with verified portfolios\n• Comprehensive project management tools\n• Transparent milestone-based payment system\n• Diverse talent spanning multiple creative disciplines\n• Integrated communication and collaboration features\n• Performance tracking with detailed analytics",
        "Our platform revolutionizes creative collaboration through:\n1. Rigorous creator curation and verification process\n2. Advanced project management and tracking tools\n3. Secure, milestone-driven payment protection\n4. Extensive creator diversity across all creative fields\n5. Built-in quality assurance and feedback systems\n6. Global accessibility with local expertise"
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
        "Our creator verification follows a thorough, multi-stage process:\n• Identity Authentication: Secure ID and contact verification\n• Portfolio Assessment: Comprehensive review of work quality and authenticity\n• Skill Validation: Practical demonstrations and peer evaluations\n• Performance Tracking: Ongoing monitoring of project success rates\n• Client Feedback Integration: Transparent review and rating system\n• Continuous Quality Monitoring: Regular assessment updates",
        "DreamForge's verification ensures creator excellence through:\n1. Rigorous identity and credential verification\n2. In-depth portfolio quality assessment\n3. Skill-based testing and peer review processes\n4. Real-world project performance evaluation\n5. Ongoing professional development tracking\n6. Transparent client feedback and rating systems"
      ]
    }
  ];

  // Pattern matching with contextual understanding
  for (const knowledge of knowledgeBase) {
    for (const pattern of knowledge.patterns) {
      if (lowercaseMessage === pattern || lowercaseMessage.includes(pattern)) {
        return knowledge.responses[Math.floor(Math.random() * knowledge.responses.length)];
      }
    }
  }

  // Helpful fallback responses
  const helpfulFallbacks = [
    "I'm here to help you navigate DreamForge! Feel free to ask about finding creators, managing projects, or exploring platform features.",
    "Let me assist you with DreamForge! I can explain our creator network, collaboration tools, or help you get started with your project.",
    "I'm your DreamForge guide! Ask me about our verification process, creator discovery, or project management capabilities."
  ];

  return helpfulFallbacks[Math.floor(Math.random() * helpfulFallbacks.length)];
};

const CustomerNLP = ({ userData }) => {
  // Enhanced predefined prompts for better user guidance
  const predefinedPrompts = [
    "How can I find the right creator for my project?",
    "Explain DreamForge's collaboration process",
    "What makes DreamForge unique?",
    "How does creator verification work?"
  ];

  const [messages, setMessages] = useState([
    { 
      id: 0, 
      text: `Hi ${userData?.fullname || 'Creator'}! I'm your DreamForge smart assistant. Select a prompt below or ask any question about finding creators, managing projects, or using our platform features.`, 
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
          text: generateKnowledgeResponse(prompt), 
          sender: 'bot' 
        };
        
        setMessages(prevMessages => [...prevMessages, botResponse]);
        setIsTyping(false);
      }, 1200);
    }
  };

  if (isTyping && messages.length <= 1) {
    return <LoadingScreen />;
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center w-full mx-0 max-w-none mt-8 p-16 bg-gradient-to-br from-background via-surface/30 to-primary/5 dark:from-background dark:via-surface/30 dark:to-primary/5 min-h-screen">
      <div className="w-full max-w-3xl">
        <Card className="flex flex-col h-[80vh] overflow-hidden bg-gradient-to-br from-surface/95 to-background/80 dark:from-surface/95 dark:to-background/80 border-2 border-primary/40 dark:border-primary/40 shadow-2xl shadow-primary/20 dark:shadow-primary/20 backdrop-blur-xl">
          <CardHeader className="text-center space-y-3 p-6 border-b-2 border-primary/30 dark:border-primary/30 bg-gradient-to-r from-primary/10 via-secondary/8 to-accent/10 dark:from-primary/10 dark:via-secondary/8 dark:to-accent/10">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight flex items-center justify-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                <img 
                  src="/favicon.svg" 
                  alt="App Logo" 
                  className="w-6 h-6"
                />
              </div>

              DreamForge Assistant
            </h1>
            <p className="text-sm text-foreground/70 dark:text-foreground/70 font-medium bg-surface/60 dark:bg-surface/60 px-4 py-2 rounded-full border border-primary/20 dark:border-primary/20">
              Your intelligent guide to creator collaboration
            </p>
          </CardHeader>

          <CardContent className="flex-grow overflow-hidden p-0 bg-gradient-to-b from-background/50 to-surface/30 dark:from-background/50 dark:to-surface/30">
            <ScrollArea className="h-[calc(100vh-300px)] px-6 py-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex items-start mb-6 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div className={`flex items-start max-w-[85%] ${
                    msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    {msg.sender === 'bot' ? (
                      <div className="w-10 h-10 mr-3 ml-3 bg-gradient-to-r from-secondary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-secondary/30 flex-shrink-0">
                        <Bot className="w-5 h-5 text-background" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 mr-3 ml-3 bg-gradient-to-r from-primary to-primary-hover rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
                        <User className="w-5 h-5 text-background" />
                      </div>
                    )}
                    <div 
                      className={`p-4 rounded-2xl text-left shadow-lg ${
                        msg.sender === 'user' 
                          ? 'bg-gradient-to-r from-primary/15 to-primary/10 dark:from-primary/15 dark:to-primary/10 text-primary dark:text-primary border-2 border-primary/30 dark:border-primary/30 shadow-primary/20' 
                          : 'bg-gradient-to-r from-surface/90 to-background/70 dark:from-surface/90 dark:to-background/70 text-foreground dark:text-foreground border-2 border-secondary/30 dark:border-secondary/30 shadow-secondary/20'
                      }`}
                    >
                      {msg.text.split('\n').map((line, index) => (
                        <p key={index} className="mb-2 last:mb-0 leading-relaxed font-medium">{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-start justify-start mb-6">
                  <div className="flex items-start">
                    <div className="w-10 h-10 mr-3 bg-gradient-to-r from-secondary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-secondary/30">
                      <Bot className="w-5 h-5 text-background" />
                    </div>
                    <div className="p-4 bg-gradient-to-r from-surface/90 to-background/70 dark:from-surface/90 dark:to-background/70 border-2 border-secondary/30 dark:border-secondary/30 rounded-2xl text-left shadow-lg shadow-secondary/20">
                      <div className="typing-indicator flex space-x-1">
                        <div className="w-3 h-3 bg-gradient-to-r from-secondary to-accent rounded-full animate-bounce shadow-sm"></div>
                        <div className="w-3 h-3 bg-gradient-to-r from-accent to-primary rounded-full animate-bounce delay-100 shadow-sm"></div>
                        <div className="w-3 h-3 bg-gradient-to-r from-primary to-secondary rounded-full animate-bounce delay-200 shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-6 border-t-2 border-primary/30 dark:border-primary/30 bg-gradient-to-r from-surface/80 to-primary/5 dark:from-surface/80 dark:to-primary/5">
            <Card className="w-full border-2 border-primary/40 dark:border-primary/40 shadow-xl shadow-primary/20 bg-gradient-to-r from-background/90 to-surface/60 dark:from-background/90 dark:to-surface/60 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="px-5 py-4 flex items-center space-x-4">
                  <div className="h-8 w-8 bg-gradient-to-r from-accent to-secondary rounded-lg flex items-center justify-center shadow-md shadow-accent/30">
                    <MessageCircleQuestion className="w-5 h-5 text-background" />
                  </div>
                  <Select 
                    value={selectedPrompt} 
                    onValueChange={(value) => {
                      setSelectedPrompt(value);
                      handleSendPrompt(value);
                    }}
                  >
                    <SelectTrigger className="flex-1 bg-gradient-to-r from-surface/80 to-background/60 dark:from-surface/80 dark:to-background/60 border-2 border-primary/40 dark:border-primary/40 text-foreground dark:text-foreground focus:ring-2 focus:ring-primary focus:border-primary-hover rounded-xl shadow-md hover:shadow-lg transition-all font-medium">
                      <SelectValue placeholder="Choose a quick prompt to get started">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-accent" />
                          {selectedPrompt || "Choose a quick prompt to get started"}
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-gradient-to-br from-surface/95 to-background/80 dark:from-surface/95 dark:to-background/80 border-2 border-primary/40 dark:border-primary/40 shadow-2xl shadow-primary/30 backdrop-blur-xl rounded-xl">
                      {predefinedPrompts.map((prompt, index) => (
                        <SelectItem 
                          key={index} 
                          value={prompt}
                          className="text-foreground dark:text-foreground hover:bg-gradient-to-r hover:from-primary/15 hover:to-secondary/10 dark:hover:from-primary/15 dark:hover:to-secondary/10 focus:bg-gradient-to-r focus:from-primary/15 focus:to-secondary/10 dark:focus:from-primary/15 dark:focus:to-secondary/10 rounded-lg m-1 font-medium transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                            {prompt}
                          </div>
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