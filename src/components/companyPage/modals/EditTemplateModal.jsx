import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const API_EMAIL_URL = 'https://email.jumpintojob.com/api/v1';

const EditTemplateModal = ({ isOpen, onClose, template, onTemplateUpdated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: ''
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        subject: template.subject || '',
        body: template.body || ''
      });
    }
  }, [template]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form data
      if (!formData.name.trim()) {
        throw new Error('Template name is required');
      }

      if (!formData.body.trim()) {
        throw new Error('Template body is required');
      }

      // Get auth token
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('No authentication token found');
      }

      const parsedUser = JSON.parse(userData);
      const token = parsedUser.token || parsedUser.access_token;

      // Make API call to update template
      const response = await fetch(`${API_EMAIL_URL}/templates/${template.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update template');
      }

      toast.success('Email template updated successfully');
      
      // Call the callback function to notify parent component
      if (onTemplateUpdated) {
        onTemplateUpdated();
      }
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Template update error:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Email Template</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Template Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="e.g., welcome_email, password_reset"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use a descriptive name without spaces (use underscores)
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Enter email subject line"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Body</label>
            <textarea
              name="body"
              value={formData.body}
              onChange={handleChange}
              className="w-full p-2 border rounded h-32 resize-none"
              placeholder="Enter email body content"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              You can use HTML and placeholders like {'{{'} variable_name {'}}'} (e.g., {'{{'} user_name {'}}'}, {'{{'} reset_link {'}}'}...)
            </p>
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
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                  Updating...
                </>
              ) : (
                'Update Template'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTemplateModal;