import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './Navigation';
import EmailList from './DashboardDetails';
import EmailDetail from './EmailDetail';
import Company from './companyPage/Company';
import CompanyDetails from './companyPage/CompanyDetails';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex">
      <Navigation />
      {/* <div className="flex-1 flex flex-col overflow-hidden"> */}
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
      {/* </div> */}
    </div>
  );
};

export default Dashboard;