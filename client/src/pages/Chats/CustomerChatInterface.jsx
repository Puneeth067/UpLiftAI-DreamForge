import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Send, Bot, User as UserIcon, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from '@/utils/supabase';

const TypingIndicator = () => (
  <div className="flex items-center space-x-2 p-4">
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

const CustomerChatInterface = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state?.userData;
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        status: 'open'
      });
  
      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert([
          {
            user_id: userData.id,
            issue_type: ticketData.type,
            priority: ticketData.priority,
            description: ticketData.description,
            status: 'open'
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

  const MessageBubble = React.memo(({ message }) => (
    <div className={`flex items-start gap-3 mb-4 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
      <div className="flex flex-col items-center gap-1">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${
          message.type === 'bot' 
            ? 'bg-gradient-to-br from-violet-500 to-purple-600' 
            : 'bg-gradient-to-br from-indigo-500 to-blue-600'
        }`}>
          {message.type === 'bot' ? 
            <Bot className="w-6 h-6 text-white" /> : 
            <UserIcon className="w-6 h-6 text-white" />
          }
        </div>
        <span className="text-xs text-gray-500 font-medium">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className={`relative max-w-[75%] p-4 rounded-2xl shadow-md transition-all duration-200 ${
        message.type === 'user' 
          ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white' 
          : 'bg-white dark:bg-gray-800 border border-gray-100 text-gray-800 dark:text-gray-200'
      }`}>
        <p className="text-sm leading-relaxed">{message.content}</p>
      </div>
    </div>
  ));

  const SatisfactionSurvey = () => (
    <Card className="mb-4 border-violet-200 bg-violet-50 dark:bg-violet-900/10 dark:border-violet-800">
      <CardContent className="p-6">
        <div className="text-center">
          <p className="text-sm font-medium mb-4 text-violet-800 dark:text-violet-200">Has your issue been resolved?</p>
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              className="border-violet-200 hover:bg-violet-100 hover:text-violet-800 dark:border-violet-700 dark:hover:bg-violet-900"
              onClick={() => {
                setIsSatisfied(false);
                setShowTicketDialog(true);
              }}
            >
              No, I need more help
            </Button>
            <Button
              className="bg-violet-600 hover:bg-violet-700 text-white"
              onClick={() => {
                setIsSatisfied(true);
                setMessages(prev => [...prev, {
                  type: 'bot',
                  content: "I'm glad I could help! Feel free to ask if you need anything else.",
                  timestamp: new Date(),
                  status: 'delivered'
                }]);
              }}
            >
              Yes, thank you!
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <div className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10 backdrop-blur-lg bg-opacity-80">
        <div className="w-full max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Uplift-AI Support</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">We're here to help you</p>
              </div>
            </div>
            <Button 
              className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => setShowTicketDialog(true)}
            >
              Create Ticket
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-28 pb-32 px-6 max-w-4xl mx-auto w-full">
        <div className="space-y-6">
          {messages.map((message, index) => (
            <MessageBubble key={`${message.timestamp.getTime()}-${index}`} message={message} />
          ))}

          {isTyping && <TypingIndicator />}

          {conversationCount > 5 && conversationCount % 3 === 0 && isSatisfied === null && (
            <SatisfactionSurvey />
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-10 backdrop-blur-lg bg-opacity-80">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="pr-28 focus-visible:ring-violet-500 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
              />
              <Button 
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4 bg-violet-600 hover:bg-violet-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                onClick={handleSendMessage} 
                disabled={!inputMessage.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl dark:text-gray-200">Create Support Ticket</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Fill out the form below to submit a new support ticket. Our team will respond as soon as possible.
            </DialogDescription>
          </DialogHeader>
          <Separator className="dark:bg-gray-700" />
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="issue-type" className="font-medium dark:text-gray-200">Issue Type</label>
              <Select
                value={ticketData.type}
                onValueChange={(value) => setTicketData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-gray-200">
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
              <label className="font-medium dark:text-gray-200">Priority</label>
              <Select
                value={ticketData.priority}
                onValueChange={(value) => setTicketData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-gray-200">
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
              <label htmlFor="description" className="font-medium dark:text-gray-200">Description</label>
              <Textarea
                id="description"
                placeholder="Please describe your issue in detail"
                value={ticketData.description}
                onChange={(e) => setTicketData(prev => ({ ...prev, description: e.target.value }))}
                className="h-32 bg-white dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
              />
            </div>
          </div>
          <Separator className="dark:bg-gray-700" />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setShowTicketDialog(false)}
              className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              className="bg-violet-600 hover:bg-violet-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              onClick={handleTicketSubmit}
              disabled={uploading}
            >
              {uploading ? 'Submitting...' : 'Submit Ticket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerChatInterface;