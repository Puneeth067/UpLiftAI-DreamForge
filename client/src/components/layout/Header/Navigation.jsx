// components/layout/Header/Navigation.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Ticket, BarChart2, User } from 'lucide-react';

const Navigation = ({ userType }) => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home, allowedTypes: ['customer'] },
    { name: 'Tickets', path: '/tickets', icon: Ticket, allowedTypes: ['customer', 'agent'] },
    { name: 'Analytics', path: '/analytics', icon: BarChart2, allowedTypes: ['agent'] },
    { name: 'Profile', path: '/profile', icon: User, allowedTypes: ['customer', 'agent'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.allowedTypes.includes(userType || '')
  );

  return (
    <nav className="ml-6">
      <ul className="flex space-x-4">
        {filteredNavItems.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
