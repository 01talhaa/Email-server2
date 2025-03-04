import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faTrash, faBell } from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = 'https://email.jumpintojob.com/api/v1';

const Subscribe = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    return parseInt(localStorage.getItem('subscribeItemsPerPage') || '10');
  });

  // Add state to track selected company
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [companies, setCompanies] = useState([]);

  // Add function to fetch companies
  const fetchCompanies = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('No authentication token found');
      }

      const parsedUser = JSON.parse(userData);
      const token = parsedUser.token || parsedUser.access_token;

      const response = await fetch(`${API_BASE_URL}/companies`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch companies');
      }

      if (data.data) {
        setCompanies(data.data);
        // Select first company by default if available
        if (data.data.length > 0 && !selectedCompanyId) {
          setSelectedCompanyId(data.data[0].id.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  // Update the fetchSubscriptions function to include company_id
  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('No authentication token found');
      }

      const parsedUser = JSON.parse(userData);
      const token = parsedUser.token || parsedUser.access_token;

      // Don't fetch if no company is selected
      if (!selectedCompanyId) {
        setSubscriptions([]);
        setTotalPages(1);
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/subscribers?company_id=${selectedCompanyId}&page=${currentPage}&limit=${itemsPerPage}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      const data = await response.json();
      console.log('Subscribers response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch subscriptions');
      }

      if (data.data && data.data.result) {
        setSubscriptions(data.data.result);
        setTotalPages(data.data.meta.totalPage || 1);
      } else if (data.success && data.data) {
        // Handle case where data might be directly in data property
        const subscribersData = Array.isArray(data.data) ? data.data : [];
        setSubscriptions(subscribersData);
        setTotalPages(1);
      } else {
        setSubscriptions([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async (id) => {
    if (!window.confirm('Are you sure you want to unsubscribe?')) {
      return;
    }

    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('No authentication token found');
      }

      const parsedUser = JSON.parse(userData);
      const token = parsedUser.token || parsedUser.access_token;

      const response = await fetch(`${API_BASE_URL}/subscribe/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to unsubscribe');
      }

      toast.success('Successfully unsubscribed');
      fetchSubscriptions();
    } catch (error) {
      console.error('Unsubscribe error:', error);
      toast.error(error.message);
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    localStorage.setItem('subscribeItemsPerPage', newItemsPerPage.toString());
    setCurrentPage(1);
  };

  // Update the useEffect to fetch companies first
  useEffect(() => {
    fetchCompanies();
  }, []);

  // Update the useEffect for subscriptions to depend on selectedCompanyId
  useEffect(() => {
    if (selectedCompanyId) {
      fetchSubscriptions();
    }
  }, [currentPage, itemsPerPage, selectedCompanyId]);

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Subscriptions</h1>

          <div className="flex items-center space-x-4">
            <label htmlFor="companySelector" className="text-sm text-gray-600">
              Select Company:
            </label>
            <select
              id="companySelector"
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="border border-gray-300 rounded-md text-sm py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a company</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>

            <button
              onClick={fetchSubscriptions}
              disabled={!selectedCompanyId}
              className={`px-3 py-1 text-sm font-medium rounded-md
                ${!selectedCompanyId
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
            >
              Refresh
            </button>
          </div>
        </div>

        {!selectedCompanyId && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 mb-4 rounded-md">
            <p className="text-sm">Please select a company to view its subscribers.</p>
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-200">
            <div className="text-sm text-gray-500">
              {subscriptions.length > 0 ? (
                `Showing ${((currentPage - 1) * itemsPerPage) + 1} to ${Math.min(currentPage * itemsPerPage, ((currentPage - 1) * itemsPerPage) + subscriptions.length)} of ${subscriptions.length} subscriptions`
              ) : (
                'No subscriptions found'
              )}
            </div>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-4 text-center">
                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                    Loading...
                  </td>
                </tr>
              ) : subscriptions.length > 0 ? (
                subscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">{subscription.id}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{subscription.company_id}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{subscription.email}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${subscription.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {subscription.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {new Date(subscription.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium">
                      <button
                        onClick={() => handleUnsubscribe(subscription.id)}
                        className="text-red-600 hover:text-red-900 flex items-center"
                      >
                        <FontAwesomeIcon icon={faTrash} className="h-4 w-4 mr-1" />
                        Unsubscribe
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-4 text-center text-sm text-gray-500">
                    No subscriptions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
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
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                >
                  Previous
                </button>
                <div className="flex items-center space-x-2">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-4 py-2 text-sm font-medium rounded-md ${currentPage === index + 1
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${currentPage === totalPages
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
    </div>
  );
};

export default Subscribe;