import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { supabase } from '../../utils/supabase.js';
import PropTypes from 'prop-types';
import NotificationModal from './NotificationModal';

const NotificationDropdown = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  useEffect(() => {    
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setNotifications(data || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications' 
        }, 
        (payload) => {
          if (payload.new.user_id === userId) {
            setNotifications((prevNotifications) => 
              [payload.new, ...prevNotifications]
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId]);

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .is('read', false)
        .eq('user_id', userId);

      if (error) throw error;

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          read: true
        }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationColor = (type) => {
    switch (type) {
      case 'ticket':
        return 'bg-fuchsia-200 text-fuchsia-900';
      case 'message':
        return 'bg-fuchsia-300 text-fuchsia-950';
      case 'status':
        return 'bg-fuchsia-400 text-fuchsia-950';
      default:
        return 'bg-fuchsia-200 text-fuchsia-900';
    }
  };

  if (isLoading) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-fuchsia-700 dark:text-fuchsia-300" />
          </Button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    );
  }

  return (
    <>
       <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-fuchsia-700 dark:text-fuchsia-300" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-fuchsia-600 text-white p-0 text-xs rounded-full"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 bg-fuchsia-100 dark:bg-fuchsia-950 border-fuchsia-300 dark:border-fuchsia-800 shadow-lg"
      >
        <div className="flex items-center justify-between p-4">
          <h3 className="font-bold text-fuchsia-950 dark:text-fuchsia-50 text-lg">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-sm text-fuchsia-700 hover:text-fuchsia-900 dark:text-fuchsia-300 dark:hover:text-fuchsia-100"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="bg-fuchsia-300 dark:bg-fuchsia-800" />
        <div className="max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-fuchsia-200 transition-colors cursor-pointer ${
                  !notification.read ? 'bg-fuchsia-100/70' : ''
                }`}
                onClick={() => {
                  markAsRead(notification.id);
                  handleNotificationClick(notification);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 h-2 w-2 rounded-full ${
                    !notification.read ? 'bg-fuchsia-700' : 'bg-fuchsia-400'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-fuchsia-950 dark:text-fuchsia-50">
                        {notification.data.project_title}
                      </span>
                      <span className="text-xs text-fuchsia-600 dark:text-fuchsia-400">
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-fuchsia-900 dark:text-fuchsia-100 mt-1">
                      {notification.message}
                    </p>
                    {notification.type && (
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getNotificationColor(notification.type)}`}>
                          {notification.type}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-fuchsia-700 dark:text-fuchsia-300 font-medium">
              No notifications
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
    {isModalOpen && selectedNotification && (
        <NotificationModal notification={selectedNotification} onClose={handleModalClose} />
      )}
    </>
  );
};

NotificationDropdown.propTypes = {
  userId: PropTypes.string
};

export default NotificationDropdown;