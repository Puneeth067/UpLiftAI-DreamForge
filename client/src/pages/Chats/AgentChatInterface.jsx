import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Send, 
  ArrowLeft, 
  User,
  CheckCircle2,
  MessageSquare,
  Loader2,
  Mail,
  Calendar
} from 'lucide-react';
import { chatService } from '@/services/api/chatService';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { supabase } from '../../utils/supabase';
import { chat } from '../../utils/supabase-chat';

function AgentChatInterface() {
  const location = useLocation();
  const { ticketId, userId, agentId, ticketData } = location.state || {};
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(ticketData || null);
  const [isResolutionDialogOpen, setIsResolutionDialogOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!ticketId || !agentId || !userId) return;

    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        // Load messages
        const messagesData = await chatService.getMessages(ticketId);
        setMessages(messagesData);

        // Load user details
        const { data: userData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        setUserDetails(userData);

        // Only load ticket details if not already provided
        if (!ticketData) {
          const { data: fetchedTicketData } = await supabase
            .from('tickets')
            .select('*')
            .eq('id', ticketId)
            .single();
          setTicketDetails(fetchedTicketData);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast({
          variant: "destructive",
          title: "Error loading chat data",
          description: "Please try refreshing the page."
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();

    // Subscribe to new messages
    const messageSubscription = chatService.subscribeToMessages(ticketId, (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
      if (newMessage.receiver_id === agentId) {
        chatService.markMessagesAsRead(ticketId, agentId);
      }
    });

    // Subscribe to typing indicators
    const typingSubscription = chat
      .channel(`typing:${ticketId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId !== agentId) {
          setIsTyping(true);
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
        }
      })
      .subscribe();

    return () => {
      messageSubscription.unsubscribe();
      typingSubscription.unsubscribe();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [ticketId, agentId, userId, ticketData]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleTyping = () => {
    const channel = chat.channel(`typing:${ticketId}`);
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: agentId }
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await chatService.sendMessage({
        ticketId,
        senderId: agentId,
        receiverId: userId,
        content: newMessage.trim(),
        messageType: 'text'
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

  const handleResolveTicket = async () => {
    if (!resolutionNote.trim()) return;
  
    try {
      // First update ticket status
      const { error: ticketError } = await supabase
        .from('tickets')
        .update({ 
          status: 'resolved',
          resolution_note: resolutionNote,
          resolved_at: new Date().toISOString(),
          resolved_by: agentId
        })
        .eq('id', ticketId);
  
      if (ticketError) throw ticketError;
  
      // Send resolution message as a regular text message instead of system
      await chatService.sendMessage({
        ticketId,
        senderId: agentId,
        receiverId: userId,
        content: `Ticket Resolution: ${resolutionNote}`,
        messageType: 'text' // Changed from 'system' to 'text'
      });

      // Delete all messages associated with this ticket
      const { error: deleteMessagesError } = await chat
        .from('messages')
        .delete()
        .eq('ticket_id', ticketId);
  
      if (deleteMessagesError) throw deleteMessagesError;
  
      toast({
        title: "Ticket Resolved",
        description: "The ticket has been marked as resolved."
      });
  
      // Update local ticket details state
      setTicketDetails(prev => ({
        ...prev,
        status: 'resolved',
        resolution_note: resolutionNote,
        resolved_at: new Date().toISOString(),
        resolved_by: agentId
      }));
  
      setIsResolutionDialogOpen(false);
      
      // Optional: You might want to stay on the page to see the resolution message
      // Instead of immediately going back, you could add a slight delay
      setTimeout(() => window.history.back(), 1500);
  
    } catch (error) {
      console.error('Error resolving ticket:', error);
      toast({
        variant: "destructive",
        title: "Failed to resolve ticket",
        description: error.message || "Please try again."
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Toaster />
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-[1fr_350px] gap-6">
          <div className="flex flex-col">
            <Card className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} mb-4 shadow-lg`}>
              <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      onClick={() => window.history.back()}
                      className={`${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsResolutionDialogOpen(true)}
                    className={`ml-auto ${ticketDetails?.status === 'resolved' ? 'opacity-50' : ''} 
                    ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    disabled={ticketDetails?.status === 'resolved'}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Resolve Ticket
                  </Button>
                </div>
              </div>
            </Card>

            <Card className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} flex-grow shadow-lg`}>
              <CardContent className="p-6">
                <ScrollArea 
                  ref={scrollAreaRef}
                  className="h-[calc(100vh-300px)] pr-4"
                >
                  <div className="space-y-6">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl p-4 shadow-sm
                            ${message.sender_id === userId
                              ? `${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white`
                              : `${isDarkMode 
                                  ? 'bg-gray-700 text-gray-100' 
                                  : 'bg-gray-100 text-gray-900'}`
                            } transition-colors`}
                        >
                          <p className="break-words leading-relaxed">{message.content}</p>
                          <div className="flex items-center justify-end gap-2 mt-2">
                            <span className={`text-xs ${
                              message.sender_id === userId
                                ? 'text-blue-100'
                                : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {new Date(message.created_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            {message.sender_id === userId && message.is_read && (
                              <CheckCircle2 className="h-3 w-3 text-blue-100" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {isTyping && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-4 ml-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100" />
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200" />
                      </div>
                      <span>Customer is typing...</span>
                    </div>
                  )}
                </ScrollArea>

                <form onSubmit={handleSendMessage} className="mt-6">
                  <div className="flex gap-3">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleTyping}
                      placeholder="Type your message..."
                      className={`${isDarkMode ? 'bg-gray-700 text-gray-100' : ''} 
                        rounded-xl py-6 px-4 focus:ring-2 focus:ring-blue-500`}
                      disabled={ticketDetails?.status === 'resolved'}
                    />
                    <Button 
                      type="submit" 
                      disabled={!newMessage.trim() || ticketDetails?.status === 'resolved'}
                      className="rounded-xl px-6 bg-blue-500 hover:bg-blue-600 transition-colors"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Improved Sidebar */}
          <Card className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <CardContent className="p-6">
              <div className="space-y-8">
                <div>
                  <h3 className={`font-semibold mb-4 text-lg ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    Ticket Information
                  </h3>
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <MessageSquare className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">#{ticketDetails?.id.slice(0, 8)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        <span>{new Date(ticketDetails?.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className={`font-semibold mb-4 text-lg ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    Customer Information
                  </h3>
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">{userDetails?.fullname}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-blue-500" />
                        <span className="text-sm">{userDetails?.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isResolutionDialogOpen} onOpenChange={setIsResolutionDialogOpen}>
        <DialogContent className={`${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white'} sm:max-w-md`}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Resolve Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter resolution note..."
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              className={`min-h-[120px] ${isDarkMode ? 'bg-gray-700 text-gray-100' : ''} 
                rounded-lg resize-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsResolutionDialogOpen(false)}
              className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleResolveTicket} 
              disabled={!resolutionNote.trim()}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Resolve Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AgentChatInterface;