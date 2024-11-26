import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  CircleSlash, 
  MessageSquare, 
  Search, 
  Timer,
  Clock,
  XCircle,
  MessageCircle,
  CheckCircle2,
  CheckCircle,
  User,
  Home,
  Settings,
  PanelLeftOpen,
  PanelLeftClose
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { supabase } from "@/utils/supabase";
import { Separator } from "@/components/ui/separator";
import { useTheme } from '../../contexts/ThemeContext';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import PropTypes from 'prop-types';
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import CyberCursorEffect from "@/components/ui/CyberCursorEffect";

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

const CustomerTickets = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = location.state?.userData;
  const { isDarkMode, loadUserTheme } = useTheme();

  const [activeTickets, setActiveTickets] = useState([]);
  const [inProgressTickets, setInProgressTickets] = useState([]);
  const [resolvedTickets, setResolvedTickets] = useState([]);
  const [rejectedTickets, setRejectedTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResolvedTicket, setSelectedResolvedTicket] = useState('');
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [isSubmitting] = useState(false);
  const [selectedRejectedTicket, setSelectedRejectedTicket] = useState(null);
  const [selectedInProgressTicket, setSelectedInProgressTicket] = useState(null);
  const [agentProfiles, setAgentProfiles] = useState({});
  const [activeItem, setActiveItem] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [setActiveView] = useState('home');
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [ticketData, setTicketData] = useState({
    type: '',
    priority: 'medium',
    description: ''
  });


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
                     
      setTicketData({
        type: '',
        priority: 'medium',
        description: ''
      });
      
      setTimeout(() => window.location.href = '/customertickets', 2000);
      
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

  // Modified fetchTickets function to be reusable
  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: tickets, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("user_id", userData.id);

      if (error) throw error;

      // Get unique agent IDs from resolved tickets
      const agentIds = [...new Set(
        tickets
          .filter(ticket => ticket.resolved_by)
          .map(ticket => ticket.resolved_by)
      )];

      // Fetch agent profiles if there are any agent IDs
      if (agentIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, fullname")
          .in("id", agentIds);

        if (profilesError) throw profilesError;

        const profileMap = profiles.reduce((acc, profile) => ({
          ...acc,
          [profile.id]: profile.fullname
        }), {});

        setAgentProfiles(profileMap);
      }

      // Sort tickets into their respective categories
      const active = tickets.filter((ticket) => ticket.status === "active");
      const inProgress = tickets.filter((ticket) => ticket.status === "in_progress");
      const resolved = tickets.filter((ticket) => ticket.status === "resolved");
      const rejected = tickets.filter((ticket) => ticket.status === "rejected");

      setActiveTickets(active);
      setInProgressTickets(inProgress);
      setResolvedTickets(resolved);
      setRejectedTickets(rejected);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userData?.id]);

  useEffect(() => {
    if (!userData?.id) return;
    loadUserTheme(userData.id);
    fetchTickets();
  }, [userData?.id, loadUserTheme, fetchTickets]);

  // Updated menu items for creator dashboard
  const menuItems = [
    {
      title: 'Home',
      icon: Home,
      view: 'home',
      onClick: () => navigate('/customerdashboard', { state: { userData } })
    },
    {
      title: 'Messages',
      icon: MessageSquare,
      view: 'tickets',
      onClick: () => navigate('/customertickets', { state: { userData } })
    },
    {
      title: 'Profile',
      icon: User,
      view: 'profile',
      onClick: () => navigate('/profile', { state: { userData } })
    },
    {
      title: 'Settings',
      icon: Settings,
      view: 'settings',
      onClick: () => navigate('/settings', { state: { userData } })
    }    
  ];

  const SidebarContent = () => (
    <div 
      className={`flex flex-col h-full bg-purple-50/80 dark:bg-purple-950 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="p-3 border-b border-purple-100 dark:border-purple-900/50 flex items-center justify-between">
        <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
          {!isCollapsed && <span className="text-xl font-semibold dark:text-white">Menu</span>}
          <div className="p-2 hover:bg-purple-100/80 dark:hover:bg-purple-900/50 rounded-lg">
            {isCollapsed ? 
              <PanelLeftOpen className="h-6 w-6 dark:text-white" /> : 
              <PanelLeftClose className="h-6 w-6 dark:text-white" />
            }
          </div>
        </div>
      </div>
  
      <nav className="flex-1 overflow-y-auto p-4">
        {menuItems.map((item, index) => (
          <MenuItem key={index} item={item} index={index} />
        ))}
      </nav>
  
      <div className="border-t border-purple-100 dark:border-purple-900/50 p-4 mt-auto">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {userData?.avatar_url ? (
              <img 
                src={`${userData.avatar_url}`}
                alt={userData.fullname}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `/avatars/${userData.avatar_url}`;
                }}
              />
            ) : (
              <img 
                src="/avatars/user.png"
                alt="Default User"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="font-medium truncate dark:text-white">{userData.fullname}</p>
              <p className="text-sm text-purple-600 dark:text-purple-300 truncate">{userData.email}</p>
              {userData.department && (
                <p className="text-xs text-purple-500 dark:text-purple-400 truncate">{userData.department}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  const MenuItem = ({ item, index }) => (
    <div className="mb-2">
      <button 
        onClick={() => {
          if (item.onClick) {
            item.onClick();
          } else {
            setActiveView(item.view);
            setActiveItem(activeItem === index ? null : index);
          }
        }}
        className={`flex items-center w-full p-3 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-900 dark:text-purple-100 transition-colors duration-200 ${
          isCollapsed ? 'justify-center' : ''
        }`}
        title={isCollapsed ? item.title : ''}
      >
        <item.icon className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
        {!isCollapsed && <span className="text-sm font-medium">{item.title}</span>}
      </button>
    </div>
  );

  MenuItem.propTypes = {
    item: PropTypes.shape({
      title: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
      view: PropTypes.string.isRequired,
      onClick: PropTypes.func,
    }).isRequired,
    index: PropTypes.number.isRequired,
  };

  const getStatusColor = (status) => {
    const colors = {
      active: isDarkMode 
        ? "bg-blue-500/20 text-blue-400 border-blue-800"
        : "bg-blue-500/10 text-blue-500 border-blue-200",
      in_progress: isDarkMode
        ? "bg-yellow-500/20 text-yellow-400 border-yellow-800"
        : "bg-yellow-500/10 text-yellow-600 border-yellow-200",
      resolved: isDarkMode
        ? "bg-green-500/20 text-green-400 border-green-800"
        : "bg-green-500/10 text-green-600 border-green-200",
      rejected: isDarkMode
        ? "bg-red-500/20 text-red-400 border-red-800"
        : "bg-red-500/10 text-red-500 border-red-200"
    };
    return colors[status] || (isDarkMode 
      ? "bg-gray-500/20 text-gray-400 border-gray-800"
      : "bg-gray-500/10 text-gray-600 border-gray-200");
  };

  const getPriorityColor = (status) => {
    const colors = {
      high: isDarkMode
        ? "bg-red-500/20 text-red-400 border-red-800"
        : "bg-red-500/10 text-red-500 border-red-200",
      medium: isDarkMode
        ? "bg-yellow-500/20 text-yellow-400 border-yellow-800"
        : "bg-yellow-500/10 text-yellow-600 border-yellow-200",
      low: isDarkMode
        ? "bg-green-500/20 text-green-400 border-green-800"
        : "bg-green-500/10 text-green-600 border-green-200"
    };
    return colors[status] || (isDarkMode
      ? "bg-gray-500/20 text-gray-400 border-gray-800"
      : "bg-gray-500/10 text-gray-600 border-gray-200");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderTicketCard = (ticket) => (
    <Card 
      key={ticket.id} 
      className={`group transition-all duration-200 hover:shadow-md border-l-4 ${
        isDarkMode ? 'bg-gray-800 hover:bg-gray-800/80' : 'bg-white hover:bg-gray-50'
      }`}
      style={{
        borderLeftColor: ticket.priority === 'high' ? '#ef4444' : 
                        ticket.priority === 'medium' ? '#eab308' : '#22c55e'
      }}
      onClick={() => {
        console.log('Clicked on ticket:', ticket);
        if (ticket.status === 'resolved') {
          console.log('Setting selectedResolvedTicket to:', ticket);
          setSelectedResolvedTicket(ticket);
        } else if (ticket.status === 'in_progress') {
          console.log('Setting selectedInProgressTicket to:', ticket);
          setSelectedInProgressTicket(ticket);
        } else if (ticket.status === 'rejected') {
          console.log('Setting selectedRejectedTicket to:', ticket);
          setSelectedRejectedTicket(ticket);
        }
      }}
    >
      {/* Existing ticket card content remains the same */}
      <CardContent className="pt-6">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold text-lg group-hover:text-blue-500 transition-colors ${
                isDarkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {ticket.issue_type}
              </h3>
            </div>
            <div className={`flex items-center gap-3 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className="flex items-center gap-1">
                <MessageSquare size={14} />
                <span>#{ticket.id}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>Created {formatDate(ticket.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Timer size={14} />
                <span>Updated {formatDate(ticket.last_update)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${getStatusColor(ticket.status)} capitalize`}>
              {ticket.status.replace('_', ' ')}
            </Badge>
            <Badge variant="outline" className={`${getPriorityColor(ticket.priority)} capitalize`}>
              {ticket.priority}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderEmptyState = (message) => (
    <Card className={isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'}>
      <CardContent className="py-12 text-center">
        <CircleSlash className={`mx-auto h-12 w-12 ${
          isDarkMode ? 'text-gray-600' : 'text-gray-400'
        } mb-4`} />
        <h3 className={`text-lg font-medium mb-1 ${
          isDarkMode ? 'text-gray-100' : 'text-gray-900'
        }`}>
          No tickets found
        </h3>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
          {message}
        </p>
      </CardContent>
    </Card>
  );

  // Move PropTypes outside the component
  const FeedbackDialog = ({ 
    isOpen, 
    onClose,
    isDarkMode
  }) => {
    const [feedback, setFeedback] = useState('');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    const handleClose = () => {
      setFeedback('');
      setError(null);
      onClose();
    };
  
    const handleFeedbackSubmit = async () => {
      console.log('Feedback Submission Started', {
        ticketId: selectedResolvedTicket?.id,
        feedbackLength: feedback.trim().length,
        userData: userData // Log user data to ensure correct context
      });
    
      if (!feedback.trim()) {
        toast({
          variant: "destructive",
          title: "Submission blocked",
          description: "Please enter your feedback before submitting."
        });
        return;
      }
    
      if (!selectedResolvedTicket?.id) {
        console.error('No ticket selected for feedback');
         toast({
          variant: "destructive",
          title: "Error",
          description: "No ticket selected. Please try again."
        });
        return;
      }
    
      setIsSubmitting(true);
      setError(null);
    
      try {
        
        console.log('Current User Context:', {
          userId: userData.id,
          ticketUserId: selectedResolvedTicket.user_id
        });

        const { data, error } = await supabase
          .from('tickets')
          .update({ 
            feedback: feedback.trim(),
            last_update: new Date().toISOString()
          })
          .eq('id', selectedResolvedTicket.id)
          .single(); // Use .single() to get a single record
    
        console.log('Supabase Update Detailed Response:', {
          data,
          error,
          ticketId: selectedResolvedTicket.id,
          feedbackContent: feedback.trim()
        });
    
        if (error) {
          console.error('Supabase Update Error Details:', {
            message: error.message,
            details: error.details,
            code: error.code
          });
          throw error;
        }
    
        toast({
          title: "Success",
          description: "Feedback submitted successfully!",
          variant: "default"
        });
    
        // Reset state
        setShowFeedbackDialog(false);
        setSelectedResolvedTicket(null);
        setFeedback(''); // Reset feedback input
        
        // Optional: Refresh tickets
        await fetchTickets();
      } catch (error) {
        console.error('Comprehensive Feedback Submission Error:', error);
        
        toast({
          variant: "destructive",
          title: "Feedback Submission Failed",
          description: error.message || "An unexpected error occurred"
        });
      } finally {
        setIsSubmitting(false);
      }
    };
  
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent 
          className={`w-full max-w-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
        >
          <DialogHeader>
            <DialogTitle className={isDarkMode ? 'text-gray-100' : ''}>
              Share Your Feedback
            </DialogTitle>
            <DialogDescription className={isDarkMode ? 'text-gray-400' : ''}>
              Help us improve our support by sharing your experience
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-2 my-4">
            <label 
              htmlFor="feedback" 
              className={`font-medium ${isDarkMode ? 'text-gray-200' : ''}`}
            >
              Your Feedback
            </label>
            <Textarea
              id="feedback"
              placeholder="Please share your feedback about the support you received..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className={`min-h-[128px] ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                  : 'bg-white'
              }`}
              disabled={isSubmitting}
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button"
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
              className={isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : ''
              }
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleFeedbackSubmit}
              disabled={isSubmitting || !feedback.trim()}
              className={`${
                isDarkMode 
                  ? 'bg-green-600 text-white hover:bg-green-500' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  FeedbackDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    isDarkMode: PropTypes.bool.isRequired
  };

  // Add the Resolved Ticket Dialog
  const ResolvedTicketDialog = () => {
    
    const [hasFeedback, setHasFeedback] = useState(false);
    
    useEffect(() => {
      const checkExistingFeedback = async () => {
        if (!selectedResolvedTicket?.id) return;
    
        try {
          const { data, error } = await supabase
            .from('tickets')
            .select('feedback')
            .eq('id', selectedResolvedTicket.id)
            .single();
    
          if (error) throw error;
          if (data?.feedback) {
          setHasFeedback(true);
          }
        } catch (error) {
          console.error('Error checking feedback:', error);
          toast({
            variant: "destructive",
            title: "Failed to load existing feedback",
            description: "Please wait few seconds and try again."
          });
          setSelectedResolvedTicket(null);
        }
      };
  
      if (selectedResolvedTicket) {
        checkExistingFeedback();
      }
    },[]);

    if (hasFeedback) {
      return (
        <Dialog open={!!selectedResolvedTicket}
        onOpenChange={() => setSelectedResolvedTicket(null)}>
          <DialogContent 
            className={`w-full max-w-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
          >
            <DialogHeader>
              <DialogTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : ''}`}>
                <CheckCircle className="text-green-500" />
                Thank You for Your Feedback
              </DialogTitle>
              <DialogDescription className={isDarkMode ? 'text-gray-400' : ''}>
                You have already submitted feedback for this ticket
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                onClick={() => setSelectedResolvedTicket(null)}
                className={isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : ''}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }

    return(
    <Dialog 
      open={!!selectedResolvedTicket}
      onOpenChange={() => setSelectedResolvedTicket(null)}
    >
      <DialogContent 
        className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}
        // Remove aria-hidden and data-aria-hidden attributes
        // Add onInteractOutside to handle clicks outside the dialog
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className={isDarkMode ? 'text-gray-100' : ''}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-green-500" />
              Ticket Resolution Details
            </div>
          </DialogTitle>
          <DialogDescription className={isDarkMode ? 'text-gray-400' : ''}>
            Ticket #{selectedResolvedTicket?.id} - {selectedResolvedTicket?.issue_type}
          </DialogDescription>
        </DialogHeader>
        
        <div className={`space-y-4 p-4 rounded-lg ${
          isDarkMode 
            ? 'bg-gray-700/50 text-gray-200' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          <div>
            <h3 className="font-semibold mb-2">Resolution Note</h3>
            <p className="text-sm">
              {selectedResolvedTicket?.resolution_note || 'No resolution note available.'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Resolved By</h3>
              <p className="text-sm">
                {selectedResolvedTicket?.resolved_by 
                  ? agentProfiles[selectedResolvedTicket.resolved_by] || 'Loading...'
                  : 'Unknown'
                }
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Resolution Time</h3>
              <p className="text-sm">
                {selectedResolvedTicket?.resolved_at 
                  ? new Date(selectedResolvedTicket.resolved_at).toLocaleString()
                  : 'Not available'}
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setSelectedResolvedTicket(null)}
            className={isDarkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : ''
            }
          >
            Close
          </Button>
          <Button 
            onClick={() => {
              setShowFeedbackDialog(true);
            }}
            disabled={isSubmitting}
            className={`${
              isDarkMode 
                ? 'bg-green-600 text-white hover:bg-green-500' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            Provide Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

  const InProgressDialog = () => (
    <Dialog 
    open={!!selectedInProgressTicket} 
    onOpenChange={() => setSelectedInProgressTicket(null)}
  >
    <DialogContent className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
      <DialogHeader>
        <DialogTitle className={isDarkMode ? 'text-gray-100' : ''}>
          <div className="flex items-center gap-2">
            <MessageCircle className="text-yellow-500" />
            Agent Waiting for Your Response
          </div>
        </DialogTitle>
        <DialogDescription className={isDarkMode ? 'text-gray-400' : ''}>
          Ticket #{selectedInProgressTicket?.id} - {selectedInProgressTicket?.issue_type}
        </DialogDescription>
      </DialogHeader>
      
      <div className={`space-y-4 p-4 rounded-lg ${
        isDarkMode 
          ? 'bg-gray-700/50 text-gray-200' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        <div>
          <h3 className="font-semibold mb-2">Important Notice</h3>
          <p className="text-sm">
            Your support agent is waiting for you to start the conversation. 
            Please initiate the chat within the next 5 minutes to prevent ticket cancellation.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Ticket Details</h3>
          <p className="text-sm">
            <strong>Description:</strong> {selectedInProgressTicket?.description || 'No description available.'}
          </p>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={() => setSelectedInProgressTicket(null)}
          className={isDarkMode 
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
            : ''
          }
        >
          Cancel
        </Button>
        <Button 
          onClick={() => {
            // Navigate to ticket chat interface with complete ticket data
            navigate('/customerrealtimechat', { 
              state: { 
                ticketId: selectedInProgressTicket.id,
                agentId: selectedInProgressTicket.agent_id,
                userData: userData,
                ticketData: selectedInProgressTicket // Pass the complete ticket data
              } 
            });
          }}
          className={`${
            isDarkMode 
              ? 'bg-yellow-600 text-white hover:bg-yellow-500' 
              : 'bg-yellow-500 text-white hover:bg-yellow-600'
          }`}
        >
          Start Conversation
        </Button>
      </div>
    </DialogContent>
  </Dialog>
  );

  const RejectionDialog = () => (
  <Dialog 
        open={!!selectedRejectedTicket} 
        onOpenChange={() => setSelectedRejectedTicket(null)}
      >
        <DialogContent className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
          <DialogHeader>
            <DialogTitle className={isDarkMode ? 'text-gray-100' : ''}>
              <div className="flex items-center gap-2">
                <XCircle className="text-red-500" />
                Ticket Rejection Details
              </div>
            </DialogTitle>
            <DialogDescription className={isDarkMode ? 'text-gray-400' : ''}>
              Ticket #{selectedRejectedTicket?.id} - {selectedRejectedTicket?.issue_type}
            </DialogDescription>
          </DialogHeader>
          
          <div className={`space-y-4 p-4 rounded-lg ${
            isDarkMode 
              ? 'bg-gray-700/50 text-gray-200' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm">
                {selectedRejectedTicket?.description || 'No description available.'}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Rejection Reason</h3>
              <p className="text-sm">
                {selectedRejectedTicket?.rejection_reason || 'No specific reason provided.'}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => setSelectedRejectedTicket(null)}
              className={isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : ''
              }
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
  );

  const filteredActiveTickets = activeTickets.filter((ticket) =>
    ticket.issue_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInProgressTickets = inProgressTickets.filter((ticket) =>
    ticket.issue_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredResolvedTickets = resolvedTickets.filter((ticket) =>
    ticket.issue_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRejectedTickets = rejectedTickets.filter((ticket) =>
    ticket.issue_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!userData) {
    return (
      <div className={`min-h-screen flex justify-center items-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <Card className={isDarkMode ? 'bg-gray-800 w-96' : 'w-96'}>
          <CardContent className="py-6">
            <CircleSlash className={`mx-auto h-12 w-12 ${
              isDarkMode ? 'text-gray-600' : 'text-gray-400'
            } mb-4`} />
            <h3 className={`text-lg font-medium mb-2 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              Authentication Required
            </h3>
            <p className={`mb-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Please log in to view your tickets
            </p>
            <Button onClick={() => window.history.push('/auth')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex justify-center ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <BackgroundSVG className="z-0 "/>
      <CyberCursorEffect />
      <aside 
        className={`hidden md:block fixed left-0 top-0 h-full border-r border-purple-100 dark:border-purple-900/50 shrink-0 bg-purple-50/80 dark:bg-purple-950/30 z-30 transition-all duration-600 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <SidebarContent />
      </aside>
      <Toaster />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        isCollapsed ? 'md:ml-20' : 'md:ml-64'
      }`}>
        <div className={`${isCollapsed ? 'w-[1024px]' : 'w-[896px]'} shadow-xl rounded-lg my-8 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'} ${isCollapsed ? 'left-20' : 'left-64'} pt-8 mb-0`}>
          <div className={`p-6 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-100'
          }`}>
          <div className="flex items-center justify-between">
            <div className="flex flex-col flex-grow">
              <h1 className={` flex text-2xl font-bold ${
                isDarkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>
                TicketZone
              </h1>
            </div>
            
            <Button 
              className={`rounded-xl px-6 py-5 transform transition-all duration-300 hover:scale-105 ${
                isDarkMode
                  ? 'from-teal-400 to-emerald-500'
                  : 'from-teal-500 to-emerald-600'
              } bg-gradient-to-br text-white shadow-lg hover:shadow-xl`}
              onClick={() => setShowTicketDialog(true)}
            >
              Create Ticket
            </Button>
          </div>
        </div>

        <div className={`p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <Input
              className={`pl-10 ${
                isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : ''
              }`}
              placeholder="Search tickets by issue type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50/80'}>
              <TabsTrigger value="active" className="gap-2">
                Tickets Booked
                {activeTickets.length > 0 && (
                  <Badge variant="secondary">{activeTickets.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="gap-2">
                In Progress
                {inProgressTickets.length > 0 && (
                  <Badge variant="secondary">{inProgressTickets.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="resolved" className="gap-2">
                Resolved
                {resolvedTickets.length > 0 && (
                  <Badge variant="secondary">{resolvedTickets.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="rejected" className="gap-2">
                Rejected
                {rejectedTickets.length > 0 && (
                  <Badge variant="secondary">{rejectedTickets.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className={`animate-spin rounded-full h-8 w-8 border-b-2 mx-auto ${
                    isDarkMode ? 'border-gray-400' : 'border-gray-900'
                  }`}></div>
                  <p className={isDarkMode ? 'mt-4 text-gray-400' : 'mt-4 text-gray-500'}>
                    Loading tickets...
                  </p>
                </div>
              ) : filteredActiveTickets.length > 0 ? (
                filteredActiveTickets.map(renderTicketCard)
              ) : (
                renderEmptyState(
                  searchTerm
                    ? "No active tickets match your search"
                    : "You don't have any active tickets"
                )
              )}
            </TabsContent>

            <TabsContent value="in_progress" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className={`animate-spin rounded-full h-8 w-8 border-b-2 mx-auto ${
                    isDarkMode ? 'border-gray-400' : 'border-gray-900'
                  }`}></div>
                  <p className={isDarkMode ? 'mt-4 text-gray-400' : 'mt-4 text-gray-500'}>
                    Loading tickets...
                  </p>
                </div>
              ) : filteredInProgressTickets.length > 0 ? (
                filteredInProgressTickets.map(renderTicketCard)
              ) : (
                renderEmptyState(
                  searchTerm
                    ? "No in-progress tickets match your search"
                    : "You don't have any in-progress tickets"
                )
              )}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className={`animate-spin rounded-full h-8 w-8 border-b-2 mx-auto ${
                    isDarkMode ? 'border-gray-400' : 'border-gray-900'
                  }`}></div>
                  <p className={isDarkMode ? 'mt-4 text-gray-400' : 'mt-4 text-gray-500'}>
                    Loading tickets...
                  </p>
                </div>
              ) : filteredResolvedTickets.length > 0 ? (
                filteredResolvedTickets.map(renderTicketCard)
              ) : (
                renderEmptyState(
                  searchTerm
                    ? "No resolved tickets match your search"
                    : "You don't have any resolved tickets"
                )
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className={`animate-spin rounded-full h-8 w-8 border-b-2 mx-auto ${
                    isDarkMode ? 'border-gray-400' : 'border-gray-900'
                  }`}></div>
                  <p className={isDarkMode ? 'mt-4 text-gray-400' : 'mt-4 text-gray-500'
                  }>
                    Loading tickets...
                  </p>
                </div>
              ) : filteredRejectedTickets.length > 0 ? (
                filteredRejectedTickets.map(renderTicketCard)
              ) : (
                renderEmptyState(
                  searchTerm
                    ? "No rejected tickets match your search"
                    : "You don't have any rejected tickets"
                )
              )}
            </TabsContent>
          </Tabs>
          </div>
        </div>
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

      <RejectionDialog />
      <InProgressDialog />
      <ResolvedTicketDialog />
      <FeedbackDialog 
        isOpen={showFeedbackDialog}
        onClose={() => {
          setShowFeedbackDialog(false);
        }}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default CustomerTickets;