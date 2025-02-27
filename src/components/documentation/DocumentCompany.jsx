import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faEdit } from '@fortawesome/free-solid-svg-icons';
import CreateCompanyModal from './CreateCompanyModal';
import EditCompanyModal from './EditCompanyModal';

const API_BASE_URL = 'https://core.qualitees.co.uk/api';

const DocumentCompany = () => {
  const [companies, setCompanies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    return parseInt(localStorage.getItem('docItemsPerPage') || '10');
  });
  const [editingCompany, setEditingCompany] = useState(null);
  const navigate = useNavigate();

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/companies?page=${currentPage}&limit=${itemsPerPage}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }

      const data = await response.json();

      if (data.meta && data.result) {
        setCompanies(data.result);
        setTotalItems(data.meta.total);
        setTotalPages(data.meta.totalPage);

        // If current page is greater than total pages, reset to page 1
        if (currentPage > data.meta.totalPage) {
          setCurrentPage(1);
        }
      }
    } catch (error) {
      console.error('Fetch companies error:', error);
      toast.error('Failed to fetch companies');
      setError('Failed to fetch companies');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, itemsPerPage]);

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    localStorage.setItem('docItemsPerPage', newItemsPerPage.toString());
    setCurrentPage(1);
  };

  const handleEditClick = (company) => {
    setEditingCompany(company);
  };

  const getEntriesText = () => {
    if (companies.length === 0) return 'No companies found';

    const start = ((currentPage - 1) * itemsPerPage) + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    return `Showing ${start} to ${end} of ${totalItems} companies`;
  };

  return (
    <div className="">
      <div className="">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Document Companies</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5 mr-1.5" />
            Add Company
          </button>
        </div>

        {/* Table Section */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Add this new section for showing entries count */}
          <div className="px-4 py-2 border-b border-gray-200">
            <div className="text-xs text-gray-500">
              {getEntriesText()}
            </div>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-2 text-center">
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
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">{company.id}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">{company.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">{company.email}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">
                      {new Date(company.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(company);
                        }}
                        className="text-green-600 hover:text-green-900 flex items-center"
                      >
                        <FontAwesomeIcon icon={faEdit} className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-2 text-center text-xs text-gray-500">
                    No companies found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  {companies.length > 0 ? (
                    `Showing ${((currentPage - 1) * itemsPerPage) + 1} to ${Math.min(currentPage * itemsPerPage, ((currentPage - 1) * itemsPerPage) + companies.length)
                    } of ${companies.length} companies`
                  ) : (
                    'No companies found'
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
                    Show per page:
                  </label>
                  <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="border border-gray-300 rounded-md text-sm py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || isLoading}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${currentPage === 1 || isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                >
                  Previous
                </button>
                <div className="flex items-center space-x-2">
                  {totalPages > 0 && [...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Show only current page and 2 pages before and after
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          disabled={isLoading}
                          className={`px-4 py-2 text-sm font-medium rounded-md ${currentPage === pageNumber
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                    // Add ellipsis if there's a gap
                    if (
                      pageNumber === currentPage - 3 ||
                      pageNumber === currentPage + 3
                    ) {
                      return <span key={pageNumber} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || isLoading}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${currentPage === totalPages || isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
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

      {editingCompany && (
        <EditCompanyModal
          isOpen={!!editingCompany}
          onClose={() => setEditingCompany(null)}
          company={editingCompany}
          onCompanyUpdated={() => {
            fetchCompanies();
            setEditingCompany(null);
          }}
        />
      )}
    </div>
  );
};

export default DocumentCompany;