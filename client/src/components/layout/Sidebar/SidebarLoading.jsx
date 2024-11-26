import { Skeleton } from "@/components/ui/skeleton";
import PropTypes from 'prop-types';

const SidebarLoading = ({ isDarkMode }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header Loading Skeleton */}
      <div className="p-3 border-b border-purple-100 dark:border-purple-900/50 flex items-center justify-between">
        <div className="flex items-center space-x-3 w-full">
          <Skeleton className={`h-6 w-24 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className="ml-auto">
            <Skeleton className={`h-6 w-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          </div>
        </div>
      </div>

      {/* Menu Items Loading Skeleton */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="flex items-center space-x-3">
            <Skeleton className={`h-5 w-5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <Skeleton className={`h-6 w-32 flex-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          </div>
        ))}
      </nav>

      {/* Footer User Profile Loading Skeleton */}
      <div className="border-t border-purple-100 dark:border-purple-900/50 p-4 mt-auto">
        <div className="flex items-center space-x-3">
          <Skeleton className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className="flex-1 space-y-2">
            <Skeleton className={`h-4 w-24 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <Skeleton className={`h-3 w-32 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

SidebarLoading.propTypes = {
  isDarkMode: PropTypes.bool.isRequired
};

export default SidebarLoading;