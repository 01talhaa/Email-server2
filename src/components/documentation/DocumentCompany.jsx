import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import CreateCompanyModal from './CreateCompanyModal';

const DocumentCompany = () => {
  const [companies, setCompanies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);

      // For now, using a demo company
      const demoCompanies = [
        {
          id: 1,
          name: "Demo Company 1",
          email: "test@gmail.com",
          created_at: new Date().toISOString()
        },
      ];

      setCompanies(demoCompanies);
      setTotalPages(1);
    } catch (error) {
      console.error('Fetch companies error:', error);
      toast.error(error.message);
      setError('Failed to fetch companies');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, itemsPerPage]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Document Companies</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add Company
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center">
                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                    Loading...
                  </td>
                </tr>
              ) : companies.length > 0 ? (
                companies.map((company) => (
                  <tr
                    key={company.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/dashboard/docs/company/${company.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {company.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {company.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {company.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(company.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    No companies found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            {/* ... existing pagination code ... */}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <CreateCompanyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCompanyCreated={() => {
            fetchCompanies();
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default DocumentCompany;