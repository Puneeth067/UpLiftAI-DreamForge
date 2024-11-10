import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, Paperclip, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TypingIndicator = () => (
  <div className="flex items-center space-x-2 p-4">
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

const CustomerChatInterface = () => {
  const navigate = useNavigate();
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
  const fileInputRef = useRef(null);
  const [ticketData, setTicketData] = useState({
    type: '',
    priority: 'medium',
    description: '',
    attachments: []
  });

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

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const fileMessages = files.map(file => ({
        type: 'user',
        content: `Attached file: ${file.name}`,
        timestamp: new Date(),
        isFile: true,
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(2) + ' KB'
      }));
      
      setMessages(prev => [...prev, ...fileMessages]);
      setTicketData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...files]
      }));
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
      // Add error handling UI if needed
    }
  };

  const MessageBubble = React.memo(({ message }) => (
    <div className={`flex items-start gap-3 mb-4 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
      <div className="flex flex-col items-center gap-1">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
          {message.type === 'bot' ? 
            <Bot className="w-5 h-5 text-white" /> : 
            <UserIcon className="w-5 h-5 text-white" />
          }
        </div>
        <span className="text-xs text-gray-400">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className={`relative max-w-[70%] p-3 rounded-lg ${
        message.type === 'user' 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        {message.isFile ? (
          <div className="flex items-center gap-2">
            <Paperclip className="w-4 h-4" />
            <div>
              <p className="font-medium">{message.fileName}</p>
              <p className="text-sm opacity-75">{message.fileSize}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed">{message.content}</p>
        )}
      </div>
    </div>
  ));

  const SatisfactionSurvey = () => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="text-center">
          <p className="text-sm font-medium mb-3">Has your issue been resolved?</p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsSatisfied(false);
                setShowTicketDialog(true);
              }}
            >
              No, I need more help
            </Button>
            <Button
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

  const handleTicketSubmit = () => {
    if (!ticketData.type || !ticketData.description) {
      return; // Add error handling UI if needed
    }

    setShowTicketDialog(false);
    setMessages(prev => [...prev, {
      type: 'bot',
      content: `Ticket created successfully! Your ticket number is #${Math.floor(Math.random() * 10000)}. A support agent will contact you soon.`,
      timestamp: new Date(),
      status: 'delivered'
    }]);
    
    setTicketData({
      type: '',
      priority: 'medium',
      description: '',
      attachments: []
    });
    
    setTimeout(() => navigate('/customerdashboard'), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
        <div className="w-full flex justify-center px-4 py-4">
          <div className="max-w-3xl w-full">
            <div className="flex items-center justify-center">
              <h2 className="text-xl font-semibold text-gray-800">Customer Support</h2>
            </div>
          </div>
        </div>
      </div>


      <div className="flex-1 overflow-y-auto pt-24 pb-32 px-6 max-w-3xl mx-auto w-full">

        {messages
          .map((message, index) => (
            <MessageBubble key={`${message.timestamp.getTime()}-${index}`} message={message} />
          ))}

        {isTyping && <TypingIndicator />}

        {conversationCount > 5 && conversationCount % 3 === 0 && isSatisfied === null && (
          <SatisfactionSurvey />
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="max-w-3xl mx-auto p-4">
          <div className="flex items-center gap-2">
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
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        className="hidden"
      />

      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="issue-type">Issue Type</label>
              <Select
                value={ticketData.type}
                onValueChange={(value) => setTicketData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
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
              <label>Priority</label>
              <Select
                value={ticketData.priority}
                onValueChange={(value) => setTicketData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="description">Description</label>
              <Textarea
                id="description"
                placeholder="Please describe your issue in detail"
                value={ticketData.description}
                onChange={(e) => setTicketData(prev => ({ ...prev, description: e.target.value }))}
                className="h-32"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTicketDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleTicketSubmit}>
              Submit Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerChatInterface;