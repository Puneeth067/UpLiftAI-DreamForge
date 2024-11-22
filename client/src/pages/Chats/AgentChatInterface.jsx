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
  Clock,
  CheckCircle2,
  MessageSquare
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
import { Badge } from "@/components/ui/badge";
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
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Toaster />
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-[1fr_300px] gap-4">
          <Card className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
            <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={() => window.history.back()}
                  className={isDarkMode ? 'text-gray-300' : ''}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Tickets
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsResolutionDialogOpen(true)}
                  className="ml-auto"
                  disabled={ticketDetails?.status === 'resolved'}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Resolve Ticket
                </Button>
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
                        message.sender_id === userId ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender_id === userId
                            ? `${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white`
                            : `${
                                isDarkMode 
                                  ? 'bg-gray-700 text-gray-100' 
                                  : 'bg-gray-100 text-gray-900'
                              }`
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className={`text-xs ${
                            message.sender_id === userId
                              ? 'text-blue-100'
                              : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {new Date(message.created_at).toLocaleTimeString()}
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
                  <div className="text-sm text-gray-500 mt-2">
                    Customer is typing...
                  </div>
                )}
              </ScrollArea>

              <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleTyping}
                  placeholder="Type your message..."
                  className={isDarkMode ? 'bg-gray-700 text-gray-100' : ''}
                  disabled={ticketDetails?.status === 'resolved'}
                />
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim() || ticketDetails?.status === 'resolved'}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sidebar with ticket and user details */}
          <Card className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
            <CardContent className="p-4">
              <div className="space-y-6">
                <div>
                  <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    Ticket Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>#{ticketDetails?.id.slice(0, 8)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(ticketDetails?.created_at).toLocaleDateString()}</span>
                    </div>
                    <Badge variant={ticketDetails?.status === 'resolved' ? 'success' : 'secondary'}>
                      {ticketDetails?.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    Customer Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{userDetails?.full_name}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {userDetails?.email}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isResolutionDialogOpen} onOpenChange={setIsResolutionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter resolution note..."
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResolutionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolveTicket} disabled={!resolutionNote.trim()}>
              Resolve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AgentChatInterface;
