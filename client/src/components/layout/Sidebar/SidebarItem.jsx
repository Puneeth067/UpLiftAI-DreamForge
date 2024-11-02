import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

const SidebarItem = ({ name, icon: Icon, path, isActive }) => {
  return (
    <Link
      to={path}
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
        isActive
          ? 'bg-gray-100 text-gray-900'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-gray-500' : 'text-gray-400'}`} />
      {name}
    </Link>
  );
};

export default SidebarItem;
