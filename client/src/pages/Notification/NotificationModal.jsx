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
import { Loader2, XCircle, CheckCircle } from 'lucide-react';
import PropTypes from 'prop-types';

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

  // Render loading state
  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="bg-fuchsia-50 dark:bg-fuchsia-950">
          <DialogHeader>
            <DialogTitle>Loading Collaboration Request</DialogTitle>
            <DialogDescription>
              Fetching collaboration request details...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-fuchsia-600 dark:text-fuchsia-400" />
            <p className="text-fuchsia-800 dark:text-fuchsia-200">
              Loading collaboration request...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Render error state
  if (error) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="bg-fuchsia-50 dark:bg-fuchsia-950">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400">
              <XCircle className="inline-block mr-2" /> Error
            </DialogTitle>
            <DialogDescription className="text-fuchsia-700 dark:text-fuchsia-300">
              Failed to load collaboration request: {error}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="destructive" 
              onClick={onClose} 
              className="bg-fuchsia-600 hover:bg-fuchsia-700 dark:bg-fuchsia-800 dark:hover:bg-fuchsia-700"
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
        <DialogContent className="bg-fuchsia-50 dark:bg-fuchsia-950">
          <DialogHeader>
            <DialogTitle className="text-fuchsia-800 dark:text-fuchsia-200">
              No Collaboration Request
            </DialogTitle>
            <DialogDescription className="text-fuchsia-600 dark:text-fuchsia-400">
              The collaboration request could not be found.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              onClick={onClose} 
              className="bg-fuchsia-600 hover:bg-fuchsia-700 dark:bg-fuchsia-800 dark:hover:bg-fuchsia-700"
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
      <DialogContent className="bg-fuchsia-50 dark:bg-fuchsia-950 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-fuchsia-900 dark:text-fuchsia-100">
            Collaboration Request
          </DialogTitle>
          <DialogDescription className="text-fuchsia-700 dark:text-fuchsia-300">
            You`ve received a new collaboration proposal
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 p-4 bg-fuchsia-100 dark:bg-fuchsia-900 rounded-lg max-h-[300px] overflow-y-auto">
          <div>
            <h3 className="text-lg font-semibold text-fuchsia-800 dark:text-fuchsia-200">
              {collaboration_request.project_title}
            </h3>
            <p className="text-fuchsia-700 dark:text-fuchsia-300 mt-2">
              {collaboration_request.project_description}
            </p>
          </div>
          
          {notificationData && (
            <div className="text-md text-fuchsia-600 dark:text-fuchsia-400">
              <h1>Proposed by:<span className="font-semibold"> {notificationData.patron_name}</span></h1>
              <p>Contact:<span className="font-semibold"> {notificationData.patron_email}</span></p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleDeclineProposal} 
            disabled={isDelining}
            className="text-fuchsia-700 border-fuchsia-600 hover:bg-fuchsia-100 dark:text-fuchsia-300 dark:border-fuchsia-800"
          >
            {isDelining ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Declining...</>
            ) : (
              'Decline'
            )}
          </Button>
          <Button 
            onClick={handleAcceptProposal} 
            disabled={isAccepting}
            className="bg-fuchsia-600 hover:bg-fuchsia-700 dark:bg-fuchsia-800 dark:hover:bg-fuchsia-700"
          >
            {isAccepting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Accepting...</>
              ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" /> Accept
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