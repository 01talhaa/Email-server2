import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import SendEmailModal from './modals/SendEmailModal';
import CreateDraftModal from './modals/CreateDraftModal';
import CreateSmtpModal from './modals/CreateSmtpModal';
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
    faSpinner
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

const CompanyDetails = () => {
    const [company, setCompany] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('sent');
    const [showSendEmailModal, setShowSendEmailModal] = useState(false);
    const [showDraftModal, setShowDraftModal] = useState(false);
    const [showSmtpModal, setShowSmtpModal] = useState(false);
    const [selectedDraft, setSelectedDraft] = useState(null);
    const [smtpConfigs, setSmtpConfigs] = useState([]);
    const [selectedSmtp, setSelectedSmtp] = useState(null);

    const { id } = useParams();
    const navigate = useNavigate();
    const [emailLogs, setEmailLogs] = useState({ sent: [], inbox: [] });
    const [draftLogs, setDraftLogs] = useState([]);
    const [smtpLogs, setSmtpLogs] = useState([]);
    const [drafts, setDrafts] = useState([]);

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

    const fetchDrafts = async () => {
        try {
            const token = getAuthToken();

            const response = await fetch(`${API_BASE_URL}/emails?company_id=${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('user');
                    navigate('/login');
                    throw new Error('Session expired. Please login again.');
                }
                throw new Error(data.message || 'Failed to fetch drafts');
            }

            if (data.success && data.data && Array.isArray(data.data.result)) {
                setDrafts(data.data.result);
            } else {
                setDrafts([]);
            }
        } catch (error) {
            console.error('Drafts fetch error:', error);
            toast.error(error.message);
            if (error.message.includes('Authentication')) {
                navigate('/login');
            }
        }
    };

    const fetchSmtpConfigs = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/smtp?company_id=${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch SMTP configs');
            }

            if (data.success && data.data && Array.isArray(data.data.result)) {
                setSmtpConfigs(data.data.result);
            }
        } catch (error) {
            console.error('SMTP fetch error:', error);
            toast.error(error.message);
        }
    };

    const fetchSentEmails = async () => {
        try {
            const token = getAuthToken();

            // Changed method from POST to PUT
            const response = await fetch(`${API_BASE_URL}/emails/list`, {
                method: 'PUT', // Changed from POST to PUT
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    company_id: parseInt(id)
                })
            });

            const data = await response.json();
            console.log('All emails response:', data);

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('user');
                    navigate('/login');
                    throw new Error('Session expired. Please login again.');
                }
                throw new Error(data.message || 'Failed to fetch emails');
            }

            if (data.success && data.data && Array.isArray(data.data.result)) {
                // Filter sent emails
                const sentEmails = data.data.result.filter(email =>
                    email.subject &&
                    (Array.isArray(email.emails) || email.to_email) &&
                    !email.is_draft // Exclude drafts
                );

                // Sort by created_at in descending order
                sentEmails.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                console.log('Filtered sent emails:', sentEmails);

                setEmailLogs(prev => ({
                    ...prev,
                    sent: sentEmails
                }));
            }
        } catch (error) {
            console.error('Sent emails fetch error:', error);
            toast.error(error.message);
        }
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
        if (id && activeTab === 'sent') {
            fetchSentEmails();
        }
    }, [id, activeTab]);

    useEffect(() => {
        if (activeTab === 'drafts') {
            fetchDrafts();
        } else if (activeTab === 'smtp') {
            fetchSmtpConfigs();
        } else if (activeTab === 'sent') {
            fetchSentEmails();
        }
    }, [activeTab]);

    const handleUseDraft = (draft) => {
        setSelectedDraft(draft);
        setShowSendEmailModal(true);
    };

    const renderLogTable = () => {
        switch (activeTab) {
            case 'sent':
                return (
                    <div className="mt-6 rounded-md shadow-md overflow-hidden">
                        <div className="px-4 py-5 bg-white border-b border-gray-200 sm:px-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                                    Sent Emails ({emailLogs.sent ? emailLogs.sent.length : 0})
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {emailLogs.sent && emailLogs.sent.length > 0 ? (
                                        emailLogs.sent.map((email) => (
                                            <tr key={email.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">{email.subject}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                                                    {Array.isArray(email.emails) ? email.emails.join(', ') : email.to_email || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{email.from_email || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Sent
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(email.created_at).toLocaleString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                                No sent emails found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'drafts':
                return (
                    <div className="mt-6 rounded-md shadow-md overflow-hidden">
                        <div className="px-4 py-5 bg-white border-b border-gray-200 sm:px-6">
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {drafts && drafts.length > 0 ? (
                                        drafts.map((draft) => (
                                            <tr key={draft.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{draft.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{draft.subject}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-xs">{draft.message}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(draft.created_at).toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                                            <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                                No drafts available. Create one using the "Create Email Draft" button.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'smtp':
                return (
                    <div className="mt-6 rounded-md shadow-md overflow-hidden">
                        <div className="px-4 py-5 bg-white border-b border-gray-200 sm:px-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    <FontAwesomeIcon icon={faCog} className="mr-2" />
                                    SMTP Configurations ({smtpConfigs.length})
                                </h3>
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Host</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Port</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {smtpConfigs.length > 0 ? (
                                        smtpConfigs.map((smtp) => (
                                            <tr key={smtp.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{smtp.host}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{smtp.port}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{smtp.from_email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{smtp.username}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(smtp.created_at).toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                                            <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                                No SMTP configurations available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
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
        <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
            <div className="relative py-3 sm:max-w-5xl sm:mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-semibold text-gray-900">Company Details</h1>
                            <button
                                onClick={() => navigate('/dashboard/company')}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                                Back to Companies
                            </button>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-6 mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-gray-600 text-sm uppercase tracking-wider">Company Name</h3>
                                    <p className="font-semibold text-xl text-gray-900">{company.name}</p>
                                </div>
                                <div>
                                    <h3 className="text-gray-600 text-sm uppercase tracking-wider">Email</h3>
                                    <p className="font-semibold text-xl text-gray-900">{company.email}</p>
                                </div>
                                <div>
                                    <h3 className="text-gray-600 text-sm uppercase tracking-wider">Created At</h3>
                                    <p className="font-semibold text-xl text-gray-900">{new Date(company.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Side - Log Buttons */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-700 mb-3">Email Logs</h3>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => setActiveTab('sent')}
                                            className={`flex-1 px-5 py-3 rounded-md font-medium ${activeTab === 'sent' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                                            Sent
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setActiveTab('drafts')}
                                    className={`w-full px-5 py-3 rounded-md font-medium ${activeTab === 'drafts' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
                                    Email Draft Logs
                                </button>
                                <button
                                    onClick={() => setActiveTab('smtp')}
                                    className={`w-full px-5 py-3 rounded-md font-medium ${activeTab === 'smtp' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <FontAwesomeIcon icon={faCog} className="mr-2" />
                                    SMTP Logs
                                </button>
                            </div>

                            {/* Right Side - Action Buttons */}
                            <div className="space-y-4 mt-10">
                                <button
                                    onClick={() => setShowSendEmailModal(true)}
                                    className="w-full px-5 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 shadow-md"
                                >
                                    <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                                    Send Email
                                </button>
                                <button
                                    onClick={() => setShowDraftModal(true)}
                                    className="w-full px-5 py-3 bg-green-500 text-white rounded-md font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 shadow-md"
                                >
                                    <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
                                    Create Email Draft
                                </button>
                                <button
                                    onClick={() => setShowSmtpModal(true)}
                                    className="w-full px-5 py-3 bg-purple-500 text-white rounded-md font-medium hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 shadow-md"
                                >
                                    <FontAwesomeIcon icon={faCog} className="mr-2" />
                                    Create SMTP Configuration
                                </button>
                            </div>
                        </div>

                        {/* Logs Display Area */}
                        <div className="mt-8">
                            {renderLogTable()}
                        </div>

                        {/* Modals */}
                        {showSendEmailModal && (
                            <SendEmailModal
                                isOpen={showSendEmailModal}
                                onClose={() => setShowSendEmailModal(false)}
                                companyId={id}
                                draft={selectedDraft}
                                onEmailSent={async () => {
                                    // Add a small delay to allow the email to be processed
                                    await new Promise(resolve => setTimeout(resolve, 1000));
                                    if (activeTab === 'sent') {
                                        await fetchSentEmails();
                                    }
                                    setSelectedDraft(null); // Reset selected draft
                                }}
                            />
                        )}
                        {showDraftModal && (
                            <CreateDraftModal
                                isOpen={showDraftModal}
                                onClose={() => {
                                    setShowDraftModal(false);
                                }}
                                companyId={id}
                                onDraftCreated={() => {
                                    console.log('Refreshing drafts after creation');
                                    fetchDrafts();
                                }}
                            />
                        )}
                        {showSmtpModal && (
                            <CreateSmtpModal
                                isOpen={showSmtpModal}
                                onClose={() => setShowSmtpModal(false)}
                                companyId={id}
                                onSmtpCreated={() => {
                                    fetchSmtpConfigs();
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyDetails;