import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Trash2, Edit2, XCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { toast } from "@/hooks/use-toast";
import PropTypes from 'prop-types';

const ActiveTicketDialog = ({ 
  isOpen,
  onClose, 
  ticket, 
  isDarkMode, 
  onTicketDeleted,
  onTicketUpdated 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTicket, setEditedTicket] = useState({
    type: ticket?.issue_type || '',
    priority: ticket?.priority || 'medium',
    description: ticket?.description || ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDelete = async () => {
    if (!ticket) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticket.id);

      if (error) throw error;

      toast({
        title: "Proposal Deleted",
        description: "Your proposal has been successfully deleted.",
        variant: "destructive"
      });

      onTicketDeleted(ticket.id);
      onClose();
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast({
        title: "Error",
        description: "Failed to delete proposal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async () => {
    if (!ticket) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          issue_type: editedTicket.type,
          priority: editedTicket.priority,
          description: editedTicket.description,
          last_update: new Date().toISOString()
        })
        .eq('id', ticket.id)
        .select();

      if (error) throw error;

      toast({
        title: "Proposal Updated",
        description: "Your proposal has been successfully updated.",
        variant: "default"
      });

      onTicketUpdated({
        ...ticket,
        issue_type: editedTicket.type,
        priority: editedTicket.priority,
        description: editedTicket.description
      });
      
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast({
        title: "Error",
        description: "Failed to update proposal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[500px] rounded-2xl max-h-[90vh] flex flex-col overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <DialogHeader className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} py-4 px-6`}>
          <DialogTitle className={`text-2xl flex items-center gap-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <Edit2 className="text-purple-500" />
            Proposal Details
          </DialogTitle>
          <DialogDescription className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            View and manage your submitted proposal
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {isEditing ? (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Proposal Type
                </label>
                <Select
                  value={editedTicket.type}
                  onValueChange={(value) => setEditedTicket(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className={`${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'} rounded-lg`}>
                    <SelectValue placeholder="Select required speciality" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[280px] overflow-y-auto">
                      <SelectItem value="3D Modeling">3D Modeling</SelectItem>
                      <SelectItem value="Aerial Engineering">Aerial Engineering</SelectItem>
                      <SelectItem value="Aerospace Engineering">Aerospace Engineering</SelectItem>
                      <SelectItem value="Aerospace Research">Aerospace Research</SelectItem>
                      <SelectItem value="AR/VR Development">AR/VR Development</SelectItem>
                      <SelectItem value="Artificial Intelligence">Artificial Intelligence</SelectItem>
                      <SelectItem value="Audio Engineering">Audio Engineering</SelectItem>
                      <SelectItem value="Bioinformatics">Bioinformatics</SelectItem>
                      <SelectItem value="Biotechnology">Biotechnology</SelectItem>
                      <SelectItem value="Blockchain Technology">Blockchain Technology</SelectItem>
                      <SelectItem value="Brand Strategy">Brand Strategy</SelectItem>
                      <SelectItem value="Cinematography">Cinematography</SelectItem>
                      <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                      <SelectItem value="Cloud Computing">Cloud Computing</SelectItem>
                      <SelectItem value="Cloud Solutions">Cloud Solutions</SelectItem>
                      <SelectItem value="Composition">Composition</SelectItem>
                      <SelectItem value="Content Strategy">Content Strategy</SelectItem>
                      <SelectItem value="Copywriting">Copywriting</SelectItem>
                      <SelectItem value="Creative Direction">Creative Direction</SelectItem>
                      <SelectItem value="Creative Technology">Creative Technology</SelectItem>
                      <SelectItem value="Creative Writing">Creative Writing</SelectItem>
                      <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                      <SelectItem value="DevOps">DevOps</SelectItem>
                      <SelectItem value="Digital Art">Digital Art</SelectItem>
                      <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                      <SelectItem value="Digital Performance">Digital Performance</SelectItem>
                      <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                      <SelectItem value="Environmental Science">Environmental Science</SelectItem>
                      <SelectItem value="Film Production">Film Production</SelectItem>
                      <SelectItem value="Filmmaking">Filmmaking</SelectItem>
                      <SelectItem value="Game Design">Game Design</SelectItem>
                      <SelectItem value="Generative AI">Generative AI</SelectItem>
                      <SelectItem value="Graphic Design">Graphic Design</SelectItem>
                      <SelectItem value="Illustration">Illustration</SelectItem>
                      <SelectItem value="Immersive Experience Design">Immersive Experience Design</SelectItem>
                      <SelectItem value="Industrial Design">Industrial Design</SelectItem>
                      <SelectItem value="Information Security">Information Security</SelectItem>
                      <SelectItem value="Innovation Consulting">Innovation Consulting</SelectItem>
                      <SelectItem value="Interactive Media">Interactive Media</SelectItem>
                      <SelectItem value="IoT Design">IoT Design</SelectItem>
                      <SelectItem value="IT Support">IT Support</SelectItem>
                      <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                      <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                      <SelectItem value="Mobile App Development">Mobile App Development</SelectItem>
                      <SelectItem value="Motion Graphics">Motion Graphics</SelectItem>
                      <SelectItem value="Music Production">Music Production</SelectItem>
                      <SelectItem value="Network Administration">Network Administration</SelectItem>
                      <SelectItem value="Network Engineering">Network Engineering</SelectItem>
                      <SelectItem value="Performance Art">Performance Art</SelectItem>
                      <SelectItem value="Podcasting">Podcasting</SelectItem>
                      <SelectItem value="Product Management">Product Management</SelectItem>
                      <SelectItem value="Quantum Computing">Quantum Computing</SelectItem>
                      <SelectItem value="Quantum Technology">Quantum Technology</SelectItem>
                      <SelectItem value="Robotics Engineering">Robotics Engineering</SelectItem>
                      <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                      <SelectItem value="Sound Design">Sound Design</SelectItem>
                      <SelectItem value="Systems Architecture">Systems Architecture</SelectItem>
                      <SelectItem value="Technical Documentation">Technical Documentation</SelectItem>
                      <SelectItem value="Technical Writing">Technical Writing</SelectItem>
                      <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                      <SelectItem value="Web Design">Web Design</SelectItem>
                      <SelectItem value="Web Development">Web Development</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Proposal Level
                </label>
                <Select
                  value={editedTicket.priority}
                  onValueChange={(value) => setEditedTicket(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger className={`${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'} rounded-lg`}>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Small Project</SelectItem>
                    <SelectItem value="medium">Medium Project</SelectItem>
                    <SelectItem value="high">Complex Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Description
                </label>
                <Textarea
                  placeholder="Please describe your proposal in detail"
                  value={editedTicket.description}
                  onChange={(e) => setEditedTicket(prev => ({ ...prev, description: e.target.value }))}
                  className={`h-32 rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-200 placeholder-gray-400'
                      : 'bg-white text-gray-800 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-2">
                <label className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Proposal Type
                </label>
                <Input 
                  value={ticket.issue_type} 
                  readOnly 
                  className={`${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-800'} cursor-not-allowed`}
                />
              </div>
              <div className="grid gap-2">
                <label className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Urgency
                </label>
                <Input 
                  value={ticket.priority === 'low' ? 'Small Project' : 
                          ticket.priority === 'medium' ? 'Medium Project' : 
                          'Complex Project'} 
                  readOnly 
                  className={`${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-800'} cursor-not-allowed`}
                />
              </div>
              <div className="grid gap-2">
                <label className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Description
                </label>
                <Textarea
                  value={ticket.description} 
                  readOnly 
                  className={`h-32 ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-800'} cursor-not-allowed`}
                />
              </div>
            </div>
          )}
        </div>

        <div className={`sticky bottom-0 left-0 right-0 z-10 py-4 px-6 flex justify-between gap-4 ${
          isDarkMode 
            ? 'bg-gray-800 border-t border-gray-700' 
            : 'bg-white border-t border-gray-200'
        }`}>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Deleting...' : 'Delete Proposal'}
          </Button>
          
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  className={`rounded-lg ${
                    isDarkMode
                      ? 'border-gray-600 text-gray-200 hover:bg-gray-700'
                      : 'border-gray-200 text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <XCircle className="mr-2 w-4 h-4" /> Cancel
                </Button>
                <Button 
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className={`rounded-lg flex items-center gap-2 ${
                    isDarkMode
                      ? 'from-purple-400 to-indigo-500'
                      : 'from-purple-500 to-indigo-600'
                  } bg-gradient-to-br text-white shadow-md hover:shadow-xl`}
                >
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" /> Update
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setIsEditing(true)}
                className={`rounded-lg flex items-center gap-2 ${
                  isDarkMode
                    ? 'from-purple-400 to-indigo-500'
                    : 'from-purple-500 to-indigo-600'
                } bg-gradient-to-br text-white shadow-md hover:shadow-xl`}
              >
                <Edit2 className="w-4 h-4" /> Edit Proposal
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

ActiveTicketDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  ticket: PropTypes.object,
  isDarkMode: PropTypes.bool,
  onTicketDeleted: PropTypes.func.isRequired,
  onTicketUpdated: PropTypes.func.isRequired,
};

export default ActiveTicketDialog;