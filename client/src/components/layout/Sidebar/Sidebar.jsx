// components/layout/Sidebar.jsx
import React, { useState } from 'react';
import {
  LayoutDashboard,
  TicketCheck,
  MessageSquare,
  BarChart,
  Settings,
  Users,
  HelpCircle,
  ChevronLeft,
  Menu,
  FileQuestion,
  Clock,
  Bell,
  HeadphonesIcon,
  UserCircle,
  PhoneCall,
  FileText,
  PieChart
} from 'lucide-react';

// User-specific menu configuration
const userMenuConfig = [
  {
    title: 'Support',
    items: [
      {
        name: 'My Tickets',
        icon: TicketCheck,
        path: '/tickets',
        badge: 3
      },
      {
        name: 'New Ticket',
        icon: FileQuestion,
        path: '/new-ticket'
      },
      {
        name: 'Live Chat',
        icon: MessageSquare,
        path: '/chat'
      },
      {
        name: 'Knowledge Base',
        icon: FileText,
        path: '/kb'
      }
    ]
  },
  {
    title: 'Account',
    items: [
      {
        name: 'My Profile',
        icon: UserCircle,
        path: '/profile'
      },
      {
        name: 'Notifications',
        icon: Bell,
        path: '/notifications',
        badge: 2
      },
      {
        name: 'History',
        icon: Clock,
        path: '/history'
      },
      {
        name: 'Settings',
        icon: Settings,
        path: '/settings'
      }
    ]
  }
];

// Agent-specific menu configuration
const agentMenuConfig = [
  {
    title: 'Workspace',
    items: [
      {
        name: 'Dashboard',
        icon: LayoutDashboard,
        path: '/dashboard',
        badge: 5
      },
      {
        name: 'Active Tickets',
        icon: TicketCheck,
        path: '/tickets',
        badge: 12
      },
      {
        name: 'Live Support',
        icon: HeadphonesIcon,
        path: '/support'
      },
      {
        name: 'Chat Queue',
        icon: MessageSquare,
        path: '/chat',
        badge: 3
      }
    ]
  },
  {
    title: 'Analysis',
    items: [
      {
        name: 'Performance',
        icon: BarChart,
        path: '/performance'
      },
      {
        name: 'Statistics',
        icon: PieChart,
        path: '/stats'
      },
      {
        name: 'Call Logs',
        icon: PhoneCall,
        path: '/calls'
      }
    ]
  },
  {
    title: 'Settings',
    items: [
      {
        name: 'Profile',
        icon: Users,
        path: '/profile'
      },
      {
        name: 'Preferences',
        icon: Settings,
        path: '/settings'
      },
      {
        name: 'Help',
        icon: HelpCircle,
        path: '/help'
      }
    ]
  }
];

const SidebarItem = ({ name, icon: Icon, path, isActive, onClick, badge }) => (
  <button
    onClick={() => onClick(path)}
    className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 w-full
      ${isActive
        ? 'bg-gray-100 text-gray-900'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
  >
    <div className="flex items-center">
      <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
      <span className="truncate">{name}</span>
    </div>
    {badge && (
      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {badge}
      </span>
    )}
  </button>
);

const UserProfile = ({ userType, userName }) => (
  <div className="p-4 border-t border-gray-200">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
        {userName?.charAt(0) || 'U'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{userName || 'User Name'}</p>
        <p className="text-xs text-gray-500 truncate capitalize">{userType}</p>
      </div>
    </div>
  </div>
);

const Sidebar = ({ 
  userType = 'user',
  userName = '',
  onNavigate = (path) => console.log('Navigate to:', path)
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentPath, setCurrentPath] = useState('/dashboard');

  const menuConfig = userType === 'agent' ? agentMenuConfig : userMenuConfig;

  const handleNavigation = (path) => {
    setCurrentPath(path);
    onNavigate(path);
  };

  return (
    <div className="relative">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Menu className="h-6 w-6 text-gray-600" />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40
          ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
          lg:translate-x-0 lg:static
          ${isCollapsed ? 'w-0' : 'w-64'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and collapse button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md flex items-center justify-center text-white font-bold">
                {userType === 'agent' ? 'A' : 'S'}
              </div>
              <span className="font-semibold text-gray-900">
                {userType === 'agent' ? 'Agent Portal' : 'Support Center'}
              </span>
            </div>
            <button
              className="hidden lg:block p-1 rounded-md hover:bg-gray-100"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronLeft 
                className={`h-5 w-5 text-gray-500 transition-transform duration-300 
                  ${isCollapsed ? 'rotate-180' : ''}`} 
              />
            </button>
          </div>

          {/* Menu sections */}
          <div className="flex-1 overflow-y-auto py-4">
            {menuConfig.map((section) => (
              <div key={section.title} className="px-3 space-y-1 mb-6">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <SidebarItem
                      key={item.name}
                      name={item.name}
                      icon={item.icon}
                      path={item.path}
                      isActive={currentPath === item.path}
                      onClick={handleNavigation}
                      badge={item.badge}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* User profile section */}
          <UserProfile userType={userType} userName={userName} />
        </div>
      </div>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 transition-opacity lg:hidden z-30"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </div>
  );
};

export default Sidebar;
