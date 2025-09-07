import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, XCircle, CheckCircle, User, Mail, Star, Wand2 } from 'lucide-react';
import PropTypes from 'prop-types';
import LoadingScreen from "@/components/ui/loading";

const playSoundEffect = (soundType) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Different sound parameters for accept and decline
    if (soundType === 'accept') {
      // Higher pitched, positive sound
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(587.33, audioContext.currentTime); // D5 note
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    } else if (soundType === 'decline') {
      // Lower pitched, negative sound
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(261.63, audioContext.currentTime); // C4 note
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    }

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    
    // Stop the sound after a short duration
    gainNode.gain.exponentialRampToValueAtTime(
      0.001, 
      audioContext.currentTime + 0.5
    );
    
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.error('Error playing sound effect:', error);
  }
};

const NotificationModal = ({ notification, onClose }) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDelining, setIsDelining] = useState(false);
  const [collaboration_request, setCollabRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ensure notification.data is an object with the expected shape
  const notificationData = typeof notification.data === 'string' 
    ? JSON.parse(notification.data) 
    : notification.data;

  useEffect(() => {
    const fetchCollabData = async () => {
      try {
        setIsLoading(true);
        const { data: collaborationRequest, error: collabError } = await supabase
          .from('collaboration_requests')
          .select('*')
          .eq('id', notification.id)
          .single();

        if (collabError) throw collabError;
        setCollabRequest(collaborationRequest);
      } catch (fetchError) {
        console.error('Error fetching collaboration request:', fetchError);
        setError(fetchError.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollabData();
  }, [notification.id]);

  const handleAcceptProposal = async () => {
    if (!collaboration_request) return;

    setIsAccepting(true);
    try {
      playSoundEffect('accept');
      // Transaction to ensure data consistency
      const { error } = await supabase.from('tickets').insert([
        {
          user_id: collaboration_request.patron_id,
          issue_type: collaboration_request.project_title,
          priority: 'high',
          description: collaboration_request.project_description,
          status: 'in_progress',
          agent_id: collaboration_request.creator_id,
        },
      ]);

      if (error) throw error;

      await supabase.from('collaboration_requests').delete().eq('id', notification.id);
      
    } catch (error) {
      console.error('Error accepting proposal:', error);
      alert('Failed to accept proposal. Please try again later.');
    } finally {
      setIsAccepting(false);
      window.location.href = '/agentdashboard';
    }
  };

  const handleDeclineProposal = async () => {
    setIsDelining(true);
    try {      
      playSoundEffect('decline');
      const { error } = await supabase.from('collaboration_requests').delete().eq('id', notification.id);

      if (error) throw error;
      onClose();
    } catch (error) {
      console.error('Error declining proposal:', error);
      alert('Failed to decline proposal. Please try again later.');
    } finally {
      setIsDelining(false);
      window.location.href = '/agentdashboard';
    }
  };

  // Render loading state using LoadingScreen
  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="bg-gradient-to-br from-surface/95 to-primary/5 dark:from-surface/95 dark:to-primary/5 backdrop-blur-xl border-2 border-primary/50 dark:border-primary/50 shadow-2xl shadow-primary/30 dark:shadow-primary/30 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground dark:text-foreground font-bold text-xl flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-background animate-pulse" />
              </div>
              Loading Collaboration Request
            </DialogTitle>
            <DialogDescription className="text-foreground/80 dark:text-foreground/80 font-medium">
              Fetching collaboration request details...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <LoadingScreen />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Render error state
  if (error) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="bg-gradient-to-br from-surface/95 to-red-500/5 dark:from-surface/95 dark:to-red-500/5 backdrop-blur-xl border-2 border-red-500/50 dark:border-red-500/50 shadow-2xl shadow-red-500/30 dark:shadow-red-500/30 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400 font-bold text-xl flex items-center gap-3">
              <div className="h-8 w-8 bg-red-500 rounded-lg flex items-center justify-center">
                <XCircle className="h-5 w-5 text-white" />
              </div>
              Error Loading Request
            </DialogTitle>
            <DialogDescription className="text-foreground/80 dark:text-foreground/80 font-medium bg-red-50/80 dark:bg-red-950/20 p-3 rounded-lg border border-red-200/50 dark:border-red-800/50">
              Failed to load collaboration request: {error}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="destructive" 
              onClick={onClose} 
              className="bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/30 border-2 border-red-600 hover:border-red-700 transition-all"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Render no collaboration request state
  if (!collaboration_request) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="bg-gradient-to-br from-surface/95 to-accent/5 dark:from-surface/95 dark:to-accent/5 backdrop-blur-xl border-2 border-accent/50 dark:border-accent/50 shadow-2xl shadow-accent/30 dark:shadow-accent/30 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground dark:text-foreground font-bold text-xl flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-r from-accent to-secondary rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-background" />
              </div>
              No Collaboration Request Found
            </DialogTitle>
            <DialogDescription className="text-foreground/80 dark:text-foreground/80 font-medium bg-accent/10 dark:bg-accent/10 p-3 rounded-lg border border-accent/30 dark:border-accent/30">
              The collaboration request could not be found or may have been removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              onClick={onClose} 
              className="bg-gradient-to-r from-primary to-primary-hover dark:from-primary dark:to-primary-hover hover:from-primary-hover hover:to-primary text-white font-bold shadow-lg shadow-primary/30 border-2 border-primary hover:border-primary-hover transition-all"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Render collaboration request details
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-surface/95 to-primary/5 dark:from-surface/95 dark:to-primary/5 backdrop-blur-xl border-2 border-primary/50 dark:border-primary/50 shadow-2xl shadow-primary/30 dark:shadow-primary/30 max-w-lg rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-foreground dark:text-foreground font-bold text-xl flex items-center gap-3">
            <div className="h-8 w-8 bg-gradient-to-r from-accent to-primary rounded-lg flex items-center justify-center animate-pulse">
              <Star className="h-5 w-5 text-background" />
            </div>
            Collaboration Request
          </DialogTitle>
          <DialogDescription className="text-foreground/80 dark:text-foreground/80 font-medium bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/10 dark:to-secondary/10 p-3 rounded-lg border border-primary/30 dark:border-primary/30">
            You&apos;ve received a new collaboration proposal from a patron
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 p-5 bg-gradient-to-br from-background/90 to-surface/50 dark:from-background/90 dark:to-surface/50 backdrop-blur-sm rounded-xl max-h-[400px] overflow-y-auto border-2 border-primary/30 dark:border-primary/30 shadow-inner scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent">
          {/* Project Details Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-3 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/10 dark:to-secondary/10 rounded-lg border border-primary/30 dark:border-primary/30">
              <div className="h-6 w-6 bg-gradient-to-r from-primary to-secondary rounded flex items-center justify-center flex-shrink-0">
                <Wand2 className="h-4 w-4 text-background" />
              </div>
              <h3 className="text-lg font-bold text-foreground dark:text-foreground">
                {collaboration_request.project_title}
              </h3>
            </div>
            <div className="pl-2">
              <p className="text-foreground dark:text-foreground font-medium leading-relaxed bg-surface/50 dark:bg-surface/50 p-4 rounded-lg border border-primary/20 dark:border-primary/20 shadow-sm">
                {collaboration_request.project_description}
              </p>
            </div>
          </div>
          
          {/* Patron Information Section */}
          {notificationData && (
            <div className="border-t-2 border-primary/30 dark:border-primary/30 pt-4">
              <h4 className="text-sm font-bold text-foreground/80 dark:text-foreground/80 uppercase tracking-wide mb-3 bg-gradient-to-r from-accent/20 to-secondary/20 dark:from-accent/20 dark:to-secondary/20 p-2 rounded-lg">
                Patron Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-surface/60 dark:bg-surface/60 rounded-lg border border-secondary/30 dark:border-secondary/30">
                  <div className="h-8 w-8 bg-gradient-to-r from-secondary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-background" />
                  </div>
                  <div>
                    <span className="text-sm text-foreground/70 dark:text-foreground/70 font-medium block">Proposed by:</span>
                    <p className="font-bold text-foreground dark:text-foreground">
                      {notificationData.patron_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-surface/60 dark:bg-surface/60 rounded-lg border border-accent/30 dark:border-accent/30">
                  <div className="h-8 w-8 bg-gradient-to-r from-accent to-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-background" />
                  </div>
                  <div>
                    <span className="text-sm text-foreground/70 dark:text-foreground/70 font-medium block">Contact:</span>
                    <p className="font-bold text-primary dark:text-primary">
                      {notificationData.patron_email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between gap-3 pt-4 bg-gradient-to-r from-surface/50 to-primary/5 dark:from-surface/50 dark:to-primary/5 p-4 rounded-lg">
          <Button 
            variant="outline" 
            onClick={handleDeclineProposal} 
            disabled={isDelining}
            className="border-2 border-red-500/60 dark:border-red-500/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold shadow-md hover:shadow-lg transition-all duration-200 bg-background/80 dark:bg-background/80"
          >
            {isDelining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Declining...
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Decline
              </>
            )}
          </Button>
          <Button 
            onClick={handleAcceptProposal} 
            disabled={isAccepting}
            className="bg-gradient-to-r from-primary to-primary-hover dark:from-primary dark:to-primary-hover hover:from-primary-hover hover:to-primary text-white font-bold shadow-lg shadow-primary/30 dark:shadow-primary/30 hover:shadow-xl transition-all duration-200 border-2 border-primary hover:border-primary-hover"
          >
            {isAccepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Accepting...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" /> 
                Accept Collaboration
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

NotificationModal.propTypes = {
  notification: PropTypes.shape({
    user_id: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    data: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        patron_name: PropTypes.string.isRequired,
        patron_email: PropTypes.string.isRequired
      })
    ]).isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default NotificationModal;