import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import CyberCursorEffect from "@/components/ui/CyberCursorEffect";
import SidebarContent from '@/components/layout/Sidebar/Sidebar';
import { 
  Send, 
  ArrowLeft, 
  User,
  CheckCircle2,
  Loader2,
  Mail,
  Calendar,
  Star,
  Wand2,
  GraduationCap
} from 'lucide-react';
import { chatService } from '@/services/api/chatService';
import { useTheme } from '../../contexts/ThemeContext';
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { supabase } from '../../utils/supabase';
import { chat } from '../../utils/supabase-chat';

const BackgroundSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    preserveAspectRatio="xMidYMid slice"
    viewBox="0 0 1440 900"
  >
    <defs>
      <radialGradient id="lightGradient" cx="50%" cy="50%" r="75%">
        <stop offset="0%" stopColor="#F8F0FF" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#F0E6FF" stopOpacity="0.2" />
      </radialGradient>
     
      <radialGradient id="accentGradient" cx="50%" cy="50%" r="75%">
        <stop offset="0%" stopColor="#9B6DFF" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#D4BBFF" stopOpacity="0.1" />
      </radialGradient>

      <radialGradient id="darkGradient" cx="50%" cy="50%" r="75%">
        <stop offset="0%" stopColor="#2A1352" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#1A0B38" stopOpacity="0.2" />
      </radialGradient>
     
      <filter id="blurFilter">
        <feGaussianBlur stdDeviation="60" />
      </filter>

      <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="currentColor" className="text-purple-200 dark:text-purple-900" opacity="0.3" />
      </pattern>
    </defs>
   
    {/* Light Mode Patterns */}
    <g className="opacity-100 dark:opacity-0">
      <rect width="100%" height="100%" fill="url(#dots)" />
      <circle cx="200" cy="150" r="400" fill="url(#lightGradient)" filter="url(#blurFilter)" />
      <circle cx="1200" cy="300" r="500" fill="url(#lightGradient)" opacity="0.4" filter="url(#blurFilter)" />
      <circle cx="800" cy="600" r="300" fill="url(#accentGradient)" opacity="0.3" filter="url(#blurFilter)" />
      <path d="M0,300 Q720,400 1440,300 Q720,500 0,300" fill="url(#accentGradient)" opacity="0.15" />
      <ellipse cx="600" cy="750" rx="600" ry="300" fill="url(#lightGradient)" opacity="0.2" filter="url(#blurFilter)" />
    </g>
   
    {/* Dark Mode Patterns */}
    <g className="opacity-0 dark:opacity-100">
      <rect width="100%" height="100%" fill="url(#dots)" />
      <circle cx="300" cy="200" r="600" fill="url(#darkGradient)" filter="url(#blurFilter)" />
      <path d="M1440,600 Q720,800 0,600 Q720,400 1440,600" fill="url(#darkGradient)" opacity="0.25" />
      <ellipse cx="1100" cy="500" rx="700" ry="400" fill="url(#darkGradient)" opacity="0.2" filter="url(#blurFilter)" />
      <circle cx="800" cy="750" r="400" fill="url(#darkGradient)" opacity="0.15" filter="url(#blurFilter)" />
    </g>
  </svg>
);

function CustomerChatInterface() {
  const location = useLocation();
  const { ticketId, userId, agentId, ticketData } = location.state || {};
  const { isDarkMode, loadUserTheme } = useTheme();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(ticketData || null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  const handleMouseEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    // Add a small delay before collapsing to make the interaction smoother
    const timeout = setTimeout(() => {
      setIsCollapsed(true);
    }, 400); // 300ms delay
    setHoverTimeout(timeout);
  };

  // Clear timeout on component unmount
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
        // Load messages
        const messagesData = await chatService.getMessages(ticketId);
        setMessages(messagesData);

        // Load user details
        const { data: userData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', agentId)
          .single();

        setUserDetails(userData);
        loadUserTheme(userId);


        // Only load ticket details if not already provided
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

    // Subscribe to new messages
    const messageSubscription = chatService.subscribeToMessages(ticketId, (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
      if (newMessage.receiver_id === userId) {
        chatService.markMessagesAsRead(ticketId, userId);
      }
    });

    // Subscribe to typing indicators
    const typingSubscription = chat
      .channel(`typing:${ticketId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId !== userId) {
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
  // Add two refs for scrolling
  const scrollAreaRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when messages are first loaded or updated
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages]);

  const handleTyping = () => {
    const channel = chat.channel(`typing:${ticketId}`);
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: userId }
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await chatService.sendMessage({
        ticketId,
        senderId: userId,
        receiverId: agentId,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <p className="text-sm text-gray-500">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen cursor-none ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <BackgroundSVG className="z-0 "/>
      <CyberCursorEffect />
      <aside 
        className={`hidden md:block fixed left-0 top-0 h-full border-r border-purple-100 dark:border-purple-900/50 shrink-0 bg-purple-50/80 dark:bg-purple-950/30 z-30 transition-all duration-600 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <SidebarContent 
        userId={userId}
        isDarkMode={isDarkMode}
        />
      </aside>
      <Toaster />
      <div className="max-w-5xl mx-auto p-6">
        <div className="grid grid-cols-[1fr_350px] gap-6">
          <div className="flex flex-col w-[600px]">
          <Card className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} mt-4 mb-4 shadow-lg w-full max-w-4xl mx-auto`}>
            <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => window.history.back()}
                  className={`${isDarkMode 
                    ? 'text-purple-300 hover:bg-gray-700 hover:text-purple-200' 
                    : 'hover:bg-gray-100 text-fuchsia-800 hover:text-purple-700'} transition-colors`}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
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
                      className={`flex ${message.sender_id === userId 
                        ? 'justify-end' 
                        : 'justify-start'} mb-4`}
                    >
                      <div
                        className={`
                          w-[300px] 
                          rounded-3xl 
                          p-4 
                          shadow-md 
                          relative 
                          group
                          overflow-hidden
                          break-words
                          m-2
                          ${message.sender_id === userId
                            ? `${isDarkMode 
                              ? 'bg-purple-800 text-white' 
                              : 'bg-purple-500 text-white'}
                          rounded-tl-sm`
                            : `${isDarkMode 
                              ? 'bg-gray-700 text-gray-100' 
                              : 'bg-gray-100 text-gray-900'}
                          rounded-tr-sm`
                        }
                          transition-all duration-300 ease-in-out
                        `}
                      >
                        <p className="
                          leading-relaxed 
                          text-sm 
                          break-words 
                          whitespace-pre-wrap 
                          overflow-hidden
                          text-left
                        ">
                          {message.content}
                        </p>
                        
                        <div className="flex items-center justify-end gap-2 mt-2">
                          <span 
                            className={`text-xs opacity-70 
                              ${message.sender_id === userId
                                ? isDarkMode 
                                  ? 'text-purple-100' 
                                  : 'text-white/70'
                                : isDarkMode 
                                  ? 'text-gray-400' 
                                  : 'text-gray-500'
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
                                  ? 'text-purple-300' 
                                  : 'text-purple-200'
                                }`} 
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add this ref at the end of messages to enable scrolling */}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-4 ml-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-100" />
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-200" />
                    </div>
                    <span>Patron is typing...</span>
                  </div>
                )}
              </ScrollArea>

              {/* Textarea-based input */}
              <form onSubmit={handleSendMessage} className="mt-6">
                <div className="flex gap-3 items-end">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      handleTyping();
                      // Allow sending message with Shift+Enter
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Type your message... (Shift+Enter for new line)"
                    className={`
                      ${isDarkMode 
                        ? 'bg-gray-700 text-gray-100 focus:ring-purple-600' 
                        : 'focus:ring-purple-500'}
                      rounded-xl 
                      py-3 
                      px-4 
                      focus:ring-2
                      min-h-[80px]
                      resize-none
                      text-sm
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
                      bg-purple-500 
                      hover:bg-purple-600 
                      transition-colors
                      mb-1
                    "
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          </div>

          {/* Improved Sidebar */}
          <Card className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} mt-4 shadow-lg h-[calc(100vh-100px)] overflow-hidden`}>
            <CardContent className="p-6 h-full overflow-hidden">
              <div className="h-full flex flex-col">
                <div className="space-y-8 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent">
                  <div>
                    <h3 className={`font-semibold mb-4 text-lg ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      Proposal Details
                    </h3>
                    <div className="space-y-4">
                      <div 
                        className={`
                          p-4 
                          rounded-lg 
                          ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}
                          max-h-[200px] 
                          overflow-y-auto 
                          scrollbar-thin 
                          scrollbar-thumb-purple-300 
                          scrollbar-track-transparent
                        `}
                      >                      
                        <div className="flex items-center gap-3 mb-2">
                          <Star className="h-5 w-5 text-purple-500 flex-shrink-0" />
                          <span className="font-medium">{ticketDetails?.issue_type}</span>
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                          <Wand2 className="h-5 w-5 text-purple-500 flex-shrink-0" />
                          <span className="font-medium break-words">{ticketDetails?.description}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-purple-500 flex-shrink-0" />
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
                      Creator Info
                    </h3>
                    <div 
                      className={`
                        p-4 
                        rounded-lg 
                        ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}
                        max-h-[200px] 
                        overflow-y-auto 
                        scrollbar-thin 
                        scrollbar-thumb-purple-300 
                        scrollbar-track-transparent
                      `}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-purple-500 flex-shrink-0" />
                          <span className="font-medium">{userDetails?.fullname}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-purple-500 flex-shrink-0" />
                          <span className="text-sm">{userDetails?.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <GraduationCap  className="h-5 w-5 text-purple-500 flex-shrink-0" />
                          <span className="text-sm">{userDetails?.department}</span>
                        </div>
                      </div>
                    </div>
                  </div>                  
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CustomerChatInterface;