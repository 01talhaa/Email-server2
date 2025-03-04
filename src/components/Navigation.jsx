import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  InboxIcon,
  BuildingOffice2Icon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EnvelopeIcon,
  DocumentIcon,
  BellIcon // Added for subscribed notifications
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [expandedSections, setExpandedSections] = useState({
    email: location.pathname.includes('/dashboard') && !location.pathname.includes('/docs'),
    document: location.pathname.includes('/dashboard/docs')
  });

  const menuStructure = [
    {
      id: 'email',
      label: 'Email Microservice',
      icon: EnvelopeIcon,
      children: [
        { path: '/dashboard', icon: InboxIcon, label: 'Email Url and Payload' },
        { path: '/dashboard/company', icon: BuildingOffice2Icon, label: 'Email Companies' },
        // { path: '/dashboard/subscribed', icon: BellIcon, label: 'Subscribed' }, 
      ]
    },
    {
      id: 'document',
      label: 'Document Microservice',
      icon: DocumentIcon,
      children: [
        { path: '/dashboard/docs/url', icon: DocumentTextIcon, label: 'Document Url and Payload' },
        { path: '/dashboard/docs/company', icon: DocumentTextIcon, label: 'Document Companies' }
      ]
    }
  ];

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.includes(path);
  };

  return (
    <nav className="bg-gradient-to-b from-gray-900 to-gray-800 w-64 min-h-screen flex flex-col shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-center h-14 bg-gray-900/50 border-b border-gray-700">
        <span className="text-white font-bold text-lg tracking-wider">
          Microservices
        </span>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuStructure.map((section) => (
            <li key={section.id} className="mb-1">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-all duration-200 ease-in-out text-xs
                  ${location.pathname.includes(`/${section.id}`) || 
                    (section.id === 'email' && !location.pathname.includes('/docs'))
                    ? 'bg-gray-700/50 text-white'
                    : 'text-gray-300 hover:bg-gray-700/30 hover:text-white'
                  }`}
              >
                <div className="flex items-center">
                  <section.icon className="h-4 w-4 mr-2.5" />
                  <span className="font-medium">{section.label}</span>
                </div>
                {expandedSections[section.id] ? 
                  <ChevronDownIcon className="h-3 w-3" /> : 
                  <ChevronRightIcon className="h-3 w-3" />
                }
              </button>

              {/* Section Children */}
              {expandedSections[section.id] && (
                <ul className="mt-1 ml-4 space-y-1 border-l border-gray-700 pl-2">
                  {section.children.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ease-in-out text-xs
                            ${isActive(item.path)
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                            }`}
                        >
                          <Icon className={`h-4 w-4 mr-2 transition-transform duration-200 
                            ${isActive(item.path) ? 'transform scale-110' : ''}`}
                          />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer with Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center justify-center w-full px-3 py-2 text-xs font-medium
            text-white bg-red-600/90 rounded-lg hover:bg-red-700 
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;