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
import SidebarContent from '@/components/layout/Sidebar/Sidebar';
import ActiveTicketDialog from './ActiveTicketDialog';
import { 
  CircleSlash, 
  Search, 
  Timer,
  Clock,
  XCircle,
  MessageCircle,
  CheckCircle2,
  CheckCircle,
  Paintbrush,
  Briefcase,
  Award,
  Rocket,
  Menu
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
  const [ setIsCollapsed] = useState(true);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [selectedActiveTicket, setSelectedActiveTicket] = useState(null);
  const [showActiveTicketDialog, setShowActiveTicketDialog] = useState(false);
  const [uploading, setUploading] = useState(false);  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  
      const { error } = await supabase
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
      let errorMessage = 'Failed to create proposal. ';
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

  // New method to handle ticket deletion from active tickets
  const handleActiveTicketDeleted = (deletedTicketId) => {
    setActiveTickets(prev => prev.filter(ticket => ticket.id !== deletedTicketId));
  };

  // New method to handle ticket update for active tickets
  const handleActiveTicketUpdated = (updatedTicket) => {
    setActiveTickets(prev => 
      prev.map(ticket => 
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      )
    );
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
      const active = tickets.filter(
        (ticket) => 
          ticket.status === "active" &&
          ticket.user_id === userData.id
        );
      const inProgress = tickets.filter(
        (ticket) => 
          ticket.status === "in_progress" && 
          ticket.user_id === userData.id
      );
      const resolved = tickets.filter(
        (ticket) => 
          ticket.status === "resolved" && 
          ticket.user_id === userData.id
      );
      const rejected = tickets.filter(
        (ticket) => 
          ticket.status === "rejected" && 
          ticket.user_id === userData.id
      );

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

    toast({
      title: "Explore Your Proposals",
      description: "Click on any proposal card to view details and take actions!",
      variant: 'default',
          className: isDarkMode 
            ? 'bg-purple-900 border-purple-700 text-purple-100' 
            : 'bg-purple-100 border-purple-300 text-purple-700'
    });
    
    if (!userData?.id) return;
    loadUserTheme(userData.id);
    fetchTickets();
  }, [userData?.id, loadUserTheme, fetchTickets]);

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
      className={`
        group transition-all duration-300 ease-in-out 
        transform hover:-translate-y-1 hover:scale-[1.02] 
        border-l-4 shadow-sm hover:shadow-xl
        ${isDarkMode 
          ? 'bg-gray-800 hover:bg-violet-900/20' 
          : 'bg-white hover:bg-violet-50'}
      `}
      style={{
        borderLeftColor: 
          ticket.priority === 'high' ? '#9333ea' : 
          ticket.priority === 'medium' ? '#7c3aed' : 
          '#6d28d9'
      }}
      onClick={() => {
        if (ticket.status === 'active') {
          setSelectedActiveTicket(ticket);
          setShowActiveTicketDialog(true);        
        } else if (ticket.status === 'resolved') {
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
              {ticket.issue_type === 'easy' && (
                <Award className="h-5 w-5 text-violet-500 group-hover:text-violet-600 transition-colors" />
              )}
              {ticket.issue_type === 'medium' && (
                <Briefcase className="h-5 w-5 text-violet-500 group-hover:text-violet-600 transition-colors" />
              )}
              {ticket.issue_type === 'high' && (
                <Rocket className="h-5 w-5 text-violet-500 group-hover:text-violet-600 transition-colors" />
              )}
              <h3 className={`
                font-semibold text-lg 
                group-hover:text-violet-600 
                transition-colors 
                ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}
              `}>
                {ticket.issue_type}
              </h3>
            </div>

            <div className={`
              flex items-center gap-3 text-sm 
              ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}
            `}>
              <div className="flex items-center gap-1">
                <Paintbrush size={14} />
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
            <Badge 
              variant="outline" 
              className={`
                ${getStatusColor(ticket.status)} 
                capitalize 
                group-hover:bg-violet-100 
                group-hover:text-violet-700 
                transition-colors
              `}
            >
              {ticket.status === 'active' ? 'New Proposal' :
               ticket.status === 'in_progress' ? 'Under Review' :
               ticket.status === 'resolved' ? 'Accepted' :
               'Declined'}
            </Badge>
            <Badge 
              variant="outline" 
              className={`
                ${getPriorityColor(ticket.priority)} 
                capitalize 
                group-hover:bg-violet-100 
                group-hover:text-violet-700 
                transition-colors
              `}
            >
              {ticket.priority === 'high' ? 'Rush' :
               ticket.priority === 'medium' ? 'Standard' :
               'Flexible'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const updateTicketStatus = async () => {
    if (!selectedRejectedTicket) return;

    try {
      // Prepare update object to change status back to active
      const updateData = { 
        status: "active", 
        last_update: new Date().toISOString()
      };

      // Perform the update
      const { error } = await supabase
        .from("tickets")
        .update(updateData)
        .eq("id", selectedRejectedTicket.id)
        .select();

      if (error) {
        console.error("Error updating proposal status:", error);
        return;
      }

      // Refresh tickets
      const { data: tickets, fetchError } = await supabase
        .from("tickets")
        .select("*");

      if (fetchError) {
        console.error("Error refetching tickets:", fetchError);
        return;
      }

      // Update ticket lists
      setActiveTickets(tickets.filter((ticket) => ticket.status === "active"));
      setRejectedTickets(tickets.filter((ticket) => ticket.status === "rejected"));

      // Reset states
      setSelectedRejectedTicket(null);

    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const renderEmptyState = (message) => (
    <Card className={isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'}>
      <CardContent className="py-12 text-center">
        <CircleSlash className={`mx-auto h-12 w-12 ${
          isDarkMode ? 'text-gray-600' : 'text-gray-400'
        } mb-4`} />
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
      console.log('Proposal Suggestion Submission Started', {
        ticketId: selectedResolvedTicket?.id,
        feedbackLength: feedback.trim().length,
        userData: userData // Log user data to ensure correct context
      });
    
      if (!feedback.trim()) {
        toast({
          variant: "destructive",
          title: "Submission blocked",
          description: "Please enter your suggestions before submitting."
        });
        return;
      }
    
      if (!selectedResolvedTicket?.id) {
        console.error('No proposal selected for suggestions');
         toast({
          variant: "destructive",
          title: "Error",
          description: "No proposal selected. Please try again."
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
          description: "Suggestion submitted successfully!",
          variant: "default"
        });
    
        // Reset state
        setShowFeedbackDialog(false);
        setSelectedResolvedTicket(null);
        setFeedback(''); // Reset feedback input
        
        // Optional: Refresh tickets
        await fetchTickets();
      } catch (error) {
        console.error('Comprehensive Suggestion Submission Error:', error);
        
        toast({
          variant: "destructive",
          title: "Proposal Suggestion Submission Failed",
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
              Provide Suggestions on Your Project Proposal
            </DialogTitle>
            <DialogDescription className={isDarkMode ? 'text-gray-400' : ''}>
              Help the creators to make the dream creation for your proposal by sharing your suggestions
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-2 my-4">
            <label 
              htmlFor="feedback" 
              className={`font-medium ${isDarkMode ? 'text-gray-200' : ''}`}
            >
              Your Suggestion
            </label>
            <Textarea
              id="feedback"
              placeholder="Please share your suggestion about the proposal you agreed upon..."
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
                'Send'
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
                You have already submitted feedback for this project proposal
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
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className={isDarkMode ? 'text-gray-100' : ''}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-green-500" />
              Project Proposal Details
            </div>
          </DialogTitle>
          <DialogDescription className={isDarkMode ? 'text-gray-400' : ''}>
            Proposal #{selectedResolvedTicket?.id} - {selectedResolvedTicket?.issue_type} Project
          </DialogDescription>
        </DialogHeader>
        
        <div className={`space-y-4 p-4 rounded-lg ${
          isDarkMode 
            ? 'bg-gray-700/50 text-gray-200' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          <div>
            <h3 className="font-semibold mb-2">Proposal Collab </h3>
            <p className="text-sm">
              {selectedResolvedTicket?.resolution_note || 'No evaluation notes available.'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Accepted By</h3>
              <p className="text-sm">
                {selectedResolvedTicket?.resolved_by 
                  ? agentProfiles[selectedResolvedTicket.resolved_by] || 'Loading...'
                  : 'Unknown'
                }
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Proposal Success</h3>
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
            Give Final Guidance
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
            Proposal Details
          </div>
        </DialogTitle>
        <DialogDescription className={isDarkMode ? 'text-gray-400' : ''}>
          Proposal #{selectedInProgressTicket?.id} - {selectedInProgressTicket?.issue_type}
        </DialogDescription>
      </DialogHeader>
      
      <div className={`max-h-[400px] overflow-y-auto space-y-4 p-4 rounded-lg ${
        isDarkMode 
          ? 'bg-gray-700/50 text-gray-200' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        <div>
          <h3 className="font-semibold mb-2">Project Overview</h3>
          <p className="text-sm">
            Your proposal has been accepted. Let`s discuss the project details 
            to ensure a smooth collaboration and clear understanding of the work.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Proposal Description</h3>
          <p className="text-sm">
            <strong>Details:</strong> {selectedInProgressTicket?.description || 'No description available.'}
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Next Steps</h3>
          <p className="text-sm">
            Start a conversation to:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Clarify project requirements</li>
              <li>Discuss specific deliverables</li>
              <li>Share additional context</li>
              <li>Align on project timeline</li>
            </ul>
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
          Close
        </Button>
        <Button 
          onClick={() => {
            navigate('/customerchatinterface', { 
              state: { 
                ticketId: selectedInProgressTicket.id,                
                userId: userData.id,
                agentId: selectedInProgressTicket.agent_id,
                ticketData: selectedInProgressTicket
              } 
            });
          }}
          className={`${
            isDarkMode 
              ? 'bg-green-600 text-white hover:bg-green-500' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          Discuss Project Details
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
                Proposal Declined
              </div>
            </DialogTitle>
            <DialogDescription className={isDarkMode ? 'text-gray-400' : ''}>
              Proposal #{selectedRejectedTicket?.id} - {selectedRejectedTicket?.project_type}
            </DialogDescription>
          </DialogHeader>
          
          <div className={`space-y-4 p-4 rounded-lg ${
            isDarkMode 
              ? 'bg-gray-700/50 text-gray-200' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            <div>
              <h3 className="font-semibold mb-2">Proposal Details</h3>
              <p className="text-sm">
                {selectedRejectedTicket?.description || 'No detailed description available.'}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Reason for Decline</h3>
              <p className="text-sm">
                {selectedRejectedTicket?.rejection_reason || 'The creators did not provide a specific reason for the proposal rejection.'}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
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
            <Button 
              variant="secondary"
              onClick={updateTicketStatus}
              className={isDarkMode
                ? 'bg-purple-700 text-purple-100 hover:bg-purple-600'
                : 'bg-purple-500 text-white hover:bg-purple-600'
              }
            >
              Reactivate Proposal
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
    <div className={`min-h-screen flex flex-col sm:flex-row ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <BackgroundSVG className="z-0 "/>
      <CyberCursorEffect />

      {/* Mobile Header with Menu Toggle */}
      <div className="sm:hidden fixed top-0 left-0 right-0 z-50">
        <div className={`flex justify-between items-center p-4 ${
          isDarkMode ? 'bg-violet-900/80' : 'bg-violet-100/80'
        } backdrop-blur-md`}>
          <h1 className={`text-xl font-bold ${
            isDarkMode ? 'text-violet-100' : 'text-violet-900'
          }`}>
            Project Proposals
          </h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className={`h-6 w-6 ${
              isDarkMode ? 'text-violet-200' : 'text-violet-700'
            }`} />
          </Button>
        </div>
      </div>
      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div 
          className="sm:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className={`w-64 h-full ${
              isDarkMode ? 'bg-violet-950' : 'bg-violet-100'
            } shadow-lg`}
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent 
              userId={userData.id}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside 
        className={`hidden sm:block fixed left-0 top-0 h-full w-20 border-r border-violet-100 dark:border-violet-900/50 shrink-0 bg-violet-50/80 dark:bg-violet-950/30 z-30 transition-all duration-600 ease-in-out `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <SidebarContent 
          userId={userData.id}
          isDarkMode={isDarkMode}
        />
      </aside>

      <Toaster />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300  mt-16 sm:mt-0`}>
        <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } pt-8 mb-0 rounded-lg shadow-xl`}>
          <div className={`p-4 sm:p-6 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-100'
          }`}>
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col flex-grow">
                <h1 className={`text-2xl font-bold ${
                  isDarkMode ? 'text-violet-200' : 'text-violet-800'
                }`}>
                  Project Proposal
                </h1>
              </div>
              
              <Button 
                className={`w-full sm:w-auto rounded-xl px-6 py-5 transform transition-all duration-300 hover:scale-105 ${
                  isDarkMode
                    ? 'from-violet-500 to-purple-600'
                    : 'from-violet-600 to-purple-700'
                } bg-gradient-to-br text-white shadow-lg hover:shadow-xl`}
                onClick={() => setShowTicketDialog(true)}
              >
                Create Proposal
              </Button>
            </div>
          </div>

          <div className={`p-4 sm:p-6 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-100'
          }`}>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                isDarkMode ? 'text-violet-500' : 'text-violet-400'
              }`} />
              <Input
                className={`pl-10 w-full ${
                  isDarkMode ? 'bg-gray-700 text-violet-100 border-gray-600' : 'border-violet-200'
                }`}
                placeholder="Search proposals by issue type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <Tabs defaultValue="active" className="space-y-6">
              <TabsList className={`flex flex-wrap justify-center ${
                isDarkMode ? 'bg-gray-700/50' : 'bg-violet-50/80'
              }`}>
                <TabsTrigger 
                  value="active" 
                  className={`w-full sm:w-auto flex-1 gap-2 ${
                    isDarkMode 
                      ? 'data-[state=active]:bg-violet-700 data-[state=active]:text-white' 
                      : 'data-[state=active]:bg-violet-200'
                  }`}
                >
                  Proposal Submitted
                  {activeTickets.length > 0 && (
                    <Badge variant="secondary">{activeTickets.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="in_progress" 
                  className={`w-full sm:w-auto flex-1 gap-2 ${
                    isDarkMode 
                      ? 'data-[state=active]:bg-violet-700 data-[state=active]:text-white' 
                      : 'data-[state=active]:bg-violet-200'
                  }`}
                >
                  Under Review
                  {inProgressTickets.length > 0 && (
                    <Badge variant="secondary">{inProgressTickets.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="resolved" 
                  className={`w-full sm:w-auto flex-1 gap-2 ${
                    isDarkMode 
                      ? 'data-[state=active]:bg-violet-700 data-[state=active]:text-white' 
                      : 'data-[state=active]:bg-violet-200'
                  }`}
                >
                  Accepted
                  {resolvedTickets.length > 0 && (
                    <Badge variant="secondary">{resolvedTickets.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="rejected" 
                  className={`w-full sm:w-auto flex-1 gap-2 ${
                    isDarkMode 
                      ? 'data-[state=active]:bg-violet-700 data-[state=active]:text-white' 
                      : 'data-[state=active]:bg-violet-200'
                  }`}
                >
                  Declined
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
                    Loading proposals...
                  </p>
                </div>
              ) : filteredActiveTickets.length > 0 ? (
                filteredActiveTickets.map(renderTicketCard)
              ) : (
                renderEmptyState(
                  searchTerm
                    ? "No active proposals match your search"
                    : "You don't have any active proposals"
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
                    Loading proposals...
                  </p>
                </div>
              ) : filteredInProgressTickets.length > 0 ? (
                filteredInProgressTickets.map(renderTicketCard)
              ) : (
                renderEmptyState(
                  searchTerm
                    ? "No in-creation proposals match your search"
                    : "You don't have any in-progress proposals"
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
                    Loading proposals...
                  </p>
                </div>
              ) : filteredResolvedTickets.length > 0 ? (
                filteredResolvedTickets.map(renderTicketCard)
              ) : (
                renderEmptyState(
                  searchTerm
                    ? "No resolved proposals match your search"
                    : "You don't have any resolved proposals"
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
                    Loading proposals...
                  </p>
                </div>
              ) : filteredRejectedTickets.length > 0 ? (
                filteredRejectedTickets.map(renderTicketCard)
              ) : (
                renderEmptyState(
                  searchTerm
                    ? "No rejected proposals match your search"
                    : "You don't have any rejected proposals"
                )
              )}
            </TabsContent>
          </Tabs>
          </div>
        </div>
      </div>
      
      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent className={`sm:max-w-[500px] rounded-2xl max-h-[90vh] flex flex-col overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <DialogHeader className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} py-4 px-6`}>
            <DialogTitle className={`text-2xl ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Submit Project Proposal</DialogTitle>
            <DialogDescription className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Fill out the form below to submit a new project proposal. Our team will review and match you with potential creators.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="issue-type" className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Intensity
                </label>
                <div className="max-h-[300px] overflow-y-auto">
                <Select
                  value={ticketData.type}
                  onValueChange={(value) => setTicketData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className={`${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'} rounded-lg`}>
                    <SelectValue placeholder="Select required speciality" />
                  </SelectTrigger>
                    <SelectContent className="max-h-[280px] overflow-y-auto">
                      <SelectItem value="3D Modeling">3D Modeling</SelectItem>
                      <SelectItem value="Aerial Engineering">Aerial Engineering</SelectItem>
                      <SelectItem value="Aerospace Engineering">Aerospace Engineering</SelectItem>
                      <SelectItem value="Aerospace Research">Aerospace Research</SelectItem>
                      <SelectItem value="AR/VR Development">AR/VR Development</SelectItem>
                      <SelectItem value="Artificial Intelligence">Artificial Intelligence</SelectItem>
                      <SelectItem value="Audio Engineering">Audio Engineering</SelectItem>
                      <SelectItem value="Bioinformatics">Bioinformatics</SelectItem>
                      <SelectItem value="Biotechnology">Biotechnology</SelectItem>
                      <SelectItem value="Blockchain Technology">Blockchain Technology</SelectItem>
                      <SelectItem value="Brand Strategy">Brand Strategy</SelectItem>
                      <SelectItem value="Cinematography">Cinematography</SelectItem>
                      <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                      <SelectItem value="Cloud Computing">Cloud Computing</SelectItem>
                      <SelectItem value="Cloud Solutions">Cloud Solutions</SelectItem>
                      <SelectItem value="Composition">Composition</SelectItem>
                      <SelectItem value="Content Strategy">Content Strategy</SelectItem>
                      <SelectItem value="Copywriting">Copywriting</SelectItem>
                      <SelectItem value="Creative Direction">Creative Direction</SelectItem>
                      <SelectItem value="Creative Technology">Creative Technology</SelectItem>
                      <SelectItem value="Creative Writing">Creative Writing</SelectItem>
                      <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                      <SelectItem value="DevOps">DevOps</SelectItem>
                      <SelectItem value="Digital Art">Digital Art</SelectItem>
                      <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                      <SelectItem value="Digital Performance">Digital Performance</SelectItem>
                      <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                      <SelectItem value="Environmental Science">Environmental Science</SelectItem>
                      <SelectItem value="Film Production">Film Production</SelectItem>
                      <SelectItem value="Filmmaking">Filmmaking</SelectItem>
                      <SelectItem value="Game Design">Game Design</SelectItem>
                      <SelectItem value="Generative AI">Generative AI</SelectItem>
                      <SelectItem value="Graphic Design">Graphic Design</SelectItem>
                      <SelectItem value="Illustration">Illustration</SelectItem>
                      <SelectItem value="Immersive Experience Design">Immersive Experience Design</SelectItem>
                      <SelectItem value="Industrial Design">Industrial Design</SelectItem>
                      <SelectItem value="Information Security">Information Security</SelectItem>
                      <SelectItem value="Innovation Consulting">Innovation Consulting</SelectItem>
                      <SelectItem value="Interactive Media">Interactive Media</SelectItem>
                      <SelectItem value="IoT Design">IoT Design</SelectItem>
                      <SelectItem value="IT Support">IT Support</SelectItem>
                      <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                      <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                      <SelectItem value="Mobile App Development">Mobile App Development</SelectItem>
                      <SelectItem value="Motion Graphics">Motion Graphics</SelectItem>
                      <SelectItem value="Music Production">Music Production</SelectItem>
                      <SelectItem value="Network Administration">Network Administration</SelectItem>
                      <SelectItem value="Network Engineering">Network Engineering</SelectItem>
                      <SelectItem value="Performance Art">Performance Art</SelectItem>
                      <SelectItem value="Podcasting">Podcasting</SelectItem>
                      <SelectItem value="Product Management">Product Management</SelectItem>
                      <SelectItem value="Quantum Computing">Quantum Computing</SelectItem>
                      <SelectItem value="Quantum Technology">Quantum Technology</SelectItem>
                      <SelectItem value="Robotics Engineering">Robotics Engineering</SelectItem>
                      <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                      <SelectItem value="Sound Design">Sound Design</SelectItem>
                      <SelectItem value="Systems Architecture">Systems Architecture</SelectItem>
                      <SelectItem value="Technical Documentation">Technical Documentation</SelectItem>
                      <SelectItem value="Technical Writing">Technical Writing</SelectItem>
                      <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                      <SelectItem value="Web Design">Web Design</SelectItem>
                      <SelectItem value="Web Development">Web Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>                
              </div>

              <div className="grid gap-2">
                <label className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Urgency
                </label>
                <Select
                  value={ticketData.priority}
                  onValueChange={(value) => setTicketData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger className={`${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'} rounded-lg`}>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-green-500" />
                        <span>Small Project</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <Briefcase size={16} className="text-yellow-500" />
                        <span>Medium Project</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <Rocket size={16} className="text-red-500" />
                        <span>Complex Project</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label htmlFor="description" className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Description
                </label>
                <Textarea
                  id="description"
                  placeholder="Please describe your proposal in detail"
                  value={ticketData.description}
                  onChange={(e) => setTicketData(prev => ({ ...prev, description: e.target.value }))}
                  className={`h-32 rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-200 placeholder-gray-400'
                      : 'bg-white text-gray-800 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className={`sticky bottom-0 left-0 right-0 z-10 py-4 px-6 flex justify-end gap-4 ${
            isDarkMode 
              ? 'bg-gray-800 border-t border-gray-700' 
              : 'bg-white border-t border-gray-200'
          }`}>
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
                  ? 'from-purple-400 to-violet-500'
                  : 'from-purple-500 to-violet-600'
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
                <span>Submit Proposal</span>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ActiveTicketDialog 
        isOpen={showActiveTicketDialog}
        onClose={() => {
          setShowActiveTicketDialog(false);
          setSelectedActiveTicket(null);
        }}
        ticket={selectedActiveTicket}
        isDarkMode={isDarkMode}
        onTicketDeleted={handleActiveTicketDeleted}
        onTicketUpdated={handleActiveTicketUpdated}
      />

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