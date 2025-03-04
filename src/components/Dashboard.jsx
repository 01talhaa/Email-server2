import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './Navigation';
import EmailList from './DashboardDetails';
import EmailDetail from './EmailDetail';
import Company from './companyPage/Company';
import CompanyDetails from './companyPage/CompanyDetails';
import { useAuth } from '../context/AuthContext';
import DocumentUrl from './documentation/DocumentUrl';
import DocumentCompany from './documentation/DocumentCompany';
import DocumentCompanyDetails from './documentation/DocumentCompanyDetails';
import Subscribe from './Subscribe';


const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex">
      <Navigation />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<EmailList />} />
            <Route path="/email/:id" element={<EmailDetail />} />
            <Route path="/company" element={<Company />} />
            <Route path="/subscribed" element={<Subscribe />} />
            <Route path="/company/:id" element={<CompanyDetails />} />
            <Route path="/docs/url" element={<DocumentUrl />} />
            <Route path="/docs/company" element={<DocumentCompany />} />
            <Route path="/docs/company/:id" element={<DocumentCompanyDetails />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;