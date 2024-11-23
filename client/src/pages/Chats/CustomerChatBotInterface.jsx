import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Send, Bot, User as UserIcon, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from '@/utils/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import PropTypes from 'prop-types';
  

const TypingIndicator = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="flex items-center space-x-2 mt-2">
      <div className="flex space-x-1">
        <div className={`w-2 h-2 ${isDarkMode ? 'bg-teal-400' : 'bg-teal-500'} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
        <div className={`w-2 h-2 ${isDarkMode ? 'bg-teal-400' : 'bg-teal-500'} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
        <div className={`w-2 h-2 ${isDarkMode ? 'bg-teal-400' : 'bg-teal-500'} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};

const CustomerChatBotInterface = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state?.userData;
  const { isDarkMode, loadUserTheme } = useTheme();
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: `Hello! I'm here to help. How can I assist you today?`,
      timestamp: new Date(),
      status: 'delivered'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSatisfied, setIsSatisfied] = useState(null);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);
  const messagesEndRef = useRef(null);
  const [ticketData, setTicketData] = useState({
    type: '',
    priority: 'medium',
    description: ''
  });
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef(null);
  
  useEffect(() => {
    loadUserTheme(userData.id);
    autoResizeTextarea();
    scrollToBottom();
  }, [messages, inputMessage, loadUserTheme]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Simplify the autoResize function
  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  };

  // Simplify the input handling
  const handleTextareaChange = (e) => {
    setInputMessage(e.target.value);
    // Resize will be handled by useEffect
  };

  const simulateAIResponse = async (userMessage) => {
    setIsTyping(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let response;
      const lowercaseMessage = userMessage.toLowerCase();
      
      if (lowercaseMessage.includes('ticket')) {
        response = "I understand you'd like to create a ticket. I'll help you with that right away. Please provide some details about your issue.";
      } else if (lowercaseMessage.includes('billing')) {
        response = "I can help you with billing-related questions. Could you please specify your billing concern?";
      } else if (lowercaseMessage.includes('technical')) {
        response = "I'll assist you with your technical issue. To better help you, could you describe what's happening?";
      } else {
        const responses = [
          "I understand your concern. Let me help you with that.",
          "Thank you for providing those details. I'll assist you right away.",
          "I'm here to help resolve your issue. Could you tell me more?",
          "I'll help you address this. What other details can you share?",
        ];
        response = responses[Math.floor(Math.random() * responses.length)];
      }
      
      setConversationCount(prev => prev + 1);
      return response;
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      const aiResponse = await simulateAIResponse(inputMessage);
      
      const botMessage = {
        type: 'bot',
        content: aiResponse,
        timestamp: new Date(),
        status: 'delivered'
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTicketSubmit = async () => {
    if (!userData?.id) {
      alert("User data is missing. Please try logging in again.");
      return;
    }
  
    if (!ticketData.type || !ticketData.description) {
      alert("Please fill in all required fields.");
      return;
    }
  
    setUploading(true);
  
    try {
      // Log the request payload for debugging
      console.log('Creating ticket with payload:', {
        user_id: userData.id,
        issue_type: ticketData.type,
        priority: ticketData.priority,
        description: ticketData.description,
        status: 'active'
      });
  
      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert([
          {
            user_id: userData.id,
            issue_type: ticketData.type,
            priority: ticketData.priority,
            description: ticketData.description,
            status: 'active'
          }
        ]);
  
      if (error) {
        // Log detailed error information
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
  
      setShowTicketDialog(false);
      
      const ticketNumber = ticket && ticket[0] ? ticket[0].id : 'pending';
      
      setMessages(prev => [...prev, {
        type: 'bot',
        content: `Ticket created successfully! Your ticket number is #${ticketNumber}. A support agent will contact you soon.`,
        timestamp: new Date(),
        status: 'delivered'
      }]);
      
      setTicketData({
        type: '',
        priority: 'medium',
        description: ''
      });
      
      setTimeout(() => navigate('/customerdashboard', { state: { userData } }), 2000);
  
    } catch (error) {
      console.error('Full error object:', error);
      
      // More user-friendly error message
      let errorMessage = 'Failed to create ticket. ';
      if (error.message) {
        errorMessage += error.message;
      } else if (error.details) {
        errorMessage += error.details;
      } else {
        errorMessage += 'Please try again later.';
      }
      
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  
  const MessageBubble = ({ message, isDarkMode }) => {
    // Function to preserve line breaks while rendering
    const formatMessage = (content) => {
      return content.split('\n').map((text, index) => (
        <React.Fragment key={index}>
          {text}
          {index !== content.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
    };
  
    return (
      <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
        <Card 
          className={`max-w-[80%] min-w-[70px] ${
            message.type === 'user' 
              ? `${isDarkMode ? 'bg-primary text-primary-foreground' : 'bg-primary text-primary-foreground'}` 
              : `${isDarkMode ? 'bg-muted text-muted-foreground' : 'bg-gray-100 text-gray-900'}`
          }`}
        >
          <CardContent className="p-3">
            <div className="flex items-start gap-2 w-full">
              {message.type === 'bot' && (
                <Bot className="w-4 h-4 mt-1 flex-shrink-0" />
              )}
              <div className="flex-1 text-sm overflow-hidden">
                <p className="break-words whitespace-pre-line overflow-wrap-break-word text-left">
                  {formatMessage(message.content)}
                </p>
              </div>
              {message.type === 'user' && (
                <UserIcon className="w-4 h-4 mt-1 flex-shrink-0" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const SatisfactionSurvey = () => (
    <Card className={`w-full mb-6 transform transition-all duration-300 hover:scale-102 ${
      isDarkMode 
        ? 'bg-teal-900/20 border-teal-700' 
        : 'bg-teal-50 border-teal-200'
    }`}>
      <CardContent className="p-8">
        <div className="text-center">
          <p className={`text-base font-medium mb-6 ${isDarkMode ? 'text-teal-100' : 'text-teal-800'}`}>
            Has your issue been resolved?
          </p>
          <div className="flex justify-center gap-6">
            <Button
              variant="outline"
              className={`transform transition-all duration-300 hover:scale-105 ${
                isDarkMode
                  ? 'border-teal-600 hover:bg-teal-800/50 text-teal-100'
                  : 'border-teal-200 hover:bg-teal-100/50 text-teal-800'
              }`}
              onClick={() => {
                setIsSatisfied(false);
                setShowTicketDialog(true);
              }}
            >
              No, I need more help
            </Button>
            <Button
              className={`transform transition-all duration-300 hover:scale-105 ${
                isDarkMode
                  ? 'bg-teal-500 hover:bg-teal-600'
                  : 'bg-teal-600 hover:bg-teal-700'
              } text-white`}
              onClick={() => {
                setIsSatisfied(true);
                setMessages(prev => [...prev, {
                  type: 'bot',
                  content: "I'm glad I could help! Feel free to ask if you need anything else.",
                  timestamp: new Date(),
                  status: 'delivered'
                }]);
                navigate(-1);
              }}
            >
              Yes, thank you!
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  MessageBubble.propTypes = {
    message: PropTypes.shape({
      type: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      timestamp: PropTypes.instanceOf(Date).isRequired,
    }).isRequired,
    isDarkMode: PropTypes.bool.isRequired,
  };
  
  MessageBubble.displayName = 'MessageBubble';

  return (
    <div className={`min-h-screen w-full flex justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="w-full h-screen flex flex-col">
        <Card className="h-full flex flex-col my-4">
          {/* Header Card */}
          <CardHeader className="flex-shrink-0 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={`rounded-xl transition-all duration-300 hover:scale-110 ${
                    isDarkMode
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="w-6 h-6" />
                </Button>
                <div>
                  <CardTitle className={`text-2xl ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Uplift-AI Assistance
                  </CardTitle>
                  <CardDescription className="mt-1">
                    We`re here to help you
                  </CardDescription>
                </div>
              </div>
              <Button 
                className={`rounded-xl ml-40 px-6 py-5 transform transition-all duration-300 hover:scale-105 ${
                  isDarkMode
                    ? 'from-teal-400 to-emerald-500'
                    : 'from-teal-500 to-emerald-600'
                } bg-gradient-to-br text-white shadow-lg hover:shadow-xl`}
                onClick={() => setShowTicketDialog(true)}
              >
                Create Ticket
              </Button>
            </div>
          </CardHeader>

          {/* Chat Content */}
          <CardContent className="flex-1 overflow-y-auto py-6 px-4">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message, index) => (
                <MessageBubble 
                  key={`${message.timestamp.getTime()}-${index}`} 
                  message={message}
                  isDarkMode={isDarkMode}
                />
              ))}
              {isTyping && <TypingIndicator />}
              {conversationCount > 5 && conversationCount % 3 === 0 && isSatisfied === null && (
                <SatisfactionSurvey />
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          <CardFooter className="flex-shrink-0 border-t p-4">
            <div className="w-full max-w-3xl mx-auto relative">
              <Textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={handleTextareaChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message..."
                className={`pr-32 min-h-[56px] max-h-[150px] rounded-xl text-base overflow-y-auto resize-none ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-200 placeholder-gray-400 focus-visible:ring-teal-400'
                    : 'bg-white text-gray-900 placeholder-gray-500 focus-visible:ring-teal-500'
                }`}
                style={{
                  paddingRight: '8rem',
                }}
              />
              <Button 
                className={`absolute right-2 bottom-2 h-10 px-6 rounded-lg transform transition-all duration-300 hover:scale-105 ${
                  isDarkMode
                    ? 'from-teal-400 to-emerald-500'
                    : 'from-teal-500 to-emerald-600'
                } bg-gradient-to-br text-white shadow-md hover:shadow-lg`}
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
              >
                <Send className="w-5 h-5 mr-2" />
                Send
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent className={`sm:max-w-[500px] rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={`text-2xl ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Create Support Ticket</DialogTitle>
            <DialogDescription className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Fill out the form below to submit a new support ticket. Our team will respond as soon as possible.
            </DialogDescription>
          </DialogHeader>
          <Separator className={isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} />
          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <label htmlFor="issue-type" className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Issue Type</label>
              <Select
                value={ticketData.type}
                onValueChange={(value) => setTicketData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className={`bg-white dark:bg-gray-700 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="billing">Billing Issue</SelectItem>
                  <SelectItem value="account">Account Issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Priority</label>
              <Select
                value={ticketData.priority}
                onValueChange={(value) => setTicketData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className={`bg-white dark:bg-gray-700 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="description" className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Description</label>
              <Textarea
                id="description"
                placeholder="Please describe your issue in detail"
                value={ticketData.description}
                onChange={(e) => setTicketData(prev => ({ ...prev, description: e.target.value }))}
                className={`h-32 ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-200 placeholder-gray-400'
                    : 'bg-white text-gray-800 placeholder-gray-500'
                }`}
              />
            </div>
          </div>
          <Separator className={isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} />
          <DialogFooter className="gap-3 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setShowTicketDialog(false)}
              className={`rounded-lg ${
                isDarkMode
                  ? 'border-gray-600 text-gray-200 hover:bg-gray-700'
                  : 'border-gray-200 text-gray-800 hover:bg-gray-100'
              }`}
            >
              Cancel
            </Button>
            <Button 
              className={`rounded-lg transform transition-all duration-300 hover:scale-105 ${
                isDarkMode
                  ? 'from-teal-400 to-emerald-500'
                  : 'from-teal-500 to-emerald-600'
              } bg-gradient-to-br text-white shadow-md hover:shadow-xl`}
              onClick={handleTicketSubmit}
              disabled={uploading}
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                <span>Submit Ticket</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerChatBotInterface;