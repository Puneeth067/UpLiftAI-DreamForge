import { useState, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/utils/supabase';
import { toast } from '@/hooks/use-toast';
import PropTypes from 'prop-types';
import { useTheme } from '@/contexts/ThemeContext';

const CollabRequestDialog = ({ patron, creator }) => {
  const { isDarkMode } = useTheme();
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogTriggerRef = useRef(null);

  const handleSubmitCollabRequest = async () => {
    if (!projectTitle || !projectDescription) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert collaboration request into supabase
      const { error } = await supabase
        .from('collaboration_requests')
        .insert({
          patron_id: patron.data.id,
          creator_id: creator.id,
          project_title: projectTitle,
          project_description: projectDescription,
          budget: budget,
          timeline: timeline,
          status: 'pending'
        });

      if (error) throw error;

      // Optional: Send notification to creator
      await supabase
        .from('notifications')
        .insert({
          user_id: creator.id,
          type: 'collaboration_request',
          message: `New collaboration request from ${patron.data.fullname}`,
          data: JSON.stringify({
            patron_name: patron.data.fullname,
            project_title: projectTitle
          }),
          read: false
        });

      // Show success toast
      toast({
        title: "Success",
        description: "Collaboration request sent successfully!",
        variant: "default",
        className: isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : ""
      });

      // Close the dialog by triggering the DialogTrigger's click
      if (dialogTriggerRef.current) {
        dialogTriggerRef.current.click();
      }

      // Reset form
      setProjectTitle('');
      setProjectDescription('');
      setBudget('');
      setTimeline('');
    } catch (error) {
      console.error('Error submitting collab request:', error);
      
      toast({
        title: "Error",
        description: "Failed to send collaboration request",
        variant: "destructive",
        className: isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : ""
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger ref={dialogTriggerRef} asChild>
        <Button variant="outline" className="flex items-center gap-2">
          Collab
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Initiate Collaboration Request</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="projectTitle" className="text-right">
              Project Title
            </Label>
            <Input
              id="projectTitle"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="col-span-3"
              placeholder="Enter project title"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="projectDescription" className="text-right">
              Project Description
            </Label>
            <Textarea
              id="projectDescription"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="col-span-3"
              placeholder="Describe your project in detail"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="budget" className="text-right">
              Budget
            </Label>
            <Input
              id="budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="col-span-3"
              placeholder="Estimated budget (optional)"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="timeline" className="text-right">
              Timeline
            </Label>
            <Input
              id="timeline"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              className="col-span-3"
              placeholder="Estimated project timeline (optional)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSubmitCollabRequest}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Collaboration Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

CollabRequestDialog.propTypes = {
  patron: PropTypes.shape({
    data: PropTypes.shape({
      id: PropTypes.string.isRequired,
      fullname: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  creator: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
};

export default CollabRequestDialog;