import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://email.jumpintojob.com/api/v1';

const CreateSmtpModal = ({ isOpen, onClose, companyId, onSmtpCreated }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    host: '',
    port: '',
    from_email: '',
    from_name: '',
    username: '',
    password: '',
    encryption: 'tls'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAuthToken = () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) throw new Error('Authentication required');

      const parsedUser = JSON.parse(userData);
      const token = parsedUser.token || parsedUser.access_token;

      if (!token) throw new Error('Invalid token');
      return token;
    } catch (error) {
      console.error('Token error:', error);
      throw new Error('Authentication required');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = getAuthToken();
      console.log('Creating SMTP config:', formData); // Debug log

      const response = await fetch(`${API_BASE_URL}/smtp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          company_id: parseInt(companyId)
        })
      });

      const data = await response.json();
      console.log('SMTP creation response:', data); // Debug log

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('user');
          navigate('/login');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.message || data.error || 'Failed to create SMTP config');
      }

      toast.success('SMTP configuration created successfully');
      if (onSmtpCreated) {
        await onSmtpCreated();
      }
      onClose();
    } catch (error) {
      console.error('SMTP creation error:', error);
      toast.error(error.message);
      if (error.message.includes('Authentication')) {
        navigate('/login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create SMTP Configuration</h2>
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
              Host <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.host}
              onChange={(e) => setFormData({ ...formData, host: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="mail.example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Port <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="465, 587, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">From Email</label>
            <input
              type="email"
              required
              value={formData.from_email}
              onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">From Name</label>
            <input
              type="text"
              value={formData.from_name}
              onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Sender Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="SMTP Username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="SMTP Password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Encryption <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.encryption}
              onChange={(e) => setFormData({ ...formData, encryption: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Encryption</option>
              <option value="ssl">SSL</option>
              <option value="tls">TLS</option>
              <option value="none">None</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-purple-300"
            >
              {isSubmitting ? 'Creating...' : 'Create SMTP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSmtpModal;