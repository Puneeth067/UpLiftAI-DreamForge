import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import CyberCursorEffect from "@/components/ui/CyberCursorEffect";
import SidebarContent from '@/components/layout/Sidebar/Sidebar';
import LoadingScreen from "@/components/ui/loading";
import { 
  Send, 
  ArrowLeft, 
  User,
  CheckCircle2,
  Mail,
  Calendar,
  PhoneCall,
  Star,
  Wand2,
  XCircle,
  X
} from 'lucide-react';
import { chatService } from '@/services/api/chatService';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { supabase } from '../../utils/supabase';
import { chat } from '../../utils/supabase-chat';
import PropTypes from 'prop-types';

const BackgroundSVG = ({ isDarkMode }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    preserveAspectRatio="xMidYMid slice"
    viewBox="0 0 1440 900"
  >
    <defs>
      <radialGradient id="lightGradient" cx="50%" cy="50%" r="75%">
        <stop offset="0%" stopColor="#F0F4FF" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#FAFAFF" stopOpacity="0.3" />
      </radialGradient>
     
      <radialGradient id="accentGradient" cx="50%" cy="50%" r="75%">
        <stop offset="0%" stopColor="#6366F1" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#818CF8" stopOpacity="0.1" />
      </radialGradient>

      <radialGradient id="darkGradient" cx="50%" cy="50%" r="75%">
        <stop offset="0%" stopColor="#111827" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#0A0F1C" stopOpacity="0.3" />
      </radialGradient>
     
      <filter id="blurFilter">
        <feGaussianBlur stdDeviation="80" />
      </filter>

      <pattern id="dots" x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse">
        <circle cx="3" cy="3" r="1.5" fill={isDarkMode ? "#818CF8" : "#6366F1"} opacity="0.15" />
      </pattern>
    </defs>
   
    {/* Light Mode Patterns */}
    <g className="opacity-100 dark:opacity-0">
      <rect width="100%" height="100%" fill="url(#dots)" />
      <circle cx="300" cy="200" r="500" fill="url(#lightGradient)" filter="url(#blurFilter)" />
      <circle cx="1100" cy="400" r="600" fill="url(#lightGradient)" opacity="0.5" filter="url(#blurFilter)" />
      <circle cx="700" cy="700" r="400" fill="url(#accentGradient)" opacity="0.4" filter="url(#blurFilter)" />
      <path d="M0,400 Q720,500 1440,400 Q720,600 0,400" fill="url(#accentGradient)" opacity="0.2" />
    </g>
   
    {/* Dark Mode Patterns */}
    <g className="opacity-0 dark:opacity-100">
      <rect width="100%" height="100%" fill="url(#dots)" />
      <circle cx="400" cy="300" r="700" fill="url(#darkGradient)" filter="url(#blurFilter)" />
      <path d="M1440,700 Q720,900 0,700 Q720,500 1440,700" fill="url(#darkGradient)" opacity="0.3" />
      <ellipse cx="1000" cy="600" rx="800" ry="500" fill="url(#darkGradient)" opacity="0.25" filter="url(#blurFilter)" />
      <circle cx="600" cy="150" r="300" fill="url(#accentGradient)" opacity="0.1" filter="url(#blurFilter)" />
    </g>
  </svg>
);

function AgentChatInterface() {
  const location = useLocation();
  const { ticketId, userId, agentId, ticketData } = location.state || {};
  const { isDarkMode, loadUserTheme } = useTheme();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(ticketData || null);
  const [isResolutionDialogOpen, setIsResolutionDialogOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [setIsCollapsed] = useState(true);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  const handleMouseEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsCollapsed(true);
    }, 400);
    setHoverTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [hoverTimeout]);

  useEffect(() => {
    if (!ticketId || !agentId || !userId) return;

    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const messagesData = await chatService.getMessages(ticketId);
        setMessages(messagesData);

        const { data: userData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        setUserDetails(userData);
        loadUserTheme(agentId);

        if (!ticketData) {
          const { data: fetchedTicketData } = await supabase
            .from('tickets')
            .select('*')
            .eq('id', ticketId)
            .single();
          setTicketDetails(fetchedTicketData);
        }

        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }, 100);
    
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

    const messageSubscription = chatService.subscribeToMessages(ticketId, (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
      if (newMessage.receiver_id === agentId) {
        chatService.markMessagesAsRead(ticketId, agentId);
      }
    });

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
  }, [ticketId, agentId, userId, ticketData, loadUserTheme]);

  const scrollAreaRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
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

  const updateTicketStatus = async (status, reason = "") => {
    if (!ticketDetails) return;

    try {
      const updateData = { 
        status: status, 
        last_update: new Date().toISOString()
      };

      if (status === "rejected") {
        updateData.rejection_reason = reason.trim();
        updateData.agent_id = agentId;
      }

      const { error } = await supabase
        .from("tickets")
        .update(updateData)
        .eq("id", ticketDetails.id)
        .select();

      if (error) {
        console.error("Error updating proposal status:", error);
        return;
      }

      setIsRejectionDialogOpen(false);

    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const handleResolveTicket = async () => {
    if (!resolutionNote.trim()) return;
  
    try {
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
  
      await chatService.sendMessage({
        ticketId,
        senderId: agentId,
        receiverId: userId,
        content: `Ticket Resolution: ${resolutionNote}`,
        messageType: 'text'
      });

      const { error: deleteMessagesError } = await chat
        .from('messages')
        .delete()
        .eq('ticket_id', ticketId);
  
      if (deleteMessagesError) throw deleteMessagesError;
  
      toast({
        title: "Ticket Resolved",
        description: "The ticket has been marked as resolved."
      });
  
      setTicketDetails(prev => ({
        ...prev,
        status: 'resolved',
        resolution_note: resolutionNote,
        resolved_at: new Date().toISOString(),
        resolved_by: agentId
      }));
  
      setIsResolutionDialogOpen(false);
      
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

  const handleReject = () => {
    setIsRejectionDialogOpen(true);
  };

  const RejectionReasonDialog = () => {
    const [rejectionDetails, setRejectionDetails] = useState({
      reason: ''
    });
   
    const handleSubmitRejection = () => {
      if (rejectionDetails.reason.trim()) {
        updateTicketStatus("rejected", rejectionDetails.reason);
      }
      setTimeout(() => window.history.back(), 1500);
    };
   
    return (
      <Dialog
        open={isRejectionDialogOpen}
        onOpenChange={(open) => {
          setIsRejectionDialogOpen(open);
          if (!open) {
            setRejectionDetails({ reason: '' });
          }
        }}
      >
        <DialogContent className={`sm:max-w-[500px] ${
          isDarkMode 
            ? 'bg-surface dark:bg-surface border-primary/20 dark:border-primary/20' 
            : 'bg-surface border-primary/20'
        }`}>
          <DialogHeader>
            <DialogTitle className="text-foreground dark:text-foreground">
              Redirect Creative Journey
            </DialogTitle>
            <DialogDescription className="text-foreground/70 dark:text-foreground/70">
              Share insights on why this creative concept requires redirection
            </DialogDescription>
          </DialogHeader>
   
          <Textarea
            placeholder="Craft a thoughtful narrative explaining the creative realignment..."
            value={rejectionDetails.reason}
            onChange={(e) => {
              setRejectionDetails(prev => ({
                ...prev,
                reason: e.target.value
              }))
            }}
            className={`min-h-[100px] ${
              isDarkMode
                ? 'bg-background dark:bg-background text-foreground dark:text-foreground border-primary/20 dark:border-primary/20 focus:border-primary dark:focus:border-primary focus:ring-primary dark:focus:ring-primary' 
                : 'bg-background text-foreground border-primary/20 focus:border-primary focus:ring-primary'
            }`}
          />
   
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsRejectionDialogOpen(false)}
              className={`mr-2 ${
                isDarkMode 
                  ? 'text-foreground/70 dark:text-foreground/70 hover:bg-surface/80 dark:hover:bg-surface/80 border border-primary/20 dark:border-primary/20' 
                  : 'text-foreground/70 hover:bg-surface/80 border border-primary/20'
              }`}
            >
              <X className="mr-2 h-4 w-4 text-primary dark:text-primary" /> Reconsider
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmitRejection}
              disabled={!rejectionDetails.reason.trim()}
              className="bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600 text-white"
            >
              <XCircle className="mr-2 h-4 w-4" /> Redirect Concept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className={`min-h-screen cursor-none ${isDarkMode ? 'bg-background dark:bg-background' : 'bg-background'}`}>
      <BackgroundSVG isDarkMode={isDarkMode} />
      <CyberCursorEffect />
      <aside 
        className={`hidden md:block fixed left-0 top-0 h-full border-r shrink-0 z-30 transition-all duration-600 ease-in-out ${
          isDarkMode 
            ? 'border-primary/20 dark:border-primary/20 bg-surface/90 dark:bg-surface/90 backdrop-blur-sm' 
            : 'border-primary/20 bg-surface/90 backdrop-blur-sm'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <SidebarContent 
        userId={agentId}
        isDarkMode={isDarkMode}
        />
      </aside>
      <Toaster />
      <div className="max-w-5xl mx-auto p-6">
        <div className="grid grid-cols-[1fr_350px] gap-6">
          <div className="flex flex-col w-[600px]">
          <Card className={`${
            isDarkMode 
              ? 'bg-surface/95 dark:bg-surface/95 backdrop-blur-sm border-primary/20 dark:border-primary/20' 
              : 'bg-surface/95 backdrop-blur-sm border-primary/20'
            } mt-4 mb-4 shadow-xl shadow-primary/5 dark:shadow-primary/5 w-full max-w-4xl mx-auto`}>
            <div className={`p-4 border-b ${isDarkMode ? 'border-primary/20 dark:border-primary/20' : 'border-primary/20'}`}>
              <div className="flex items-center justify-between space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => window.history.back()}
                  className={`${isDarkMode 
                    ? 'text-primary dark:text-primary hover:bg-primary/10 dark:hover:bg-primary/10 hover:text-primary-hover dark:hover:text-primary-hover' 
                    : 'hover:bg-primary/10 text-primary hover:text-primary-hover'} transition-colors`}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setIsResolutionDialogOpen(true)}
                  className={`${ticketDetails?.status === 'resolved' ? 'opacity-50' : ''} 
                  ${isDarkMode 
                    ? 'hover:bg-secondary dark:hover:bg-secondary bg-secondary dark:bg-secondary border-secondary dark:border-secondary text-white dark:text-white' 
                    : 'hover:bg-secondary bg-secondary border-secondary text-white'}`}
                  disabled={ticketDetails?.status === 'resolved'}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm Proposal
                </Button>
              </div>
            </div>
          </Card>

          <Card className={`${
            isDarkMode 
              ? 'bg-surface/95 dark:bg-surface/95 backdrop-blur-sm border-primary/20 dark:border-primary/20' 
              : 'bg-surface/95 backdrop-blur-sm border-primary/20'
            } flex-grow shadow-xl shadow-primary/5 dark:shadow-primary/5`}>
            <CardContent className="p-6">
              <ScrollArea
                ref={scrollAreaRef}
                className="h-[calc(100vh-300px)] pr-4"
              >
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === userId 
                        ? 'justify-start' 
                        : 'justify-end'} mb-4`}
                    >
                      <div
                        className={`
                          w-[300px] 
                          rounded-3xl 
                          p-4 
                          shadow-lg
                          shadow-primary/10
                          dark:shadow-primary/10
                          relative 
                          group
                          overflow-hidden
                          break-words
                          m-2
                          backdrop-blur-sm
                          ${message.sender_id === userId
                            ? `${isDarkMode 
                              ? 'bg-background/95 dark:bg-background/95 text-foreground dark:text-foreground border border-primary/20 dark:border-primary/20' 
                              : 'bg-background/95 text-foreground border border-primary/20'}
                          rounded-tl-sm`
                            : `${isDarkMode 
                              ? 'bg-primary dark:bg-primary text-white dark:text-white' 
                              : 'bg-primary text-white'}
                          rounded-tr-sm`
                        }
                          transition-all duration-300 ease-in-out
                          hover:shadow-xl
                          hover:shadow-primary/20
                          dark:hover:shadow-primary/20
                        `}
                      >
                        <p className="
                          leading-relaxed 
                          text-sm 
                          break-words 
                          whitespace-pre-wrap 
                          overflow-hidden
                          text-left
                          font-medium
                        ">
                          {message.content}
                        </p>
                        
                        <div className="flex items-center justify-end gap-2 mt-2">
                          <span 
                            className={`text-xs opacity-70 font-medium
                              ${message.sender_id === userId
                                ? isDarkMode 
                                  ? 'text-foreground/60 dark:text-foreground/60' 
                                  : 'text-foreground/60'
                                : isDarkMode 
                                  ? 'text-white/80 dark:text-white/80' 
                                  : 'text-white/80'
                              }`}
                          >
                            {new Date(message.created_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {message.sender_id === userId && message.is_read && (
                            <CheckCircle2 
                              className={`h-3 w-3 
                                ${isDarkMode 
                                  ? 'text-secondary dark:text-secondary' 
                                  : 'text-secondary'
                                }`} 
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div ref={messagesEndRef} />
                </div>
                
                {isTyping && (
                  <div className="flex items-center gap-2 text-sm text-foreground/70 dark:text-foreground/70 mt-4 ml-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary dark:bg-primary animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-primary dark:bg-primary animate-bounce delay-100" />
                      <span className="w-2 h-2 rounded-full bg-primary dark:bg-primary animate-bounce delay-200" />
                    </div>
                    <span className="font-medium">Patron is typing...</span>
                  </div>
                )}
              </ScrollArea>

              <form onSubmit={handleSendMessage} className="mt-6">
                <div className="flex gap-3 items-end">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      handleTyping();
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Type your message... (Shift+Enter for new line)"
                    className={`
                      ${isDarkMode 
                        ? 'bg-background/95 dark:bg-background/95 text-foreground dark:text-foreground focus:ring-primary dark:focus:ring-primary focus:border-primary dark:focus:border-primary border-primary/20 dark:border-primary/20' 
                        : 'bg-background/95 text-foreground focus:ring-primary focus:border-primary border-primary/20'}
                      rounded-xl 
                      py-3 
                      px-4 
                      focus:ring-2
                      min-h-[80px]
                      resize-none
                      text-sm
                      font-medium
                      shadow-sm
                      shadow-primary/5
                      dark:shadow-primary/5
                      backdrop-blur-sm
                      placeholder:text-foreground/50
                      dark:placeholder:text-foreground/50
                    `}
                    disabled={ticketDetails?.status === 'resolved'}
                  />
                  <Button 
                    type="submit" 
                    disabled={!newMessage.trim() || ticketDetails?.status === 'resolved'}
                    className="
                      rounded-xl 
                      px-4 
                      py-3 
                      bg-primary
                      dark:bg-primary
                      hover:bg-primary-hover
                      dark:hover:bg-primary-hover
                      transition-colors
                      mb-1
                      shadow-lg
                      shadow-primary/20
                      dark:shadow-primary/20
                      text-white
                      dark:text-white
                    "
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          </div>

          <Card className={`${
            isDarkMode 
              ? 'bg-surface/95 dark:bg-surface/95 backdrop-blur-sm border-primary/20 dark:border-primary/20' 
              : 'bg-surface/95 backdrop-blur-sm border-primary/20'
            } mt-4 shadow-xl shadow-primary/5 dark:shadow-primary/5 h-[calc(100vh-100px)] overflow-hidden`}>
            <CardContent className="p-6 h-full overflow-hidden">
              <div className="h-full flex flex-col">
                <div className="space-y-8 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
                  <div>
                    <h3 className={`font-bold mb-4 text-lg ${isDarkMode ? 'text-foreground dark:text-foreground' : 'text-foreground'}`}>
                      Proposal Details
                    </h3>
                    <div className="space-y-4">
                      <div 
                        className={`
                          p-4 
                          rounded-lg 
                          ${isDarkMode 
                            ? 'bg-background/80 dark:bg-background/80 border-primary/20 dark:border-primary/20' 
                            : 'bg-background/80 border-primary/20'}
                          max-h-[200px] 
                          overflow-y-auto 
                          scrollbar-thin 
                          scrollbar-thumb-primary/30 
                          scrollbar-track-transparent
                          border
                          backdrop-blur-sm
                          shadow-sm
                          shadow-primary/5
                          dark:shadow-primary/5
                        `}
                      >                      
                        <div className="flex items-center gap-3 mb-3">
                          <Star className="h-5 w-5 text-accent dark:text-accent flex-shrink-0" />
                          <span className="font-semibold text-foreground dark:text-foreground">{ticketDetails?.issue_type}</span>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <Wand2 className="h-5 w-5 text-primary dark:text-primary flex-shrink-0" />
                          <span className="font-medium break-words text-left text-foreground dark:text-foreground">{ticketDetails?.description}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-secondary dark:text-secondary flex-shrink-0" />
                          <span className="text-foreground/80 dark:text-foreground/80 font-medium">{new Date(ticketDetails?.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className={`font-bold mb-4 text-lg ${isDarkMode ? 'text-foreground dark:text-foreground' : 'text-foreground'}`}>
                      Patron Info
                    </h3>
                    <div 
                      className={`
                        p-4 
                        rounded-lg 
                        ${isDarkMode 
                          ? 'bg-background/80 dark:bg-background/80 border-primary/20 dark:border-primary/20' 
                          : 'bg-background/80 border-primary/20'}
                        max-h-[200px] 
                        overflow-y-auto 
                        scrollbar-thin 
                        scrollbar-thumb-primary/30 
                        scrollbar-track-transparent
                        border
                        backdrop-blur-sm
                        shadow-sm
                        shadow-primary/5
                        dark:shadow-primary/5
                      `}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-primary dark:text-primary flex-shrink-0" />
                          <span className="font-semibold text-foreground dark:text-foreground">{userDetails?.fullname}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-secondary dark:text-secondary flex-shrink-0" />
                          <span className="text-sm text-foreground/80 dark:text-foreground/80 font-medium">{userDetails?.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <PhoneCall className="h-5 w-5 text-accent dark:text-accent flex-shrink-0" />
                          <span className="text-sm text-foreground/80 dark:text-foreground/80 font-medium">{userDetails?.phonenumber}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                  <Button 
                    variant="destructive" 
                    onClick={handleReject}
                    className="mr-2 bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600 text-white shadow-lg shadow-red-500/20 dark:shadow-red-500/20"
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Decline Vision
                  </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isResolutionDialogOpen} onOpenChange={setIsResolutionDialogOpen}>
        <DialogContent className={`${
          isDarkMode 
            ? 'bg-surface/95 dark:bg-surface/95 text-foreground dark:text-foreground border-primary/20 dark:border-primary/20' 
            : 'bg-surface/95 text-foreground border-primary/20'
          } sm:max-w-md backdrop-blur-sm shadow-xl shadow-primary/10 dark:shadow-primary/10`}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground dark:text-foreground">Confirm Proposal Creation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter Acceptance note..."
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              className={`min-h-[120px] ${isDarkMode 
                ? 'bg-background/95 dark:bg-background/95 text-foreground dark:text-foreground focus:ring-primary dark:focus:ring-primary focus:border-primary dark:focus:border-primary border-primary/20 dark:border-primary/20' 
                : 'bg-background/95 text-foreground focus:ring-primary focus:border-primary border-primary/20'} 
                rounded-lg resize-none focus:ring-2 backdrop-blur-sm shadow-sm shadow-primary/5 dark:shadow-primary/5 font-medium placeholder:text-foreground/50 dark:placeholder:text-foreground/50`}
            />
          </div>
          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsResolutionDialogOpen(false)}
              className={isDarkMode 
                ? 'hover:bg-surface/80 dark:hover:bg-surface/80 border-primary/20 dark:border-primary/20 text-foreground dark:text-foreground' 
                : 'hover:bg-surface/80 border-primary/20 text-foreground'}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleResolveTicket} 
              disabled={!resolutionNote.trim()}
              className="bg-primary dark:bg-primary hover:bg-primary-hover dark:hover:bg-primary-hover text-white dark:text-white shadow-lg shadow-primary/20 dark:shadow-primary/20"
            >
              Accept Proposal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RejectionReasonDialog />
    </div>
  );
}

BackgroundSVG.propTypes = {
  isDarkMode: PropTypes.bool.isRequired
};

export default AgentChatInterface;