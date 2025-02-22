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
    faBuilding
} from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = 'https://email.jumpintojob.com/api/v1';

const Company = () => {
    const [companies, setCompanies] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
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

            const response = await fetch(`${API_BASE_URL}/companies`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch companies');
            }

            setCompanies(data.result || []);
            setError(null);
        } catch (error) {
            console.error('Fetch error:', error);
            setError(error.message);
            toast.error(error.message);
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

            toast.success(data.message || 'Company created successfully');
            setIsModalOpen(false);
            fetchCompanies(); // Refresh the list
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
            fetchCompanies(); // Refresh the list
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleEditClick = (company) => {
        setSelectedCompany(company);
        setIsEditModalOpen(true);
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            console.log('Stored token:', parsedUser.token || parsedUser.access_token);
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
            <div className="relative py-3 sm:max-w-5xl sm:mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-semibold text-gray-900 flex items-center">
                                <FontAwesomeIcon icon={faBuilding} className="mr-3 text-gray-600" />
                                Companies
                            </h1>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-md focus:outline-none focus:shadow-outline flex items-center"
                            >
                                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                Add Company
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-500 text-4xl" />
                            </div>
                        ) : error ? (
                            <div className="text-red-500 text-center py-4">{error}</div>
                        ) : (
                            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {companies.map((company) => (
                                            <tr key={company.id} className="hover:bg-gray-100">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{company.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{company.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(company.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => navigate(`/dashboard/company/${company.id}`)}
                                                            className="text-blue-600 hover:text-blue-900 flex items-center"
                                                        >
                                                            <FontAwesomeIcon icon={faEye} className="mr-1" />
                                                            View
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditClick(company)}
                                                            className="text-green-600 hover:text-green-900 flex items-center"
                                                        >
                                                            <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                                            Edit
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
            </div>
        </div>
    );
};

export default Company;