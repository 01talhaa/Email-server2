import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './Navigation';
import EmailList from './EmailList';
import EmailDetail from './EmailDetail';
import Company from './companyPage/Company';
import CompanyDetails from './companyPage/CompanyDetails';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-background">
      <Navigation />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<EmailList />} />
              <Route path="/email/:id" element={<EmailDetail />} />
              <Route path="/company" element={<Company />} />
              <Route path="/company/:id" element={<CompanyDetails />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;