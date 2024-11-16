import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
} from "lucide-react";
import { supabase } from "@/utils/supabase";

const CustomerTickets = () => {
  const location = useLocation();
  const userData = location.state?.userData;

  const [activeTickets, setActiveTickets] = useState([]);
  const [resolvedTickets, setResolvedTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userData?.id) return;

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

      const active = tickets.filter((ticket) => ticket.status !== "resolved");
      const resolved = tickets.filter((ticket) => ticket.status === "resolved");

      setActiveTickets(active);
      setResolvedTickets(resolved);
      setIsLoading(false);
    }

    fetchTickets();
  }, [userData?.id]);

  const getStatusColor = (status) => {
    const colors = {
      open: "bg-blue-500/10 text-blue-500 border-blue-200",
      in_progress: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
      resolved: "bg-green-500/10 text-green-600 border-green-200",
    };
    return colors[status] || "bg-gray-500/10 text-gray-600 border-gray-200";
  };

  const getPriorityColor = (status) => {
    const colors = {
      high: "bg-red-500/10 text-red-500 border-red-200",
      medium: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
      low: "bg-green-500/10 text-green-600 border-green-200"
    };
    return colors[status] || "bg-gray-500/10 text-gray-600 border-gray-200";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderTicketCard = (ticket) => (
    <Card key={ticket.id} className="group transition-all duration-200 hover:shadow-md border-l-4" style={{
      borderLeftColor: ticket.priority === 'high' ? '#ef4444' : 
                       ticket.priority === 'medium' ? '#eab308' : '#22c55e'
    }}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                {ticket.issue_type}
              </h3>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
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
    <Card className="bg-gray-50/50">
      <CardContent className="py-12 text-center">
        <CircleSlash className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No tickets found</h3>
        <p className="text-gray-500">{message}</p>
      </CardContent>
    </Card>
  );

  const filteredActiveTickets = activeTickets.filter((ticket) =>
    ticket.issue_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredResolvedTickets = resolvedTickets.filter((ticket) =>
    ticket.issue_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!userData) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <Card className="w-96 text-center">
          <CardContent className="py-6">
            <CircleSlash className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-500 mb-4">Please log in to view your tickets</p>
            <Button onClick={() => window.history.push('/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-[1024px] bg-white shadow-xl rounded-lg my-8">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="hover:bg-gray-100"
              onClick={() => window.history.back()}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">TicketZone</h1>
              <p className="text-sm text-gray-500 mt-1">Manage and track your support tickets</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search tickets by issue type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList className="bg-gray-50/80 p-1">
              <TabsTrigger value="active" className="gap-2">
                Active Tickets
                {activeTickets.length > 0 && (
                  <Badge variant="secondary">{activeTickets.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="resolved" className="gap-2">
                Resolved
                {resolvedTickets.length > 0 && (
                  <Badge variant="secondary">{resolvedTickets.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading tickets...</p>
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

            <TabsContent value="resolved" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading tickets...</p>
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
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CustomerTickets;