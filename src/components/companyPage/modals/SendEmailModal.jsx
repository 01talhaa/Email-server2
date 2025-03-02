import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getAuthToken } from '../../../utils/auth';

const API_BASE_URL = 'https://email.jumpintojob.com/api/v1';

const SendEmailModal = ({ isOpen, onClose, companyId, draft, onEmailSent }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company_id: parseInt(companyId),
    subject: draft?.subject || '',
    message: draft?.message || '',
    smtp_id: '',
    to_email: '',
    draft_id: draft?.id || '' 
  });
  const [smtpConfigs, setSmtpConfigs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [drafts, setDrafts] = useState([]); // Add drafts state

  // Fetch SMTP configs
  const fetchSmtpConfigs = async () => {
    try {
      const token = getAuthToken(); // Use the helper function

      const response = await fetch(`${API_BASE_URL}/smtp?company_id=${companyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      console.log('SMTP configs response:', data); // Debug log

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.message || 'Failed to fetch SMTP configs');
      }

      if (data.success && data.data && Array.isArray(data.data.result)) {
        setSmtpConfigs(data.data.result);
        // Set first SMTP config as default if available
        if (data.data.result.length > 0) {
          setFormData(prev => ({ ...prev, smtp_id: data.data.result[0].id }));
        }
      }
    } catch (error) {
      console.error('SMTP fetch error:', error);
      toast.error(error.message);
      if (error.message.includes('Authentication')) {
        navigate('/login');
      }
    }
  };

  // Add fetchDrafts function after fetchSmtpConfigs
  const fetchDrafts = async () => {
    try {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/emails?company_id=${companyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Drafts response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch drafts');
      }

      if (data.success && data.data && Array.isArray(data.data.result)) {
        setDrafts(data.data.result);
      }
    } catch (error) {
      console.error('Drafts fetch error:', error);
      toast.error(error.message);
    }
  };

  // Send email
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = getAuthToken();

      // Format the data according to the API requirements
      const sendEmailData = {
        company_id: parseInt(companyId),
        smtp_config_id: parseInt(formData.smtp_id),
        email_draft_id: formData.draft_id ? parseInt(formData.draft_id) : null,
        subject: formData.subject,
        emails: [formData.to_email], // API expects an array of emails
        message: formData.message
      };

      console.log('Sending email data:', sendEmailData);

      const response = await fetch(`${API_BASE_URL}/send-email`, {
        method: 'POST', 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(sendEmailData)
      });

      const data = await response.json();
      console.log('Email send response:', data);

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.message || 'Failed to send email');
      }

      toast.success('Email sent successfully');
      onEmailSent?.(); // Call the callback if provided
      onClose();
    } catch (error) {
      console.error('Email send error:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update useEffect to fetch both SMTP configs and drafts
  useEffect(() => {
    if (isOpen && companyId) {
      fetchSmtpConfigs();
      fetchDrafts();
    }
  }, [isOpen, companyId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Send Email</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              SMTP Configuration <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.smtp_id}
              onChange={(e) => setFormData({ ...formData, smtp_id: e.target.value })}
              className="w-full p-2 border rounded"
              disabled={isLoading}
            >
              <option value="">Select SMTP Config</option>
              {smtpConfigs.map(config => (
                <option key={config.id} value={config.id}>
                  {config.from_email} ({config.host})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Email Draft
            </label>
            <select
              value={formData.draft_id}
              onChange={(e) => {
                const selectedDraft = drafts.find(d => d.id === parseInt(e.target.value));
                setFormData(prev => ({
                  ...prev,
                  draft_id: e.target.value,
                  subject: selectedDraft?.subject || prev.subject,
                  message: selectedDraft?.message || prev.message
                }));
              }}
              className="w-full p-2 border rounded"
              disabled={isLoading}
            >
              <option value="">Select Draft (Optional)</option>
              {drafts.map(draft => (
                <option key={draft.id} value={draft.id}>
                  {draft.subject} - {new Date(draft.created_at).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              To Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.to_email}
              onChange={(e) => setFormData({ ...formData, to_email: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="recipient@example.com"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full p-2 border rounded"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full p-2 border rounded h-32 resize-none"
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.smtp_id}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isLoading ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendEmailModal;