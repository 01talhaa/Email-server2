import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, InboxIcon, BuildingOffice2Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-gray-800 w-64 min-h-screen flex flex-col">
      <div className="flex items-center justify-center h-16 bg-gray-900">
        <span className="text-white font-bold text-lg">Admin Dashboard</span>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <ul className="flex flex-col py-4">
          <li>
            <Link
              to="/dashboard"
              className={`flex items-center px-6 py-3 rounded-md ${
                location.pathname === '/dashboard' ? 'bg-gray-900 text-white' : 'text-gray-100 hover:bg-gray-700'
              }`}
            >
              <InboxIcon className="h-5 w-5 mr-3" />
              Emails
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/company"
              className={`flex items-center px-6 py-3 rounded-md ${
                location.pathname.includes('/dashboard/company') ? 'bg-gray-900 text-white' : 'text-gray-100 hover:bg-gray-700'
              }`}
            >
              <BuildingOffice2Icon className="h-5 w-5 mr-3" />
              Company
            </Link>
          </li>
        </ul>
      </div>
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;