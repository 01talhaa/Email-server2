import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddCompanyModal from './AddCompanyModal';
import EditCompanyModal from './EditCompanyModal';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faEye,
  faSpinner,
  faBuilding,
  faTrash, // Add this
  faBell, // Add this
  faCheck,
  faBellSlash
} from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = 'https://email.jumpintojob.com/api/v1';

const Company = () => {
  const [companies, setCompanies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const savedItemsPerPage = localStorage.getItem('itemsPerPage');
    return savedItemsPerPage ? parseInt(savedItemsPerPage) : 10;
  });
  const [subscriptionStatus, setSubscriptionStatus] = useState({});
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('No authentication token found');
      }

      const parsedUser = JSON.parse(userData);
      const token = parsedUser.token || parsedUser.access_token;

      if (!token) {
        throw new Error('Invalid token');
      }

      const response = await fetch(`${API_BASE_URL}/companies?page=${currentPage}&limit=${itemsPerPage}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      console.log('API Response:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch companies');
      }

      // Update to match the actual API response structure
      if (data.result && Array.isArray(data.result)) {
        setCompanies(data.result);
        setTotalPages(data.meta?.totalPage || 1);
      } else {
        console.error('Unexpected API response structure:', data);
        throw new Error('Invalid API response format');
      }

      setError(null);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
      toast.error(error.message);
      setCompanies([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCompany = async (companyData) => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('No authentication token found');
      }

      const parsedUser = JSON.parse(userData);
      const token = parsedUser.token || parsedUser.access_token;

      const response = await fetch(`${API_BASE_URL}/companies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create company');
      }

      // Close modal first
      setIsModalOpen(false);

      // Show success message
      toast.success(data.message || 'Company created successfully');

      // Then refresh the companies list
      setCurrentPage(1);
      fetchCompanies();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEditCompany = async (id, companyData) => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('No authentication token found');
      }

      const parsedUser = JSON.parse(userData);
      const token = parsedUser.token || parsedUser.access_token;

      const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update company');
      }

      toast.success(data.message || 'Company updated successfully');
      setCurrentPage(1); // Reset to first page
      fetchCompanies(); // Refresh the list
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteCompany = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company?')) {
      return;
    }

    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('No authentication token found');
      }

      const parsedUser = JSON.parse(userData);
      const token = parsedUser.token || parsedUser.access_token;

      const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete company');
      }

      toast.success('Company deleted successfully');
      fetchCompanies(); // Refresh the list
    } catch (error) {
      toast.error(error.message);
      console.error('Delete error:', error);
    }
  };

  // Update the handleSubscribe function to properly work with the API
  const handleSubscribe = async (company) => {
    try {
      setIsLoading(true);

      // Get token for authentication
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('No authentication token found');
      }

      const parsedUser = JSON.parse(userData);
      const token = parsedUser.token || parsedUser.access_token;

      // If already subscribed, unsubscribe
      if (subscriptionStatus[company.id]) {
        return handleUnsubscribe(company);
      }

      // Ask for email address (default to company's email if available)
      const email = prompt(
        "Enter email address for subscription:",
        company.email || ""
      );

      if (!email) {
        toast.info("Subscription cancelled");
        return;
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      console.log("Subscribing with payload:", {
        company_id: company.id,
        email: email
      });

      // Make API call
      const response = await fetch(`${API_BASE_URL}/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: company.id,
          email: email
        })
      });

      const data = await response.json();
      console.log("Subscribe API response:", data);

      if (!response.ok) {
        if (data.message && data.message.includes('email has already been taken')) {
          toast.info('This email is already subscribed to this company');

          // Update UI to show "Unsubscribe"
          setSubscriptionStatus(prev => ({
            ...prev,
            [company.id]: true
          }));

          return;
        }
        throw new Error(data.message || 'Failed to subscribe');
      }

      toast.success(data.message || 'Successfully subscribed');

      // Update subscription status immediately
      setSubscriptionStatus(prev => ({
        ...prev,
        [company.id]: true
      }));

      // Store subscription info in session storage as backup
      try {
        const subscriptions = JSON.parse(sessionStorage.getItem('subscriptions') || '{}');
        subscriptions[company.id] = true;
        sessionStorage.setItem('subscriptions', JSON.stringify(subscriptions));
      } catch (e) {
        console.error('Error storing subscription in session:', e);
      }

      // Refresh the subscription status from API
      checkSubscriptionStatus();

    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(error.message || 'Failed to subscribe');
    } finally {
      setIsLoading(false);
    }
  };

  // Fix the unsubscribe function according to API requirements
  const handleUnsubscribe = async (company) => {
    try {
      setIsLoading(true);

      // Get token for authentication
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('No authentication token found');
      }

      const parsedUser = JSON.parse(userData);
      const token = parsedUser.token || parsedUser.access_token;

      // First, fetch company subscribers to find the correct email to unsubscribe
      const subscribersResponse = await fetch(`${API_BASE_URL}/subscribers?company_id=${company.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!subscribersResponse.ok) {
        const errorData = await subscribersResponse.json();
        throw new Error(errorData.message || 'Failed to fetch subscribers');
      }

      const subscribersData = await subscribersResponse.json();
      console.log("Fetched subscribers data:", subscribersData);

      // Extract subscribers based on different possible API response structures
      let subscribers = [];
      if (subscribersData.data && Array.isArray(subscribersData.data.result)) {
        subscribers = subscribersData.data.result;
      } else if (Array.isArray(subscribersData.data)) {
        subscribers = subscribersData.data;
      } else if (Array.isArray(subscribersData.result)) {
        subscribers = subscribersData.result;
      } else {
        console.error('Unexpected subscribers response format:', subscribersData);
        subscribers = [];
      }

      console.log("Parsed subscribers:", subscribers);

      if (subscribers.length === 0) {
        toast.error('No subscriptions found for this company');

        // Update UI to show "Subscribe" since there are no subscriptions
        setSubscriptionStatus(prev => ({
          ...prev,
          [company.id]: false
        }));

        return;
      }

      // If multiple subscriptions, let the user choose which one to unsubscribe
      let emailToUnsubscribe;

      if (subscribers.length === 1) {
        // If only one subscription, use that email
        emailToUnsubscribe = subscribers[0].email;
      } else {
        // Create a list of subscriber emails to show in prompt
        const emailList = subscribers.map(sub => sub.email).join('\n');

        // Ask which email to unsubscribe
        emailToUnsubscribe = prompt(
          `Multiple subscriptions found. Enter the email to unsubscribe:\n${emailList}`,
          subscribers[0].email
        );

        if (!emailToUnsubscribe) {
          toast.info("Unsubscribe cancelled");
          return;
        }
      }

      // Confirm unsubscription
      if (!window.confirm(`Are you sure you want to unsubscribe ${emailToUnsubscribe}?`)) {
        return;
      }

      console.log("Unsubscribing with payload:", {
        email: emailToUnsubscribe
      });

      // Make API call to unsubscribe (API endpoint only needs the email, not company_id)
      const response = await fetch(`${API_BASE_URL}/unsubscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailToUnsubscribe
        })
      });

      const data = await response.json();
      console.log("Unsubscribe API response:", data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to unsubscribe');
      }

      toast.success(data.message || 'Successfully unsubscribed');

      // Update subscription status immediately in UI
      setSubscriptionStatus(prev => ({
        ...prev,
        [company.id]: false
      }));

      // Update sessionStorage
      try {
        const subscriptions = JSON.parse(sessionStorage.getItem('subscriptions') || '{}');
        subscriptions[company.id] = false;
        sessionStorage.setItem('subscriptions', JSON.stringify(subscriptions));
      } catch (e) {
        console.error('Error updating subscription in session:', e);
      }

      // Refresh the subscription status from API
      checkSubscriptionStatus();

    } catch (error) {
      console.error('Unsubscribe error:', error);
      toast.error(error.message || 'Failed to unsubscribe');
    } finally {
      setIsLoading(false);
    }
  };

  // Update the checkSubscriptionStatus function to properly check if ANY email is subscribed
  const checkSubscriptionStatus = async () => {
    if (companies.length === 0) return;

    try {
      console.log('Starting subscription status check...');
      const userData = localStorage.getItem('user');
      if (!userData) {
        console.error('No user data found in localStorage');
        return;
      }

      const parsedUser = JSON.parse(userData);
      const token = parsedUser.token || parsedUser.access_token;

      // Create a new object to store subscription status
      const newStatus = {};

      // For each company, check if there are any subscribers (don't filter by user email)
      for (const company of companies) {
        try {
          const response = await fetch(`${API_BASE_URL}/subscribers?company_id=${company.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });

          const data = await response.json();
          console.log(`Subscription data for company ${company.id}:`, data);

          if (response.ok) {
            // Extract subscribers based on different possible API response structures
            let subscribers = [];

            if (data.data && Array.isArray(data.data.result)) {
              subscribers = data.data.result;
            } else if (Array.isArray(data.data)) {
              subscribers = data.data;
            } else if (Array.isArray(data.result)) {
              subscribers = data.result;
            }

            // Check if there are any enabled subscribers
            const hasActiveSubscribers = subscribers.length > 0 &&
              subscribers.some(sub => sub.enabled === true || sub.enabled === 1);

            console.log(`Company ${company.id} has active subscribers:`, hasActiveSubscribers);
            newStatus[company.id] = hasActiveSubscribers;
          }
        } catch (err) {
          console.error(`Error checking subscription for company ${company.id}:`, err);
        }
      }

      console.log('Final subscription status:', newStatus);
      setSubscriptionStatus(newStatus);

      // Store the updated status in sessionStorage
      sessionStorage.setItem('subscriptions', JSON.stringify(newStatus));

    } catch (error) {
      console.error('Error in checkSubscriptionStatus:', error);
    }
  };

  const handleEditClick = (company) => {
    setSelectedCompany(company);
    setIsEditModalOpen(true);
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    localStorage.setItem('itemsPerPage', newItemsPerPage.toString());
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Update the useEffect to call checkSubscriptionStatus on initial load and refreshes
  useEffect(() => {
    const fetchData = async () => {
      await fetchCompanies();
      if (companies.length > 0) {
        await checkSubscriptionStatus();
      }
    };

    fetchData();
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      console.log('Stored token:', parsedUser.token || parsedUser.access_token);
    }
  }, []);

  // Add separate useEffect to restore subscriptions from sessionStorage
  useEffect(() => {
    try {
      const storedSubscriptions = JSON.parse(sessionStorage.getItem('subscriptions') || '{}');
      if (Object.keys(storedSubscriptions).length > 0) {
        setSubscriptionStatus(prev => ({
          ...prev,
          ...storedSubscriptions
        }));
      }
    } catch (e) {
      console.error('Error restoring subscriptions from session:', e);
    }
  }, []);

  // Add a new helper function to check the stored subscription status
  const getStoredSubscriptionStatus = () => {
    try {
      return JSON.parse(sessionStorage.getItem('subscriptions') || '{}');
    } catch (e) {
      console.error('Error reading stored subscriptions:', e);
      return {};
    }
  };

  // Update the useEffect for initial load to be more reliable
  useEffect(() => {
    const initialize = async () => {
      // First, try to restore from session storage
      const storedSubscriptions = getStoredSubscriptionStatus();
      if (Object.keys(storedSubscriptions).length > 0) {
        setSubscriptionStatus(storedSubscriptions);
      }

      // Then fetch companies
      await fetchCompanies();

      // After companies are loaded, try to check subscription status
      if (companies.length > 0) {
        checkSubscriptionStatus();
      }
    };

    initialize();
  }, []);

  // Add a separate useEffect that only depends on companies change
  useEffect(() => {
    if (companies.length > 0) {
      checkSubscriptionStatus();
    }
  }, [companies]);

  return (
    <div className="">
      <div className="">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            Companies
          </h1>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded-md focus:outline-none focus:shadow-outline flex items-center"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add Company
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <FontAwesomeIcon
              icon={faSpinner}
              className="animate-spin text-blue-500 text-4xl"
            />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-200">
              <div className="text-sm text-gray-500">
                {companies.length > 0 ? (
                  `Showing ${((currentPage - 1) * itemsPerPage) + 1} to ${Math.min(currentPage * itemsPerPage, ((currentPage - 1) * itemsPerPage) + companies.length)
                  } of ${companies.length} companies`
                ) : (
                  'No companies found'
                )}
              </div>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Created At
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.map((company) => (
                  <tr
                    key={company.id}
                    className="hover:bg-gray-100 cursor-pointer"
                    onClick={() => navigate(`/dashboard/company/${company.id}`)}
                  >
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {company.id}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {company.name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {company.email}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {new Date(company.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(company);
                          }}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          <FontAwesomeIcon icon={faEdit} className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCompany(company.id);
                          }}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <FontAwesomeIcon icon={faTrash} className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubscribe(company);
                          }}
                          className={`flex items-center ${subscriptionStatus[company.id]
                            ? 'text-red-600 hover:text-red-900'
                            : 'text-blue-600 hover:text-blue-900'
                            }`}
                        >
                          <FontAwesomeIcon
                            icon={subscriptionStatus[company.id] ? faBellSlash : faBell}
                            className="h-4 w-4 mr-1"
                          />
                          {subscriptionStatus[company.id] ? 'Unsubscribe' : 'Subscribe'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    page {currentPage} of {totalPages}
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
        )}

        {isModalOpen && (
          <AddCompanyModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleAddCompany}
          />
        )}
        {isEditModalOpen && (
          <EditCompanyModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedCompany(null);
            }}
            onSubmit={handleEditCompany}
            company={selectedCompany}
          />
        )}
      </div>
    </div>
  );
};

export default Company;