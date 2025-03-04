import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import SendEmailModal from './modals/SendEmailModal';
import CreateDraftModal from './modals/CreateDraftModal';
import CreateSmtpModal from './modals/CreateSmtpModal';
import CreateTemplateModal from './modals/CreateTemplateModal';
import EditTemplateModal from './modals/EditTemplateModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEnvelope,
    faInbox,
    faFileAlt,
    faCog,
    faPaperPlane,
    faPlusCircle,
    faSyncAlt,
    faArrowLeft,
    faSpinner,
    faFileCode,
    faEdit,
    faTrash
} from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = 'https://email.jumpintojob.com/api/v1';

const getAuthToken = () => {
    const userData = localStorage.getItem('user');
    if (!userData) {
        throw new Error('No authentication token found');
    }
    const parsedUser = JSON.parse(userData);
    const token = parsedUser.token || parsedUser.access_token;
    if (!token) {
        throw new Error('Invalid token');
    }
    return token;
};

const PaginationControls = ({ tab, pagination, onPageChange, onItemsPerPageChange }) => {
    const { currentPage, totalPages, itemsPerPage } = pagination[tab];

    return (
        <div className="px-2 py-2 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                    </span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(tab, e.target.value)}
                        className="border border-gray-300 rounded-md text-sm py-1 px-2"
                    >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onPageChange(tab, currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-md text-sm ${currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => onPageChange(tab, currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded-md text-sm ${currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

const CompanyDetails = () => {
    const [company, setCompany] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('sent');
    const [showSendEmailModal, setShowSendEmailModal] = useState(false);
    const [showDraftModal, setShowDraftModal] = useState(false);
    const [showSmtpModal, setShowSmtpModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
    const [selectedDraft, setSelectedDraft] = useState(null);
    const [smtpConfigs, setSmtpConfigs] = useState([]);
    const [selectedSmtp, setSelectedSmtp] = useState(null);
    const [selectedHostFilter, setSelectedHostFilter] = useState('all');
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const [pagination, setPagination] = useState({
        sent: { currentPage: 1, totalPages: 1, itemsPerPage: 10 },
        inbox: { currentPage: 1, totalPages: 1, itemsPerPage: 10 },
        drafts: { currentPage: 1, totalPages: 1, itemsPerPage: 10 },
        smtp: { currentPage: 1, totalPages: 1, itemsPerPage: 10 },
        templates: { currentPage: 1, totalPages: 1, itemsPerPage: 10 } // Add this line
    });

    const handlePageChange = (tab, newPage) => {
        setPagination(prev => ({
            ...prev,
            [tab]: { ...prev[tab], currentPage: newPage }
        }));
    };

    const handleItemsPerPageChange = (tab, newValue) => {
        setPagination(prev => ({
            ...prev,
            [tab]: { ...prev[tab], itemsPerPage: parseInt(newValue), currentPage: 1 }
        }));
    };

    const { id } = useParams();
    const navigate = useNavigate();
    const [emailLogs, setEmailLogs] = useState({ sent: [], inbox: [] });
    const [draftLogs, setDraftLogs] = useState([]);
    const [smtpLogs, setSmtpLogs] = useState([]);
    const [drafts, setDrafts] = useState([]);
    const [inboxEmails, setInboxEmails] = useState([]);

    const fetchCompanyDetails = async () => {
        setIsLoading(true);
        try {
            const userData = localStorage.getItem('user');
            if (!userData) {
                throw new Error('No authentication token found');
            }

            const parsedUser = JSON.parse(userData);
            const token = parsedUser.token || parsedUser.access_token;

            const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch company details');
            }

            setCompany(data.data);
        } catch (error) {
            toast.error(error.message);
            console.error('Error fetching company details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Update fetchDrafts
    const fetchDrafts = async () => {
        try {
            const token = getAuthToken();
            const { currentPage, itemsPerPage } = pagination.drafts;

            const response = await fetch(`${API_BASE_URL}/emails?company_id=${id}&page=${currentPage}&limit=${itemsPerPage}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch drafts');
            }

            if (data.success && data.data) {
                setDrafts(data.data.result);
                setPagination(prev => ({
                    ...prev,
                    drafts: {
                        ...prev.drafts,
                        totalPages: data.data.meta.totalPage || 1
                    }
                }));
            }
        } catch (error) {
            console.error('Drafts fetch error:', error);
            toast.error(error.message);
            setDrafts([]);
        }
    };

    // Update fetchSmtpConfigs
    const fetchSmtpConfigs = async () => {
        try {
            const token = getAuthToken();
            const { currentPage, itemsPerPage } = pagination.smtp;

            const response = await fetch(`${API_BASE_URL}/smtp?company_id=${id}&page=${currentPage}&limit=${itemsPerPage}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch SMTP configs');
            }

            if (data.success && data.data) {
                setSmtpConfigs(data.data.result);
                setPagination(prev => ({
                    ...prev,
                    smtp: {
                        ...prev.smtp,
                        totalPages: data.data.meta.totalPage || 1
                    }
                }));
            }
        } catch (error) {
            console.error('SMTP fetch error:', error);
            toast.error(error.message);
            setSmtpConfigs([]);
        }
    };

    // First, modify the fetchSentEmails function to use the email-logs endpoint
    const fetchSentEmails = async () => {
        try {
            const token = getAuthToken();
            const { currentPage, itemsPerPage } = pagination.sent;

            const response = await fetch(`${API_BASE_URL}/email-logs?company_id=${id}&page=${currentPage}&limit=${itemsPerPage}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch sent emails');
            }

            if (data.success && data.data && Array.isArray(data.data.result)) {
                // Filter only successful emails for sent tab
                const sentEmails = data.data.result.filter(email => email.status !== 'failed');

                setEmailLogs(prev => ({
                    ...prev,
                    sent: sentEmails
                }));

                if (data.data?.meta) {
                    setPagination(prev => ({
                        ...prev,
                        sent: {
                            ...prev.sent,
                            totalPages: data.data.meta.totalPage || 1
                        }
                    }));
                }
            }
        } catch (error) {
            console.error('Sent emails fetch error:', error);
            toast.error(error.message);
            setEmailLogs(prev => ({ ...prev, sent: [] }));
        }
    };

    // Update fetchInboxEmails
    const fetchInboxEmails = async () => {
        try {
            const token = getAuthToken();
            const { currentPage, itemsPerPage } = pagination.inbox;

            const response = await fetch(`${API_BASE_URL}/email-logs?company_id=${id}&page=${currentPage}&limit=${itemsPerPage}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch inbox emails');
            }

            if (data.success && data.data) {
                setInboxEmails(data.data.result);
                setPagination(prev => ({
                    ...prev,
                    inbox: {
                        ...prev.inbox,
                        totalPages: data.data.meta.totalPage || 1
                    }
                }));
            }
        } catch (error) {
            console.error('Inbox emails fetch error:', error);
            toast.error(error.message);
            setInboxEmails([]);
        }
    };

    // Add fetchTemplates function
    const fetchTemplates = async () => {
        try {
            const token = getAuthToken();
            const { currentPage, itemsPerPage } = pagination.templates;

            const response = await fetch(`${API_BASE_URL}/templates?company_id=${id}&page=${currentPage}&limit=${itemsPerPage}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch templates');
            }

            if (data.success && data.data) {
                setTemplates(data.data.result || []);
                setPagination(prev => ({
                    ...prev,
                    templates: {
                        ...prev.templates,
                        totalPages: data.data.meta?.totalPage || 1
                    }
                }));
            }
        } catch (error) {
            console.error('Templates fetch error:', error);
            toast.error(error.message);
            setTemplates([]);
        }
    };

    const getUniqueHosts = () => {
        const uniqueHosts = [...new Set(smtpConfigs.map(smtp => smtp.host))];
        return ['all', ...uniqueHosts];
    };

    useEffect(() => {
        const checkAuthAndFetchData = async () => {
            try {
                if (!id) return;

                const token = getAuthToken(); // This will throw if token is invalid
                await fetchCompanyDetails();
                await fetchDrafts();
            } catch (error) {
                if (error.message.includes('token')) {
                    toast.error('Session expired. Please login again.');
                    navigate('/login');
                }
            }
        };

        checkAuthAndFetchData();
    }, [id]);

    useEffect(() => {
        if (activeTab === 'sent') {
            fetchSentEmails();
        }
    }, [id, activeTab]);

    useEffect(() => {
        if (activeTab === 'smtp') {
            fetchSmtpConfigs();
        }
    }, [activeTab, id]);

    useEffect(() => {
        if (activeTab === 'sent') {
            fetchSentEmails();
        } else if (activeTab === 'inbox') {
            fetchInboxEmails();
        } else if (activeTab === 'drafts') {
            fetchDrafts();
        } else if (activeTab === 'smtp') {
            fetchSmtpConfigs();
        } else if (activeTab === 'templates') {
            fetchTemplates(); // Add this line
        }
    }, [
        activeTab,
        id,
        pagination.sent.currentPage,
        pagination.sent.itemsPerPage,
        pagination.inbox.currentPage,
        pagination.inbox.itemsPerPage,
        pagination.drafts.currentPage,
        pagination.drafts.itemsPerPage,
        pagination.smtp.currentPage,
        pagination.smtp.itemsPerPage,
        pagination.templates.currentPage, // Add these lines
        pagination.templates.itemsPerPage
    ]);

    const handleUseDraft = (draft) => {
        setSelectedDraft(draft);
        setShowSendEmailModal(true);
    };

    const handleDeleteTemplate = async (templateId) => {
        if (!window.confirm('Are you sure you want to delete this template?')) {
            return;
        }

        try {
            setIsLoading(true);
            const token = getAuthToken();

            const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete template');
            }

            // Success - remove template from state
            setTemplates(templates.filter(template => template.id !== templateId));
            toast.success('Template deleted successfully');

        } catch (error) {
            console.error('Delete template error:', error);
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderLogTable = () => {
        switch (activeTab) {
            case 'sent':
                return (
                    <div className="">
                        <div className="px-2 py-2 bg-white border-b border-gray-200 sm:px-6">
                            <div className="flex justify-between ">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                                    Inbox Emails ({emailLogs.sent ? emailLogs.sent.length : 0})
                                </h3>
                                <button
                                    onClick={fetchSentEmails}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <FontAwesomeIcon icon={faSyncAlt} className="mr-2" />
                                    Refresh
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase"> {/* reduced px-6 py-3 to px-2 py-1 */}
                                            Subject
                                        </th>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {emailLogs.sent && emailLogs.sent.length > 0 ? (
                                        emailLogs.sent.map((email) => (
                                            <tr key={email.id}>
                                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900"> {/* reduced px-6 py-4 to px-2 py-1 */}
                                                    {email.subject}
                                                </td>
                                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                                                    {Array.isArray(email.emails) ? email.emails.join(', ') : email.to_email || '-'}
                                                </td>
                                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">{email.from_email || '-'}</td>
                                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Sent
                                                    </span>
                                                </td>
                                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">{new Date(email.created_at).toLocaleString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-2 py-1 whitespace-nowrap text-center text-sm text-gray-500">
                                                No sent emails found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <PaginationControls
                            tab="sent"
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                    </div>
                );
            case 'drafts':
                return (
                    <div className="">
                        <div className="px-2 py-2 bg-white border-b border-gray-200 sm:px-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
                                    Email Drafts ({drafts.length})
                                </h3>
                                <button
                                    onClick={fetchDrafts}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <FontAwesomeIcon icon={faSyncAlt} className="mr-2" />
                                    Refresh
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {drafts && drafts.length > 0 ? (
                                        drafts.map((draft) => (
                                            <tr key={draft.id}>
                                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">{draft.id}</td>
                                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">{draft.subject}</td>
                                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900 truncate max-w-xs">{draft.message}</td>
                                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">{new Date(draft.created_at).toLocaleString()}</td>
                                                <td className="px-2 py-1 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => handleUseDraft(draft)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Use Draft
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-2 py-1 whitespace-nowrap text-center text-sm text-gray-500">
                                                No drafts available. Create one using the "Create Email Draft" button.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <PaginationControls
                            tab="drafts"
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                    </div>
                );
            case 'smtp':
                const filteredSmtpConfigs = selectedHostFilter === 'all'
                    ? smtpConfigs
                    : smtpConfigs.filter(smtp => smtp.host === selectedHostFilter);

                return (
                    <div className="">
                        <div className="px-2 py-2 bg-white border-b border-gray-200 sm:px-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        <FontAwesomeIcon icon={faCog} className="mr-2" />
                                        SMTP Configurations ({filteredSmtpConfigs.length})
                                    </h3>
                                    <select
                                        value={selectedHostFilter}
                                        onChange={(e) => setSelectedHostFilter(e.target.value)}
                                        className="border border-gray-300 rounded-md text-sm py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {getUniqueHosts().map((host) => (
                                            <option key={host} value={host}>
                                                {host === 'all' ? 'All Hosts' : host}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={fetchSmtpConfigs}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <FontAwesomeIcon icon={faSyncAlt} className="mr-2" />
                                    Refresh
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Host</th>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Port</th>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">From Email</th>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredSmtpConfigs.length > 0 ? (
                                        filteredSmtpConfigs.map((smtp) => (
                                            <tr key={smtp.id}>
                                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">{smtp.host}</td>
                                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">{smtp.port}</td>
                                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">{smtp.from_email}</td>
                                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">{smtp.username}</td>
                                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">{new Date(smtp.created_at).toLocaleString()}</td>
                                                <td className="px-2 py-1 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedSmtp(smtp);
                                                            // Add edit functionality here
                                                        }}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-2 py-1 whitespace-nowrap text-center text-sm text-gray-500">
                                                {selectedHostFilter === 'all'
                                                    ? 'No SMTP configurations available'
                                                    : `No SMTP configurations found for host: ${selectedHostFilter}`}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <PaginationControls
                            tab="smtp"
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                    </div>
                );
            case 'inbox':
                return (
                    <div className="">
                        <div className="px-2 py-2 bg-white border-b border-gray-200 sm:px-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    <FontAwesomeIcon icon={faInbox} className="mr-2" />
                                    Sent Emails ({inboxEmails.length})
                                </h3>
                                <button
                                    onClick={fetchInboxEmails}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <FontAwesomeIcon icon={faSyncAlt} className="mr-2" />
                                    Refresh
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Error</th>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {inboxEmails && inboxEmails.length > 0 ? (
                                        inboxEmails.map((email) => (
                                            <tr key={email.id}>
                                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                                                    {email.subject}
                                                </td>

                                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                                                    {email.to_email}
                                                </td>
                                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${email.status === 'failed'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-green-100 text-green-800'
                                                        }`}
                                                    >
                                                        {email.status}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                                                    {email.error || '-'}
                                                </td>
                                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(email.created_at).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-2 py-1 whitespace-nowrap text-center text-sm text-gray-500">
                                                No email logs found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <PaginationControls
                            tab="inbox"
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                    </div>
                );
            // Update the templates table section in the renderLogTable function

            case 'templates':
                return (
                    <div className="">
                        <div className="px-2 py-2 bg-white border-b border-gray-200 sm:px-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    <FontAwesomeIcon icon={faFileCode} className="mr-2" />
                                    Email Templates ({templates.length})
                                </h3>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={fetchTemplates}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <FontAwesomeIcon icon={faSyncAlt} className="mr-2" />
                                        Refresh
                                    </button>
                                    <button
                                        onClick={() => setShowTemplateModal(true)}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
                                        Create Template
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Body</th>
                                        <th className="px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {templates && templates.length > 0 ? (
                                        templates.map((template) => (
                                            <tr key={template.id}>
                                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">{template.id}</td>
                                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900 font-medium">{template.name}</td>
                                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                                                    {template.body}
                                                </td>
                                                <td className="px-2 py-1 whitespace-nowrap text-sm">
                                                    <div className="flex justify-center space-x-3">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedTemplate(template);
                                                                setShowEditTemplateModal(true);
                                                            }}
                                                            className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                                                            title="Edit template"
                                                        >
                                                            <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                                            <span>Edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                // Clear any selected draft to avoid conflicts
                                                                setSelectedDraft(null);
                                                                // Set the selected template 
                                                                setSelectedTemplate(template);
                                                                // Open the modal
                                                                setShowSendEmailModal(true);
                                                            }}
                                                            className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                                                            title="Send email with this template"
                                                        >
                                                            <FontAwesomeIcon icon={faPaperPlane} className="mr-1" />
                                                            <span>Send</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTemplate(template.id)}
                                                            className="inline-flex items-center px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                                                            title="Delete template"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-2 py-1 whitespace-nowrap text-center text-sm text-gray-500">
                                                No templates available. Create one using the "Create Template" button.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <PaginationControls
                            tab="templates"
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-500 text-4xl" />
            </div>
        );
    }

    if (!company) {
        return (
            <div className="min-h-screen bg-gray-50 py-6 flex flex-col justify-center sm:py-12">
                <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                    <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                        <div className="max-w-md mx-auto">
                            <div>
                                <h2 className="text-2xl font-semibold text-red-600 mb-4 text-center">Company Not Found</h2>
                            </div>
                            <div className="divide-y divide-gray-200">
                                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                    <button
                                        onClick={() => navigate('/dashboard/company')}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center mx-auto"
                                    >
                                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                                        Back to Companies List
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                    {/* <button
                        onClick={() => navigate('/dashboard/company')}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button> */}
                    {/* <h1 className="text-xl font-semibold text-gray-900">
                        {company?.name || 'Company Details'}
                    </h1> */}
                </div>
            </div>

            {/* Company Info Card */}
            <div className="bg-white shadow-sm rounded-lg p-2 mb-2">
                <div className="grid grid-cols-4 gap-4 items-center">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate('/dashboard/company')}
                            className="text-gray-600 hover:text-gray-900 flex items-center space-x-1"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                            <span className="ml-1">Back</span>
                        </button>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-xs text-gray-500 uppercase">Company Name</p>
                        <p className="text-sm font-medium text-gray-900">{company?.name}</p>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-xs text-gray-500 uppercase">Email Address</p>
                        <p className="text-sm font-medium text-gray-900">{company?.email}</p>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-xs text-gray-500 uppercase">Created Date</p>
                        <p className="text-sm font-medium text-gray-900">
                            {company?.created_at && new Date(company.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs - reduced padding */}
            <div className="bg-white shadow-sm rounded-lg">
                <div className="border-b border-gray-200">
                    <nav className="flex justify-between items-center">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab('sent')}
                                className={`py-2 px-4 text-sm font-medium border-b-2 ${activeTab === 'sent'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {/* <FontAwesomeIcon icon={faPaperPlane} className="mr-1" />
                                Sent */}
                                <FontAwesomeIcon icon={faInbox} className="mr-1" />
                                Inbox
                            </button>
                            <button
                                onClick={() => setActiveTab('inbox')}
                                className={`py-2 px-4 text-sm font-medium border-b-2 ${activeTab === 'inbox'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {/* <FontAwesomeIcon icon={faInbox} className="mr-1" />
                                Inbox */}
                                <FontAwesomeIcon icon={faPaperPlane} className="mr-1" />
                                Sent
                            </button>
                            <button
                                onClick={() => setActiveTab('drafts')}
                                className={`py-2 px-4 text-sm font-medium border-b-2 ${activeTab === 'drafts'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <FontAwesomeIcon icon={faFileAlt} className="mr-1" />
                                Drafts
                            </button>
                            <button
                                onClick={() => setActiveTab('smtp')}
                                className={`py-2 px-4 text-sm font-medium border-b-2 ${activeTab === 'smtp'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <FontAwesomeIcon icon={faCog} className="mr-1" />
                                SMTP
                            </button>
                            <button
                                onClick={() => setActiveTab('templates')}
                                className={`py-2 px-4 text-sm font-medium border-b-2 ${activeTab === 'templates'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <FontAwesomeIcon icon={faFileCode} className="mr-1" />
                                Templates
                            </button>
                        </div>
                        <div className="flex items-center space-x-2 pr-2">
                            <button
                                onClick={() => setShowSendEmailModal(true)}
                                className="bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded-md text-sm flex items-center"
                            >
                                <FontAwesomeIcon icon={faPaperPlane} className="mr-1" />
                                Send Email
                            </button>
                            <button
                                onClick={() => setShowDraftModal(true)}
                                className="bg-green-500 hover:bg-green-700 text-white px-2 py-1 rounded-md text-sm flex items-center"
                            >
                                <FontAwesomeIcon icon={faPlusCircle} className="mr-1" />
                                Create Draft
                            </button>
                            <button
                                onClick={() => setShowSmtpModal(true)}
                                className="bg-purple-500 hover:bg-purple-700 text-white px-2 py-1 rounded-md text-sm flex items-center"
                            >
                                <FontAwesomeIcon icon={faCog} className="mr-1" />
                                Add SMTP
                            </button>
                        </div>
                    </nav>
                </div>

                {/* Content Area - reduced padding */}
                <div className="p-2"> {/* reduced p-4 to p-2 */}
                    {renderLogTable()}
                </div>
            </div>

            {/* Modals */}
            {showSendEmailModal && (
                <SendEmailModal
                    isOpen={showSendEmailModal}
                    onClose={() => {
                        setShowSendEmailModal(false);
                        setSelectedTemplate(null);
                        setSelectedDraft(null);
                    }}
                    companyId={id}
                    draft={selectedDraft}
                    template={selectedTemplate}
                    onEmailSent={async () => {
                        if (activeTab === 'sent') {
                            await fetchSentEmails();
                        } else if (activeTab === 'inbox') {
                            await fetchInboxEmails();
                        }
                        setShowSendEmailModal(false);
                        setSelectedTemplate(null);
                        setSelectedDraft(null);
                    }}
                />
            )}
            {showDraftModal && (
                <CreateDraftModal
                    isOpen={showDraftModal}
                    onClose={() => setShowDraftModal(false)}
                    companyId={id}
                    onDraftCreated={() => fetchDrafts()}
                />
            )}
            {showSmtpModal && (
                <CreateSmtpModal
                    isOpen={showSmtpModal}
                    onClose={() => setShowSmtpModal(false)}
                    companyId={id}
                    onSmtpCreated={async () => {
                        await fetchSmtpConfigs(); // Ensure we wait for the configs to be fetched
                        setShowSmtpModal(false); // Close the modal after successful creation
                        setActiveTab('smtp'); // Switch to SMTP tab
                        toast.success('SMTP configuration created successfully');
                    }}
                />
            )}
            {showTemplateModal && (
                <CreateTemplateModal
                    isOpen={showTemplateModal}
                    onClose={() => setShowTemplateModal(false)}
                    companyId={id}
                    onTemplateCreated={async () => {
                        await fetchTemplates(); // Refresh templates list
                        setShowTemplateModal(false);
                        toast.success('Email template created successfully');
                    }}
                />
            )}
            {showEditTemplateModal && (
                <EditTemplateModal
                    isOpen={showEditTemplateModal}
                    onClose={() => setShowEditTemplateModal(false)}
                    companyId={id}
                    template={selectedTemplate}
                    onTemplateUpdated={async () => {
                        await fetchTemplates(); // Refresh templates list
                        setShowEditTemplateModal(false);
                        toast.success('Email template updated successfully');
                    }}
                />
            )}
        </div>
    );
};

export default CompanyDetails;