import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Send, ArrowLeft } from 'lucide-react';
import { chatService } from '@/services/api/chatService';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const CustomerChatInterface = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { ticketId, agentId, userData, ticketData } = location.state || {};
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const scrollAreaRef = useRef(null);

  // Validate required data on mount
  useEffect(() => {
    if (!location.state || !ticketId || !agentId || !userData?.id) {
      console.error('Missing required chat data:', { ticketId, agentId, userData });
      toast({
        variant: "destructive",
        title: "Error loading chat",
        description: "Missing required chat data. Please try again."
      });
      navigate('/customertickets', { 
        state: { userData } 
      });
      return;
    }

    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const data = await chatService.getMessages(ticketId);
        setMessages(data);
      } catch (error) {
        console.error('Error loading messages:', error);
        toast({
          variant: "destructive",
          title: "Error loading messages",
          description: "Please try refreshing the page."
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    // Subscribe to new messages
    const subscription = chatService.subscribeToMessages(ticketId, (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
      // Mark message as read if it's for the current user
      if (newMessage.receiver_id === userData.id) {
        chatService.markMessagesAsRead(ticketId, userData.id);
      }
    });

    // Clean up subscription on unmount
    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, [ticketId, agentId, userData, location.state, navigate]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await chatService.sendMessage({
        ticketId,
        senderId: userData.id,
        receiverId: agentId,
        content: newMessage.trim(),
        messageType: 'text'  // Add messageType parameter
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: "Please try again."
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Toaster />
      <div className="max-w-4xl mx-auto p-4">
        <Card className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
          <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/customertickets', { 
                  state: { userData } 
                })}
                className={isDarkMode ? 'text-gray-300' : ''}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tickets
              </Button>
              {ticketData && (
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span>Ticket #{ticketData.id.slice(0, 8)} - {ticketData.issue_type}</span>
                </div>
              )}
            </div>
          </div>
          
          <CardContent className="p-4">
            <ScrollArea 
              ref={scrollAreaRef}
              className="h-[600px] pr-4"
            >
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === userData.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender_id === userData.id
                          ? `${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white`
                          : `${
                              isDarkMode 
                                ? 'bg-gray-700 text-gray-100' 
                                : 'bg-gray-100 text-gray-900'
                            }`
                      }`}
                    >
                      <p className="break-words">{message.content}</p>
                      <span className={`text-xs ${
                        message.sender_id === userData.id
                          ? 'text-blue-100'
                          : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className={isDarkMode ? 'bg-gray-700 text-gray-100' : ''}
                disabled={ticketData?.status === 'resolved'}
              />
              <Button 
                type="submit" 
                disabled={!newMessage.trim() || ticketData?.status === 'resolved'}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerChatInterface;