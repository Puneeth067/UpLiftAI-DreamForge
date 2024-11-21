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
import { 
  CircleSlash, 
  MessageSquare, 
  Search, 
  Timer, 
  ArrowLeft,
  Clock,
  User,
  X,
  CheckCircle2,
  XCircle
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
import { Textarea } from "@/components/ui/textarea";

const AgentTickets = () => {
  const location = useLocation();
  const userData = location.state?.userData;
  const { isDarkMode, loadUserTheme } = useTheme();

  const [openTickets, setOpenTickets] = useState([]);
  const [inProgressTickets, setInProgressTickets] = useState([]);
  const [resolvedTickets, setResolvedTickets] = useState([]);
  const [rejectedTickets, setRejectedTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // New state for ticket details dialog
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(null);

  // New state for in-progress ticket dialog
const [inProgressTicketUser, setInProgressTicketUser] = useState(null);
const [isInProgressDialogOpen, setIsInProgressDialogOpen] = useState(false);

// New state for rejection dialog
const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
const [ setRejectionReason] = useState("");

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

// Updated handleTicketClick
const handleTicketClick = async (ticket) => {
  if (ticket.status === 'active') {
    setSelectedTicket(ticket);
    const details = await fetchTicketDetails(ticket.id);
    setTicketDetails(details);
    setIsDialogOpen(true);
  } else if (ticket.status === 'in_progress') {
    const userDetails = await fetchInProgressTicketUserDetails(ticket.user_id);
    setInProgressTicketUser(userDetails);
    setSelectedTicket(ticket);
    setIsInProgressDialogOpen(true);
  }
};

// In-Progress Ticket Details Dialog
const InProgressTicketDetailsDialog = () => {
  const navigate = useNavigate();

  const handleStartChat = () => {
    navigate('/agentchatinterface', { 
      state: { 
        ticketId: selectedTicket.id, 
        userId: selectedTicket.user_id 
      } 
    });
  };

  if (!selectedTicket || !inProgressTicketUser) return null;

  return (
    <Dialog 
      open={isInProgressDialogOpen} 
      onOpenChange={setIsInProgressDialogOpen}
    >
      <DialogContent className={`sm:max-w-[600px] ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : ''
      }`}>
        <DialogHeader>
          <DialogTitle className={isDarkMode ? 'text-gray-100' : ''}>
            Ticket #{selectedTicket.id} - In Progress
          </DialogTitle>
        </DialogHeader>

        <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : ''}`}>
          <div>
            <p className="font-medium">User Details</p>
            <div className={`p-3 rounded-md ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-200' 
                : 'bg-gray-50 text-gray-800'
            }`}>
              <p>Full Name: {inProgressTicketUser.fullname}</p>
              <p>Email: {inProgressTicketUser.email}</p>
            </div>
          </div>

          <div>
            <p className="font-medium">Ticket Description</p>
            <p className={`p-3 rounded-md ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-200' 
                : 'bg-gray-50 text-gray-800'
            }`}>
              {selectedTicket.description || 'No description provided'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="ghost" 
            onClick={() => setIsInProgressDialogOpen(false)}
            className={`mr-2 ${
              isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Cancel
          </Button>
          <Button 
            variant="default" 
            onClick={handleStartChat}
            className="mr-2"
          >
            Start Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

  useEffect(() => {
    if (!userData?.id) return;

    loadUserTheme(userData.id);

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
      const inProgress = tickets.filter((ticket) => ticket.status === "in_progress");
      const resolved = tickets.filter((ticket) => ticket.status === "resolved");
      const rejected = tickets.filter((ticket) => ticket.status === "rejected");

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


   // Update ticket status method
   const updateTicketStatus = async (status, reason = "") => {
    if (!selectedTicket) return;

    try {
      // Prepare update object
      const updateData = { 
        status: status, 
        last_update: new Date().toISOString()
      };

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
        console.error("Error updating ticket status:", error);
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
      setIsRejectionDialogOpen(false);
      setSelectedTicket(null);
      setTicketDetails(null);
      setRejectionReason("");

    } catch (error) {
      console.error("Unexpected error:", error);
    }
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

  const getPriorityColor = (priority) => {
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
    return colors[priority] || (isDarkMode
      ? "bg-gray-500/20 text-gray-400 border-gray-800"
      : "bg-gray-500/10 text-gray-600 border-gray-200");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Ticket Details Dialog
  const TicketDetailsDialog = () => {
    const handleReject = () => {
      setIsDialogOpen(false);
      setIsRejectionDialogOpen(true);
    };

    if (!selectedTicket || !ticketDetails) return null;

    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={`sm:max-w-[600px] ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : ''
        }`}>
          <DialogHeader>
            <DialogTitle className={isDarkMode ? 'text-gray-100' : ''}>
              Ticket #{ticketDetails.id} - {ticketDetails.issue_type}
            </DialogTitle>
            <DialogDescription className={isDarkMode ? 'text-gray-400' : ''}>
              Ticket details and available actions
            </DialogDescription>
          </DialogHeader>

          <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : ''}`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Status</p>
                <Badge 
                  variant="outline" 
                  className={`${getStatusColor(ticketDetails.status)} capitalize mt-1`}
                >
                  {ticketDetails.status.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <p className="font-medium">Priority</p>
                <Badge 
                  variant="outline" 
                  className={`${getPriorityColor(ticketDetails.priority)} capitalize mt-1`}
                >
                  {ticketDetails.priority}
                </Badge>
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">Description</p>
              <p className={`p-3 rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-200' 
                  : 'bg-gray-50 text-gray-800'
              }`}>
                {ticketDetails.description || 'No description provided'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Created At</p>
                <p>{formatDate(ticketDetails.created_at)}</p>
              </div>
              <div>
                <p className="font-medium">Last Updated</p>
                <p>{formatDate(ticketDetails.last_update)}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setIsDialogOpen(false)}
              className={`mr-2 ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              className="mr-2"
            >
              <XCircle className="mr-2 h-4 w-4" /> Reject
            </Button>
            <Button 
              variant="default" 
              onClick={() => updateTicketStatus("in_progress")}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Rejection Reason Dialog
  const RejectionReasonDialog = () => {
    const [rejectionDetails, setRejectionDetails] = useState({
      reason: ''
    });
  
    const handleSubmitRejection = () => {
      if (rejectionDetails.reason.trim()) {
        updateTicketStatus("rejected", rejectionDetails.reason);
      }
    };
  
    return (
      <Dialog 
        open={isRejectionDialogOpen} 
        onOpenChange={(open) => {
          setIsRejectionDialogOpen(open);
          if (!open) {
            // Reset rejection details when dialog closes
            setRejectionDetails({ reason: '' });
          }
        }}
      >
        <DialogContent className={`sm:max-w-[500px] ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : ''
        }`}>
          <DialogHeader>
            <DialogTitle className={isDarkMode ? 'text-gray-100' : ''}>
              Reject Ticket
            </DialogTitle>
            <DialogDescription className={isDarkMode ? 'text-gray-400' : ''}>
              Please provide a reason for rejecting this ticket
            </DialogDescription>
          </DialogHeader>
  
          <Textarea
            placeholder="Enter detailed reason for ticket rejection..."
            value={rejectionDetails.reason}
            onChange={(e) => {
              // Use functional update to ensure correct state update
              setRejectionDetails(prev => ({ 
                ...prev, 
                reason: e.target.value 
              }))
            }}
            className={`min-h-[100px] ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-100 border-gray-600' 
                : ''
            }`}
          />
  
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setIsRejectionDialogOpen(false)}
              className={`mr-2 ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleSubmitRejection}
              disabled={!rejectionDetails.reason.trim()}
            >
              <XCircle className="mr-2 h-4 w-4" /> Submit Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const renderTicketCard = (ticket) => (
    <Card 
      key={ticket.id} 
      className={`group transition-all duration-200 hover:shadow-md border-l-4 cursor-pointer ${
        isDarkMode ? 'bg-gray-800 hover:bg-gray-800/80' : 'bg-white hover:bg-gray-50'
      }`}
      style={{
        borderLeftColor: ticket.priority === 'high' ? '#ef4444' : 
                        ticket.priority === 'medium' ? '#eab308' : '#22c55e'
      }}
      onClick={() => handleTicketClick(ticket)}
    >
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
              {ticket.user_id && (
                <div className="flex items-center gap-1">
                  <User size={14} />
                  <span>User ID: {ticket.user_id}</span>
                </div>
              )}
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

  return (
    <div className={`min-h-screen flex justify-center ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`w-[1024px] shadow-xl rounded-lg my-8 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className={`p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className={`hover:bg-gray-700 ${
                isDarkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => window.history.back()}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className={`text-2xl font-bold ${
                isDarkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>
                Agent Ticket Management
              </h1>
              <p className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                View and manage all support tickets
              </p>
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
              Tickets Assigned
              {openTickets.length > 0 && (
                <Badge variant="secondary">{openTickets.length}</Badge>
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
            <TabsTrigger value="rejected" className="gap-2"> {/* New tab for rejected tickets */}
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
              ) : filteredOpenTickets.length > 0 ? (
                filteredOpenTickets.map(renderTicketCard)
              ) : (
                renderEmptyState(
                  searchTerm
                    ? "No active tickets match your search"
                    : "No active tickets available"
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
                    : "No tickets in progress"
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
                    Loading tickets...
                  </p>
                </div>
              ) : filteredResolvedTickets.length > 0 ? (
                filteredResolvedTickets.map(renderTicketCard)
              ) : (
                renderEmptyState(
                  searchTerm
                    ? "No resolved tickets match your search"
                    : "No resolved tickets available"
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
                    Loading tickets...
                  </p>
                </div>
              ) : filteredRejectedTickets.length > 0 ? (
                filteredRejectedTickets.map(renderTicketCard)
              ) : (
                renderEmptyState(
                  searchTerm
                    ? "No rejected tickets match your search"
                    : "No rejected tickets available"
                )
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Ticket Details Dialog */}
      <TicketDetailsDialog />
      <InProgressTicketDetailsDialog />
      <RejectionReasonDialog />
    </div>
  );
};

export default AgentTickets;