import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { getAuthToken } from '../../../utils/auth';

const API_BASE_URL = 'https://email.jumpintojob.com/api/v1';

const CreateDraftModal = ({ isOpen, onClose, companyId, onDraftCreated }) => {
  const [formData, setFormData] = useState({
    company_id: parseInt(companyId),
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/emails`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          company_id: parseInt(companyId),
          subject: formData.subject,
          message: formData.message
        })
      });

      const data = await response.json();
      console.log('Draft creation response:', data);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.message || data.error || 'Failed to create draft');
      }

      if (data.success) {
        toast.success('Draft created successfully');
        // Wait a moment before refreshing the list
        await new Promise(resolve => setTimeout(resolve, 500));
        onDraftCreated();
        onClose();
      } else {
        throw new Error(data.message || 'Failed to create draft');
      }
    } catch (error) {
      console.error('Draft creation error:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Email Draft</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Enter subject"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full p-2 border rounded h-32 resize-none"
              placeholder="Enter message"
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
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
            >
              {isLoading ? 'Creating...' : 'Create Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDraftModal;