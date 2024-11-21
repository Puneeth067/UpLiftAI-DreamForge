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
  XCircle,
  MessageCircle
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { supabase } from "@/utils/supabase";
import { useTheme } from '../../contexts/ThemeContext';

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

  const [selectedRejectedTicket, setSelectedRejectedTicket] = useState(null);
  const [selectedInProgressTicket, setSelectedInProgressTicket] = useState(null);


  useEffect(() => {
    if (!userData?.id) return;

    loadUserTheme(userData.id);

    async function fetchTickets() {
      setIsLoading(true);
      const { data: tickets, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("user_id", userData.id);

      if (error) {
        console.error("Error fetching tickets:", error);
        return;
      }

      const active = tickets.filter((ticket) => ticket.status === "active");
      const inProgress = tickets.filter((ticket) => ticket.status === "in_progress");
      const resolved = tickets.filter((ticket) => ticket.status === "resolved");
      const rejected = tickets.filter((ticket) => ticket.status === "rejected");

      setActiveTickets(active);
      setInProgressTickets(inProgress);
      setResolvedTickets(resolved);
      setRejectedTickets(rejected);
      setIsLoading(false);
    }

    fetchTickets();
  }, [userData?.id, loadUserTheme]);

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
        // Open dialog for rejected tickets
        if (ticket.status === 'rejected') {
          setSelectedRejectedTicket(ticket);
        }
        // Open dialog for in-progress tickets
        if (ticket.status === 'in_progress') {
          setSelectedInProgressTicket(ticket);
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
            <Button onClick={() => window.history.push('/login')}>
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
                TicketZone
              </h1>
              <p className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Manage and track your support tickets
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

      {/* New In-Progress Ticket Dialog */}
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
                // Navigate to ticket chat interface with ticket details
                navigate('/ticketchatinterface', { 
                  state: { 
                    ticketId: selectedInProgressTicket.id,
                    userData: userData 
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
    </div>
  );
};

export default CustomerTickets;