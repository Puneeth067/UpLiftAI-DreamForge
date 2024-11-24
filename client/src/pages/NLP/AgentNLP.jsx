import { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Paperclip, Sparkles } from 'lucide-react';

const AgentNLP = ({ userData, isCollapsed }) => {
  const [message, setMessage] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim()) {
      // Handle message sending logic here
      setMessage('');
    }
  };

  const quickActions = [
    { icon: Sparkles, label: 'Create image' },
    { icon: Sparkles, label: 'Summarize text' },
    { icon: Sparkles, label: 'Get advice' },
    { icon: Sparkles, label: 'Help me write' }
  ];

  return (
    <main 
  className={`flex-1 overflow-hidden flex flex-col items-center justify-center transition-all duration-300 w-full mx-0 max-w-none  ${isCollapsed ? 'left-16' : 'left-64'} mt-8 p-16`}
>
      <div className="flex-1 overflow-hidden flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto w-full h-full flex flex-col flex-1">
          {/* Main Card */}
          <Card className="flex-1 flex flex-col overflow-hidden p-4 border-0 shadow-none">
            <CardHeader className="text-center space-y-2 pb-8">
              <h1 className="text-4xl font-bold text-violet-800 dark:text-white tracking-tight">
                Welcome back, {userData?.fullname}
              </h1>
            </CardHeader>

            {/* Messages Area */}
            <CardContent className="flex-1 px-0 overflow-hidden">
              <ScrollArea className="flex-1 h-[calc(100vh-400px)] rounded-lg px-4">
                {/* Messages would go here */}
              </ScrollArea>
            </CardContent>

            <CardFooter className="flex flex-col space-y-6 px-0">
              {/* Input Form */}
              <Card className="w-full border border-gray-200 dark:border-gray-700 shadow-sm">
                <form onSubmit={handleSend}>
                  <CardContent className="p-0">
                    <div className="px-4 py-3 min-h-[60px] flex items-center">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="How can I help with? type here..."
                        rows="1"
                        className="flex-1 bg-transparent border-0 focus:ring-0 resize-none max-h-48 overflow-y-auto text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base px-1"
                        style={{ outline: 'none' }}
                      />
                    </div>

                    <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <button
                        type="button"
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <Paperclip className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </button>
                      <button
                        type="submit"
                        disabled={!message.trim()}
                        className={`inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
                          message.trim()
                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </button>
                    </div>
                  </CardContent>
                </form>
              </Card>

              {/* Quick Actions */}
              <div className="flex flex-wrap justify-center gap-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="inline-flex items-center px-4 py-2 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all duration-200 shadow-sm hover:shadow group"
                  >
                    <action.icon className="h-4 w-4 mr-2 text-purple-500 dark:text-purple-400 group-hover:scale-110 transition-transform duration-200" />
                    {action.label}
                  </button>
                ))}
              </div>

            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
};

AgentNLP.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  userData: PropTypes.object
};

export default AgentNLP;