import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import PropTypes from 'prop-types';


const TicketDetailsDialog = ({ 
  isDialogOpen, 
  setIsDialogOpen, 
  selectedTicket, 
  ticketDetails, 
  isDarkMode,
  updateTicketStatus 
}) => {
  if (!selectedTicket || !ticketDetails) return null;

  // Enhanced date formatting with relative time
  const formatDate = (dateString) => {
    if (!dateString) return 'No date available';
    const date = parseISO(dateString);
    return `${new Date(date).toLocaleDateString()} (${formatDistanceToNow(date, { addSuffix: true })})`;
  };

  // Dynamic status and priority mapping
  const statusMap = {
    'active': { label: 'New Proposal', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    'in_review': { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    'rejected': { label: 'Declined', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
  };

  const priorityMap = {
    'low': { label: 'Flexible', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    'medium': { label: 'Standard', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' },
    'high': { label: 'Rush', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent 
        className={`
          sm:max-w-[625px] 
          rounded-xl 
          shadow-2xl 
          transition-all 
          duration-300 
          ${isDarkMode 
            ? 'bg-gradient-to-br from-purple-950 to-purple-900 border-purple-800' 
            : 'bg-gradient-to-br from-purple-50 to-white border-purple-200'
          }
        `}
      >
        <DialogHeader className="border-b pb-4 border-purple-200/30">
          <DialogTitle 
            className={`
              text-2xl 
              font-bold 
              ${isDarkMode 
                ? 'text-purple-200' 
                : 'text-purple-900'
              }
            `}
          >
            Creative Proposal #{ticketDetails.id}
          </DialogTitle>
          <DialogDescription 
            className={`
              text-md 
              ${isDarkMode 
                ? 'text-purple-300' 
                : 'text-purple-700'
              }
            `}
          >
            {ticketDetails.issue_type || 'Innovative Project Concept'}
          </DialogDescription>
        </DialogHeader>

        <div 
          className={`
            space-y-6 
            p-2 
            max-h-[400px] 
            overflow-y-auto 
            pr-3 
            ${isDarkMode ? 'text-purple-100' : 'text-purple-900'}
            custom-scrollbar
          `}
        >
          <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: ${isDarkMode ? 'rgba(126, 34, 206, 0.2)' : 'rgba(126, 34, 206, 0.1)'};
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: ${isDarkMode ? 'rgba(126, 34, 206, 0.5)' : 'rgba(126, 34, 206, 0.3)'};
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: ${isDarkMode ? 'rgba(126, 34, 206, 0.7)' : 'rgba(126, 34, 206, 0.5)'};
            }
          `}</style>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-purple-600 dark:text-purple-300 mb-2">Proposal Status</p>
              <Badge
                variant="outline"
                className={`
                  ${statusMap[ticketDetails.status]?.color || 'bg-gray-100 text-gray-800'}
                  capitalize
                  px-3
                  py-1
                  rounded-full
                `}
              >
                {statusMap[ticketDetails.status]?.label || 'Unknown Status'}
              </Badge>
            </div>
            <div>
              <p className="font-semibold text-purple-600 dark:text-purple-300 mb-2">Project Intensity</p>
              <Badge
                variant="outline"
                className={`
                  ${priorityMap[ticketDetails.priority]?.color || 'bg-gray-100 text-gray-800'}
                  capitalize
                  px-3
                  py-1
                  rounded-full
                `}
              >
                {priorityMap[ticketDetails.priority]?.label || 'Unspecified'}
              </Badge>
            </div>
          </div>
          
          <div>
            <p className="font-semibold mb-2 text-purple-600 dark:text-purple-300">Vision Statement</p>
            <div
              className={`
                p-4
                rounded-lg
                transition-all
                duration-300
                ${isDarkMode
                  ? 'bg-purple-800/50 text-purple-200 border border-purple-700 hover:bg-purple-800/70'
                  : 'bg-purple-100/50 text-purple-900 border border-purple-200 hover:bg-purple-100/70'
                }
              `}
            >
              {ticketDetails.description || 'No creative blueprint shared yet'}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-purple-600 dark:text-purple-300 flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-purple-500" />
                Inception Date
              </p>
              <p
                className={`mt-1 ${
                  isDarkMode ? 'text-purple-300' : 'text-purple-800'
                }`}
              >
                {formatDate(ticketDetails.created_at)}
              </p>
            </div>
            <div>
              <p className="font-semibold text-purple-600 dark:text-purple-300 flex items-center">
                <Clock className="mr-2 h-4 w-4 text-purple-500" />
                Last Update
              </p>
              <p
                className={`mt-1 ${
                  isDarkMode ? 'text-purple-300' : 'text-purple-800'
                }`}
              >
                {formatDate(ticketDetails.last_update)}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4 border-purple-200/30 flex justify-end space-x-2">
          <Button 
            variant="ghost" 
            onClick={() => setIsDialogOpen(false)}
            className={`
              ${isDarkMode 
                ? 'text-purple-300 hover:bg-purple-800 border border-purple-700' 
                : 'text-purple-700 hover:bg-purple-100 border border-purple-200'}
              transition-all 
              duration-300
            `}
          >
            <X className="mr-2 h-4 w-4 text-purple-500" /> 
            Dismiss
          </Button>          
          <Button 
            variant="default" 
            onClick={() => updateTicketStatus("in_progress")}
            className="
              bg-purple-600 
              hover:bg-purple-700 
              text-white 
              transition-all 
              duration-300
            "
          >
            <CheckCircle2 className="mr-2 h-4 w-4" /> 
            Embrace Concept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


TicketDetailsDialog.propTypes = {
  isDialogOpen: PropTypes.bool.isRequired,
  setIsDialogOpen: PropTypes.func.isRequired,
  selectedTicket: PropTypes.object,
  ticketDetails: PropTypes.object,
  isDarkMode: PropTypes.bool,
  updateTicketStatus: PropTypes.func
};

export default TicketDetailsDialog;