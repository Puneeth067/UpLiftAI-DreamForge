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

// Sound effect utility function
const playSoundEffect = (soundType) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    switch (soundType) {
      case 'hover':
        // Soft, short ping sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        break;
      case 'click':
        // Slightly more pronounced click sound
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        break;
      default:
        return;
    }

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    
    // Stop the sound after a short duration
    gainNode.gain.exponentialRampToValueAtTime(
      0.001, 
      audioContext.currentTime + 0.1
    );
    
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    console.error('Error playing sound effect:', error);
  }
};

const NotificationDropdown = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const handleNotificationClick = (notification) => {
    // Play click sound effect
    playSoundEffect('click');
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
        return 'bg-primary/20 dark:bg-primary/20 text-primary dark:text-primary border-2 border-primary/60 dark:border-primary/60 shadow-sm shadow-primary/20';
      case 'message':
        return 'bg-secondary/20 dark:bg-secondary/20 text-secondary dark:text-secondary border-2 border-secondary/60 dark:border-secondary/60 shadow-sm shadow-secondary/20';
      case 'status':
        return 'bg-accent/20 dark:bg-accent/20 text-accent dark:text-accent-hover border-2 border-accent/60 dark:border-accent/60 shadow-sm shadow-accent/20';
      default:
        return 'bg-primary/20 dark:bg-primary/20 text-primary dark:text-primary border-2 border-primary/60 dark:border-primary/60 shadow-sm shadow-primary/20';
    }
  };

  if (isLoading) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-primary dark:text-primary" />
            <div className="absolute -top-1 -right-1 h-4 w-4">
              <div className="h-2 w-2 bg-accent dark:bg-accent rounded-full animate-pulse"></div>
            </div>
          </Button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    );
  }
  
  if (error) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-red-500" title={error} />
          </Button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger 
          asChild
          onMouseEnter={() => playSoundEffect('hover')}
        >
          <Button variant="ghost" size="icon" className="relative hover:bg-surface dark:hover:bg-surface transition-colors">
            <Bell className="h-5 w-5 text-primary dark:text-primary" />
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-accent dark:bg-accent text-background dark:text-background p-0 text-xs rounded-full font-bold shadow-lg shadow-accent/40 animate-pulse"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-80 bg-surface/95 dark:bg-surface/95 backdrop-blur-xl border-2 border-primary/40 dark:border-primary/40 shadow-2xl shadow-primary/30 dark:shadow-primary/30 rounded-xl"
        >
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/10 dark:to-secondary/10 rounded-t-lg">
            <h3 className="font-bold text-foreground dark:text-foreground text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  playSoundEffect('click');
                  markAllAsRead();
                }}
                onMouseEnter={() => playSoundEffect('hover')}
                className="text-sm text-primary dark:text-primary hover:text-primary-hover dark:hover:text-primary-hover hover:bg-primary/15 dark:hover:bg-primary/15 font-medium border border-primary/30 dark:border-primary/30 rounded-lg transition-all"
              >
                Mark all as read
              </Button>
            )}
          </div>
          <DropdownMenuSeparator className="bg-primary/40 dark:bg-primary/40 h-0.5" />
          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-surface/50 dark:scrollbar-track-surface/50">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/5 dark:hover:from-primary/10 dark:hover:to-secondary/5 transition-all duration-200 cursor-pointer border-l-4 ${
                    !notification.read 
                      ? 'bg-gradient-to-r from-primary/8 to-accent/5 dark:from-primary/8 dark:to-accent/5 border-l-accent dark:border-l-accent' 
                      : 'border-l-transparent hover:border-l-primary/60 dark:hover:border-l-primary/60'
                  }`}
                  onClick={() => {
                    markAsRead(notification.id);
                    handleNotificationClick(notification);
                  }}
                  onMouseEnter={() => playSoundEffect('hover')}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 h-3 w-3 rounded-full border-2 ${
                      !notification.read 
                        ? 'bg-accent dark:bg-accent border-accent dark:border-accent shadow-lg shadow-accent/50 animate-pulse' 
                        : 'bg-surface dark:bg-surface border-primary/70 dark:border-primary/70'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-foreground dark:text-foreground">
                          {notification.data?.project_title || 'Notification'}
                        </span>
                        <span className="text-xs text-foreground/70 dark:text-foreground/70 font-medium bg-surface/80 dark:bg-surface/80 px-2 py-1 rounded-md">
                          {new Date(notification.created_at).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground dark:text-foreground font-medium leading-relaxed">
                        {notification.message}
                      </p>
                      {notification.type && (
                        <div className="mt-3">
                          <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${getNotificationColor(notification.type)}`}>
                            {notification.type.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-gradient-to-br from-surface/50 to-primary/5 dark:from-surface/50 dark:to-primary/5 m-2 rounded-lg border border-primary/20 dark:border-primary/20">
                <Bell className="mx-auto h-12 w-12 mb-4 text-primary/60 dark:text-primary/60" />
                <p className="text-foreground/70 dark:text-foreground/70 font-medium text-lg">No notifications yet</p>
                <p className="text-foreground/50 dark:text-foreground/50 text-sm mt-1">You&apos;re all caught up!</p>
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