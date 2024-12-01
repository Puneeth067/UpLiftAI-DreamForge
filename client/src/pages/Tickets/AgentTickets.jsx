import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import TicketDetailsDialog from './TicketDetailsDialog';

import SidebarContent from '@/components/layout/Sidebar/Sidebar';
import { 
  CircleSlash, 
  Search, 
  Clock,
  User,
  Paintbrush,
  Briefcase,
  Award,
  Rocket,
  UserIcon,
  MailIcon
} from "lucide-react";
import { supabase } from "@/utils/supabase";
import { useTheme } from '../../contexts/ThemeContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import LoadingScreen from "@/components/ui/loading";
import CyberCursorEffect from "@/components/ui/CyberCursorEffect";
import { Toaster } from "@/components/ui/toaster";

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

const AgentTickets = () => {
  const location = useLocation();
  const { isDarkMode, loadUserTheme } = useTheme();

  const [openTickets, setOpenTickets] = useState([]);
  const [inProgressTickets, setInProgressTickets] = useState([]);
  const [resolvedTickets, setResolvedTickets] = useState([]);
  const [rejectedTickets, setRejectedTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  const [selectedResolvedTicket, setSelectedResolvedTicket] = useState(null);
  const [isResolvedDialogOpen, setIsResolvedDialogOpen] = useState(false);

  // New state for ticket details dialog
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [userData, setProfileData] = useState(location.state?.userData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New state for in-progress ticket dialog
const [inProgressTicketUser, setInProgressTicketUser] = useState(null);
const [isInProgressDialogOpen, setIsInProgressDialogOpen] = useState(false);

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


// Fetch user details for in-progress ticket
const fetchInProgressTicketUserDetails = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user details:", error);
    return null;
  }

  return data;
};

const handleTicketClick = async (ticket) => {
    if (ticket.status === 'active') {
      // Existing active ticket logic
      setSelectedTicket(ticket);
      const details = await fetchTicketDetails(ticket.id);
      setTicketDetails(details);
      setIsDialogOpen(true);
    } else if (ticket.status === 'in_progress') {
      // Existing in-progress ticket logic
      const userDetails = await fetchInProgressTicketUserDetails(ticket.user_id);
      setInProgressTicketUser(userDetails);
      setSelectedTicket(ticket);
      setIsInProgressDialogOpen(true);
    } else if (ticket.status === 'resolved') {
      // New logic for resolved tickets
      const details = await fetchTicketDetails(ticket.id);
      setSelectedResolvedTicket(details);
      setIsResolvedDialogOpen(true);
    }
  };

  const InProgressTicketDetailsDialog = () => {
    const navigate = useNavigate();
  
    const handleStartChat = () => {
      navigate('/agentchatinterface', { 
        state: {
          ticketId: selectedTicket.id,
          userId: selectedTicket.user_id,
          agentId: userData.id,
          ticketData: selectedTicket
        }
      });
    };
  
    if (!selectedTicket || !inProgressTicketUser) return null;
  
    return (
      <Dialog 
        open={isInProgressDialogOpen} 
        onOpenChange={setIsInProgressDialogOpen}
      >
        <DialogContent className={`
          sm:max-w-[650px] 
          ${isDarkMode 
            ? 'bg-purple-950 border-purple-800 shadow-2xl' 
            : 'bg-purple-50 border-purple-200 shadow-lg'
          } 
          rounded-xl p-6
        `}>
          <DialogHeader className="mb-4">
            <DialogTitle className={`
              text-2xl font-bold tracking-tight 
              ${isDarkMode 
                ? 'text-purple-100' 
                : 'text-purple-800'
              }`}
            >
              Project Proposal #{selectedTicket.id} 
              <span className={`
                ml-3 px-2 py-1 rounded-full text-sm 
                ${isDarkMode 
                  ? 'bg-purple-800 text-purple-200' 
                  : 'bg-purple-200 text-purple-700'
                }`}
              >
                In Discussion
              </span>
            </DialogTitle>
          </DialogHeader>
  
          <div className={`space-y-5 ${isDarkMode ? 'text-purple-200' : 'text-purple-900'}`}>
            <div className="bg-gradient-to-br from-purple-100/50 to-purple-200/30 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-lg border border-purple-200/50 dark:border-purple-700/30">
              <p className="font-semibold text-lg mb-3 text-purple-800 dark:text-purple-200">
                Patron Details
              </p>
              <div className={`
                p-3 rounded-md 
                ${isDarkMode 
                  ? 'bg-purple-900/50 text-purple-100' 
                  : 'bg-white text-purple-800'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <UserIcon className={`w-6 h-6 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`} />
                  <p className="font-medium">
                    {inProgressTicketUser.fullname}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <MailIcon className={`w-6 h-6 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`} />
                  <p>
                    {inProgressTicketUser.email}
                  </p>
                </div>
              </div>
            </div>
  
            <div className="bg-gradient-to-br from-purple-100/50 to-purple-200/30 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-lg border border-purple-200/50 dark:border-purple-700/30">
              <p className="font-semibold text-lg mb-3 text-purple-800 dark:text-purple-200">
                Proposal Overview
              </p>
              <p className={`
                p-3 rounded-md min-h-[100px] 
                ${isDarkMode 
                  ? 'bg-purple-900/50 text-purple-100' 
                  : 'bg-white text-purple-800'
                }`}
              >
                {selectedTicket.description || 'No description provided'}
              </p>
            </div>
          </div>
  
          <DialogFooter className="mt-6 flex justify-end space-x-3">
            <Button 
              variant="outline"
              onClick={() => setIsInProgressDialogOpen(false)}
              className={`
                ${isDarkMode 
                  ? 'text-purple-200 border-purple-700 hover:bg-purple-800' 
                  : 'text-purple-700 border-purple-300 hover:bg-purple-100'
                }`}
            >
              Cancel
            </Button>
            <Button 
              variant="default"
              onClick={handleStartChat}
              className={`
                ${isDarkMode 
                  ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
            >
              Start Discussion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  useEffect(() => {
    if (!userData?.id) return;

    loadUserTheme(userData.id);

    // Fetch profile data from Supabase
    const fetchProfileData = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setProfileData(data);
        } else {
          throw new Error('Profile not found');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();

    async function fetchAllTickets() {
      setIsLoading(true);
      const { data: tickets, error } = await supabase
        .from("tickets")
        .select("*");

      if (error) {
        console.error("Error fetching tickets:", error);
        return;
      }

      const active = tickets.filter((ticket) => ticket.status === "active");
    const inProgress = tickets.filter(
      (ticket) => 
        ticket.status === "in_progress" && 
        ticket.agent_id === userData.id
    );
    const resolved = tickets.filter(
      (ticket) => 
        ticket.status === "resolved" && 
        ticket.agent_id === userData.id
    );
    const rejected = tickets.filter(
      (ticket) => 
        ticket.status === "rejected" && 
        ticket.agent_id === userData.id
    );

      setOpenTickets(active);
      setInProgressTickets(inProgress);
      setResolvedTickets(resolved);
      setRejectedTickets(rejected);
      setIsLoading(false);
    }

    fetchAllTickets();
  }, [userData?.id, loadUserTheme]);

  // Function to fetch ticket details
  const fetchTicketDetails = async (ticketId) => {
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (error) {
      console.error("Error fetching ticket details:", error);
      return null;
    }

    return data;
  };


   // Updated updateTicketStatus method
  const updateTicketStatus = async (status, reason = "") => {
    if (!selectedTicket) return;

    try {
      // Prepare update object
      const updateData = { 
        status: status, 
        last_update: new Date().toISOString()
      };

      // Add agent_id when accepting ticket (status = in_progress)
      if (status === "in_progress") {
        updateData.agent_id = userData.id;
      }

      // Add rejection-specific fields if rejecting
      if (status === "rejected") {
        updateData.rejection_reason = reason.trim();
        updateData.agent_id = userData.id;
      }

      // Perform the update
      const { error } = await supabase
        .from("tickets")
        .update(updateData)
        .eq("id", selectedTicket.id)
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
      setOpenTickets(tickets.filter((ticket) => ticket.status === "active"));
      setInProgressTickets(tickets.filter((ticket) => ticket.status === "in_progress"));
      setResolvedTickets(tickets.filter((ticket) => ticket.status === "resolved"));
      setRejectedTickets(tickets.filter((ticket) => ticket.status === "rejected"));

      // Reset states
      setIsDialogOpen(false);
      setSelectedTicket(null);
      setTicketDetails(null);

    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };


  const getStatusColor = (status) => {
    const colors = {
      active: isDarkMode 
        ? "bg-purple-500/20 text-purple-400 border-purple-800"
        : "bg-purple-500/10 text-purple-500 border-purple-200",
      in_progress: isDarkMode
        ? "bg-blue-500/20 text-blue-400 border-blue-800"
        : "bg-blue-500/10 text-blue-600 border-blue-200",
      resolved: isDarkMode
        ? "bg-green-500/20 text-green-400 border-green-800"
        : "bg-green-500/10 text-green-600 border-green-200",
      rejected: isDarkMode
        ? "bg-red-500/20 text-red-400 border-red-800"
        : "bg-red-500/10 text-red-500 border-red-200"
    };
    return colors[status] || colors.default;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: isDarkMode
        ? "bg-pink-500/20 text-pink-400 border-pink-800"
        : "bg-pink-500/10 text-pink-500 border-pink-200",
      medium: isDarkMode
        ? "bg-violet-500/20 text-violet-400 border-violet-800"
        : "bg-violet-500/10 text-violet-600 border-violet-200",
      low: isDarkMode
        ? "bg-indigo-500/20 text-indigo-400 border-indigo-800"
        : "bg-indigo-500/10 text-indigo-600 border-indigo-200"
    };
    return colors[priority];
  };;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  // Resolved Project Proposal Dialog
const ResolvedTicketDetailsDialog = () => {
  if (!selectedResolvedTicket) return null;

  return (
    <Dialog 
  open={isResolvedDialogOpen} 
  onOpenChange={setIsResolvedDialogOpen}
>
  <DialogContent 
    className={`sm:max-w-[650px] max-h-screen flex flex-col ${
      isDarkMode 
        ? 'bg-purple-950 border-purple-800 shadow-2xl' 
        : 'bg-purple-50 border-purple-200 shadow-lg'
    } rounded-xl p-6`}
  >
    {/* Fixed Header */}
    <DialogHeader className="flex-none">
      <DialogTitle className={`
        text-2xl font-bold tracking-tight 
        ${isDarkMode ? 'text-purple-100' : 'text-purple-800'}
      `}>
        Accepted Project Proposal #{selectedResolvedTicket.id}
      </DialogTitle>
      <DialogDescription className={`
        ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}
      `}>
        Project Proposal Assigned Details
      </DialogDescription>
    </DialogHeader>

    {/* Scrollable Content */}
    <div 
      className={`space-y-5 overflow-y-auto flex-grow ${
        isDarkMode ? 'text-purple-200' : 'text-purple-900'
      }`}
    >
      <div className="bg-gradient-to-br from-purple-100/50 to-purple-200/30 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-lg border border-purple-200/50 dark:border-purple-700/30">
        <p className="font-semibold text-lg mb-3 text-purple-800 dark:text-purple-200">
          Patron Suggestions
        </p>
        <p className={`
          p-3 rounded-md min-h-[100px]
          ${isDarkMode 
            ? 'bg-purple-900/50 text-purple-100' 
            : 'bg-white text-purple-800'
          }`}
        >
          {selectedResolvedTicket.feedback || 'No feedback provided by patron'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-purple-100/50 dark:bg-purple-900/30 p-3 rounded-lg">
          <p className="font-medium text-purple-700 dark:text-purple-300 mb-2">
            Project Category
          </p>
          <p className={isDarkMode ? 'text-purple-200' : 'text-purple-800'}>
            {selectedResolvedTicket.issue_type}
          </p>
        </div>
        <div className="bg-purple-100/50 dark:bg-purple-900/30 p-3 rounded-lg">
          <p className="font-medium text-purple-700 dark:text-purple-300 mb-2">
            Accepted Date
          </p>
          <p className={isDarkMode ? 'text-purple-200' : 'text-purple-800'}>
            {formatDate(selectedResolvedTicket.last_update)}
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-100/50 to-purple-200/30 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-lg border border-purple-200/50 dark:border-purple-700/30">
        <p className="font-semibold text-lg mb-3 text-purple-800 dark:text-purple-200">
          Project Overview
        </p>
        <p className={`
          p-3 rounded-md min-h-[100px]
          ${isDarkMode 
            ? 'bg-purple-900/50 text-purple-100' 
            : 'bg-white text-purple-800'
          }`}
        >
          {selectedResolvedTicket.description || 'No project description provided'}
        </p>
      </div>
    </div>

    {/* Fixed Footer */}
    <DialogFooter className="flex-none mt-6 flex justify-end">
      <Button 
        variant="default"
        onClick={() => setIsResolvedDialogOpen(false)}
        className={`
          ${isDarkMode 
            ? 'bg-purple-600 hover:bg-purple-500 text-white' 
            : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
      >
        Close Project Review
      </Button>
    </DialogFooter>
  </DialogContent>
    </Dialog>
  );
};

  const renderRequestCard = (request) => (
    <Card 
      key={request.id} 
      className={`group transition-all duration-200 hover:shadow-md border-l-4 cursor-pointer ${
        isDarkMode ? 'bg-gray-800 hover:bg-gray-800/80' : 'bg-white hover:bg-gray-50'
      }`}
      style={{
        borderLeftColor: request.priority === 'high' ? '#ec4899' : 
                        request.priority === 'medium' ? '#8b5cf6' : '#6366f1'
      }}
      onClick={() => handleTicketClick(request)}
    >
      <CardContent className="pt-6">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
              {request.issue_type === 'easy' && (
                <Award className="h-5 w-5 text-purple-500" />
              )}
              {request.issue_type === 'medium' && (
                <Briefcase className="h-5 w-5 text-purple-500" />
              )}
              {request.issue_type === 'high' && (
                <Rocket className="h-5 w-5 text-purple-500" />
              )}
              <h3 className={`font-semibold text-lg group-hover:text-purple-500 transition-colors ${
                isDarkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {request.issue_type}
              </h3>
            </div>
            <div className={`flex items-center gap-3 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className="flex items-center gap-1">
                <Paintbrush size={14} />
                <span>Project #{request.id}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>Received {formatDate(request.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <User size={14} />
                <span>Patron ID: {request.user_id}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${getStatusColor(request.status)} capitalize`}>
              {request.status === 'active' ? 'New Proposal' :
               request.status === 'in_progress' ? 'Under Review' :
               request.status === 'resolved' ? 'Accepted' :
               'Declined'}
            </Badge>
            <Badge variant="outline" className={`${getPriorityColor(request.priority)} capitalize`}>
              {request.priority === 'high' ? 'Rush' :
               request.priority === 'medium' ? 'Standard' :
               'Flexible'}
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
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
          {message}
        </p>
      </CardContent>
    </Card>
  );

  const filteredOpenTickets = openTickets.filter((ticket) =>
    ticket.issue_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInProgressTickets = inProgressTickets.filter((ticket) =>
    ticket.issue_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredResolvedTickets = resolvedTickets.filter((ticket) =>
    ticket.issue_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRejectedTickets = rejectedTickets.filter((ticket) => // New filter for rejected tickets
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
              Please log in to view tickets
            </p>
            <Button onClick={() => window.history.push('/auth')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex justify-center ml-20 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    } cursor-none`}>
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
        userId={userData.id}
        isDarkMode={isDarkMode}
        />
      </aside>
      <Toaster />
      <div className={`flex-1 flex flex-col min-w-[1024] transition-all duration-300`}>
        <div className={`min-w-[1024px] shadow-xl rounded-lg my-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} pt-8 mb-0`}>
          <div className={`p-6 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-100'
          }`}>
            <div className="flex items-center gap-4">
              <div className="flex flex-col flex-grow">
                <h1 className={`flex text-2xl font-bold ${
                  isDarkMode ? 'text-fuchsia-50' : 'text-fuchsia-950'
                }`}>
                  Project Proposals
                </h1>                
              </div>
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
              placeholder="Search messages from patrons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="p-6">
            <Tabs defaultValue="active" className="space-y-6">
              <TabsList className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50/80'}>
                <TabsTrigger value="active" className="gap-2">
                  New Proposals
                  {openTickets.length > 0 && (
                    <Badge variant="secondary">{openTickets.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="in_progress" className="gap-2">
                  Under Review
                  {inProgressTickets.length > 0 && (
                    <Badge variant="secondary">{inProgressTickets.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="resolved" className="gap-2">
                  Accepted
                  {resolvedTickets.length > 0 && (
                    <Badge variant="secondary">{resolvedTickets.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="rejected" className="gap-2">
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
                    Loading Proposals...
                  </p>
                </div>
              ) : filteredOpenTickets.length > 0 ? (
                filteredOpenTickets.map(renderRequestCard)
              ) : (
                renderEmptyState(
                  searchTerm
                    ? "No proposals match your search"
                    : "No proposals available"
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
                    Loading Proposals...
                  </p>
                </div>
              ) : filteredInProgressTickets.length > 0 ? (
                filteredInProgressTickets.map(renderRequestCard)
              ) : (
                renderEmptyState(
                  searchTerm
                    ? "No in-progress proposals match your search"
                    : "No proposals in progress"
                )
              )}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className={`animate-spin rounded-full h-8 w-8 border-b-2 mx-auto ${
                    isDarkMode ? 'border-gray-400' : 'border-gray-900'
                  }`}></div>
                  <p className={isDarkMode ? 'mt-4 text-gray-400' : 'mt-4 text-gray-900'}>
                    Loading proposals...
                  </p>
                </div>
              ) : filteredResolvedTickets.length > 0 ? (
                filteredResolvedTickets.map(renderRequestCard)
              ) : (
                renderEmptyState(
                  searchTerm
                    ? "No accepted proposals match your search"
                    : "No accepted proposals available"
                )
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4"> {/* New TabsContent for rejected tickets */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className={`animate-spin rounded-full h-8 w-8 border-b-2 mx-auto ${
                    isDarkMode ? 'border-gray-400' : 'border-gray-900'
                  }`}></div>
                  <p className={isDarkMode ? 'mt-4 text-gray-400' : 'mt-4 text-gray-500'}>
                    Loading proposals...
                  </p>
                </div>
              ) : filteredRejectedTickets.length > 0 ? (
                filteredRejectedTickets.map(renderRequestCard)
              ) : (
                renderEmptyState(
                  searchTerm
                    ? "No declined proposals match your search"
                    : "No declined proposals available"
                )
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>

      {/* Ticket Details Dialog */}
      <TicketDetailsDialog 
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        selectedTicket={selectedTicket}
        ticketDetails={ticketDetails}
        isDarkMode={isDarkMode}
        updateTicketStatus={updateTicketStatus}
      />
      <InProgressTicketDetailsDialog />
      <ResolvedTicketDetailsDialog />
    </div>
  );
};

export default AgentTickets;