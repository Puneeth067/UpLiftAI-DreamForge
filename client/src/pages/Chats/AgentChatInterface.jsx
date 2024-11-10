import React, { useState, useEffect } from 'react';
import { 
  Send, 
  User, 
  Bot, 
  Paperclip, 
  MoreVertical, 
  Clock,
  Tag,
  History,
  PhoneCall,
  Filter,
  Search,
  RefreshCw,
  Link2,
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const AgentChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Hello! I'm having trouble accessing my account. It keeps saying 'invalid credentials'.",
      time: "10:30 AM",
      isCustomer: true,
      customerName: "John Doe"
    },
    {
      id: 2,
      content: "I understand your concern. Could you confirm if you're using the correct email address?",
      time: "10:31 AM",
      isAgent: true,
      agentName: "Sarah Wilson"
    }
  ]);
  
  const [input, setInput] = useState('');
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState({
    name: "John Doe",
    email: "john.doe@email.com",
    ticketId: "TK-2024-001",
    status: "Active",
    priority: "High",
    waitTime: "5m",
    history: "3 previous tickets"
  });

  const [suggestedResponses] = useState([
    "Could you please verify your account email?",
    "I'll help you reset your password. Shall we proceed?",
    "Let me check your account status."
  ]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 1024) {
        setShowLeftSidebar(false);
        setShowRightSidebar(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      content: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAgent: true,
      agentName: "Sarah Wilson"
    };
    
    setMessages([...messages, newMessage]);
    setInput('');
  };

  const LeftSidebar = () => (
    <Card style={{ width: showLeftSidebar ? '256px' : '0', transition: 'width 0.3s', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Search style={{ height: '16px', width: '16px', color: '#6b7280' }} />
          <input
            type="text"
            placeholder="Search conversations..."
            style={{ width: '100%', fontSize: '14px', border: 'none', backgroundColor: '#ffffff', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" size="sm" style={{ width: '100%' }}>
            <Filter style={{ height: '16px', width: '16px', marginRight: '4px' }} />
            Filter
          </Button>
          <Button variant="outline" size="sm" style={{ width: '100%' }}>
            <RefreshCw style={{ height: '16px', width: '16px', marginRight: '4px' }} />
            Refresh
          </Button>
        </div>
      </div>
      <div style={{ overflowY: 'auto', padding: '8px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>Active Chats</h3>
        {[1, 2, 3].map((chat) => (
          <div key={chat} style={{ padding: '8px', cursor: 'pointer', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Avatar style={{ height: '32px', width: '32px' }}>
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '500', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>John Doe</span>
                  <Badge variant="outline" style={{ fontSize: '12px' }}>High</Badge>
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Login issue...</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  const RightSidebar = () => (
    <Card style={{ width: showRightSidebar ? '320px' : '0', transition: 'width 0.3s', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <h3 style={{ fontWeight: '600', marginBottom: '16px' }}>Customer Details</h3>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '14px', color: '#6b7280' }}>Email</label>
          <p style={{ fontSize: '14px' }}>{selectedCustomer.email}</p>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '14px', color: '#6b7280' }}>Previous Interactions</label>
          <p style={{ fontSize: '14px' }}>{selectedCustomer.history}</p>
        </div>
        <Separator />
        <div style={{ marginTop: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Quick Actions</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Button variant="outline" size="sm" style={{ justifyContent: 'start' }}>
              <Tag style={{ height: '16px', width: '16px', marginRight: '8px' }} />
              Add Tags
            </Button>
            <Button variant="outline" size="sm" style={{ justifyContent: 'start' }}>
              <History style={{ height: '16px', width: '16px', marginRight: '8px' }} />
              View History
            </Button>
            <Button variant="outline" size="sm" style={{ justifyContent: 'start' }}>
              <AlertCircle style={{ height: '16px', width: '16px', marginRight: '8px' }} />
              Escalate Issue
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', maxWidth: '1400px', margin: '0 auto', padding: '16px', gap: '16px' }}>
      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          variant="outline"
          size="icon"
          style={{ position: 'fixed', top: '16px', left: '16px', zIndex: '50' }}
          onClick={() => setShowLeftSidebar(!showLeftSidebar)}
        >
          <Menu style={{ height: '16px', width: '16px' }} />
        </Button>
      )}

      {/* Left Sidebar */}
      {(!isMobile || showLeftSidebar) && <LeftSidebar />}

      {/* Main Chat Area */}
      <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: '0' }}>
        {/* Chat Header */}
        <div style={{ borderBottom: '1px solid #e5e7eb', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {!isMobile && (
              <Button variant="ghost" size="icon" onClick={() => setShowLeftSidebar(!showLeftSidebar)}>
                <ChevronLeft style={{ height: '16px', width: '16px' }} />
              </Button>
            )}
            <Avatar style={{ height: '40px', width: '40px' }}>
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <h2 style={{ fontWeight: '600' }}>{selectedCustomer.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
                <span>Ticket #{selectedCustomer.ticketId}</span>
                <Badge variant="secondary">{selectedCustomer.priority}</Badge>
                <Badge variant="outline">Wait time: {selectedCustomer.waitTime}</Badge>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="icon"><MoreVertical style={{ height: '16px', width: '16px' }} /></Button>
            {!isMobile && (
              <Button variant="ghost" size="icon" onClick={() => setShowRightSidebar(!showRightSidebar)}>
                <ChevronRight style={{ height: '16px', width: '16px' }} />
              </Button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {messages.map((message) => (
            <div key={message.id} style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexDirection: message.isAgent ? 'row-reverse' : 'row' }}>
              <Avatar style={{ height: '32px', width: '32px' }}>
                <AvatarFallback>{message.isAgent ? 'AG' : 'CU'}</AvatarFallback>
              </Avatar>
              <div style={{
                maxWidth: '70%',
                borderRadius: '8px',
                padding: '12px',
                backgroundColor: message.isAgent ? '#1e40af' : '#f3f4f6',
                color: message.isAgent ? '#ffffff' : '#111827',
              }}>
                <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                  {message.isAgent ? message.agentName : message.customerName}
                </div>
                <p style={{ fontSize: '14px' }}>{message.content}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', opacity: '0.7', marginTop: '4px' }}>
                  <Clock style={{ height: '12px', width: '12px' }} />
                  <span>{message.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Suggestions */}
        <div style={{ borderTop: '1px solid #e5e7eb', padding: '12px', backgroundColor: '#f9fafb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Bot style={{ height: '16px', width: '16px', color: '#1e40af' }} />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>AI Suggested Responses:</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {suggestedResponses.map((response, index) => (
              <Button key={index} variant="outline" size="sm" style={{ whiteSpace: 'nowrap' }} onClick={() => setInput(response)}>
                {response}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              style={{
                width: '100%',
                borderRadius: '8px',
                padding: '12px',
                minHeight: '80px',
                border: '1px solid #e5e7eb',
                outline: 'none',
                resize: 'none',
                fontSize: '14px',
                backgroundColor: '#ffffff', // White background for the input
                color: '#374151' // Dark mode text color
              }}
            />
            <Button onClick={handleSend} style={{ paddingLeft: '24px', paddingRight: '24px' }}>
              Send
            </Button>
          </div>
        </div>
      </Card>

      {/* Right Sidebar */}
      {(!isMobile || showRightSidebar) && <RightSidebar />}
    </div>
  );
};

export default AgentChatInterface;
