import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  User,
  Send
} from 'lucide-react';

const TicketDetailsPage = () => {
  const { id } = useParams();
  const userType = localStorage.getItem('userType') || '';
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'John Doe',
      content: 'I cannot access the dashboard after the latest update. Getting a 404 error.',
      timestamp: '2024-10-26T10:00:00',
      isAgent: false
    },
    {
      id: '2',
      sender: 'Support Agent',
      content: 'Thank you for reporting this issue. Could you please clear your browser cache and try accessing the dashboard again?',
      timestamp: '2024-10-26T10:15:00',
      isAgent: true
    }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      sender: userType === 'agent' ? 'Support Agent' : 'Customer',
      content: newMessage,
      timestamp: new Date().toISOString(),
      isAgent: userType === 'agent'
    };

    setMessages((prevMessages) => [...prevMessages, message]);
    setNewMessage('');
  };

  return (
    <div className="flex">
      <Sidebar userType={userType} />
      <div className="flex flex-col flex-1">
        <Header title={`Ticket Details - #${id}`} />
        <main className="p-6 flex flex-col gap-4">
          <Card className="p-4">
            <h2 className="text-lg font-semibold">Conversation</h2>
            <div className="space-y-3 mt-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg ${
                    msg.isAgent ? 'bg-blue-100 text-blue-900' : 'bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User size={18} />
                    <span className="font-medium">{msg.sender}</span>
                    <span className="text-sm text-gray-500 ml-auto">{msg.timestamp}</span>
                  </div>
                  <p className="mt-1">{msg.content}</p>
                </div>
              ))}
            </div>
          </Card>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-md"
              placeholder="Type your message..."
            />
            <Button type="submit" className="flex items-center gap-1">
              <Send size={16} />
              Send
            </Button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default TicketDetailsPage;
