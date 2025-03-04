import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faInfoCircle, faPlusCircle, faTrash } from '@fortawesome/free-solid-svg-icons';

const API_EMAIL_URL = 'https://email.jumpintojob.com/api/v1';

const COMMON_VARIABLES = [
  { name: "subject", description: "The email subject line" },
  { name: "company_name", description: "Name of the company" },
  { name: "user_name", description: "Recipient's name" },
  { name: "reset_link", description: "Password reset link" },
  { name: "verification_code", description: "Verification code" },
  { name: "activation_link", description: "Account activation link" },
  { name: "expiry_date", description: "Expiration date" }
];

const CreateTemplateModal = ({ isOpen, onClose, companyId, onTemplateCreated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_id: parseInt(companyId),
    name: '',
    subject: '',
    body: ''
  });
  const [showVariableHelper, setShowVariableHelper] = useState(false);
  const [customVariables, setCustomVariables] = useState([]);
  const [newVariable, setNewVariable] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Update preview if body is being modified
    if (name === 'body') {
      updatePreview(value);
    }
  };
  
  const updatePreview = (bodyContent) => {
    // Replace variables with highlighted spans
    const highlightedContent = bodyContent.replace(
      /\{\{([^}]+)\}\}/g,
      '<span class="bg-yellow-200 text-black px-1 rounded">{{$1}}</span>'
    );
    setPreviewHtml(highlightedContent);
  };

  const addCustomVariable = () => {
    if (!newVariable.trim()) return;
    
    // Check if variable already exists
    if (customVariables.includes(newVariable.trim()) || 
        COMMON_VARIABLES.some(v => v.name === newVariable.trim())) {
      toast.error("This variable already exists");
      return;
    }
    
    setCustomVariables([...customVariables, newVariable.trim()]);
    setNewVariable("");
  };

  const removeCustomVariable = (variable) => {
    setCustomVariables(customVariables.filter(v => v !== variable));
  };

  const insertVariable = (variable) => {
    const textarea = document.getElementById("template-body");
    if (!textarea) return;
    
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    
    const beforeText = formData.body.substring(0, startPos);
    const afterText = formData.body.substring(endPos);
    const newValue = `${beforeText}{{${variable}}}${afterText}`;
    
    setFormData(prev => ({ ...prev, body: newValue }));
    updatePreview(newValue);
    
    // Restore focus and set cursor position after the inserted variable
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = startPos + variable.length + 4; // +4 for the {{ and }}
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
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
      
      // Extract variables from template body
      const variableRegex = /\{\{([^}]+)\}\}/g;
      const matches = [];
      let match;
      
      while ((match = variableRegex.exec(formData.body)) !== null) {
        matches.push(match[1]);
      }
      
      // Add variable metadata
      const uniqueVariables = [...new Set(matches)];
      
      // Get auth token
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('No authentication token found');
      }

      const parsedUser = JSON.parse(userData);
      const token = parsedUser.token || parsedUser.access_token;

      // Make API call
      const response = await fetch(`${API_EMAIL_URL}/templates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          variables: uniqueVariables
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create template');
      }

      toast.success('Email template created successfully');
      
      // Call the callback function to notify parent component
      if (onTemplateCreated) {
        onTemplateCreated();
      }
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Template creation error:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Email Template</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Template Name <span className="text-red-500">*</span></label>
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
              <p className="text-xs text-gray-500 mt-1">
                You can use variables in the subject line too
              </p>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium mb-1">Body <span className="text-red-500">*</span></label>
              <button 
                type="button"
                onClick={() => setShowVariableHelper(!showVariableHelper)}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
              >
                <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                {showVariableHelper ? "Hide Variables" : "Show Variables"}
              </button>
            </div>
            <textarea
              id="template-body"
              name="body"
              value={formData.body}
              onChange={handleChange}
              className="w-full p-2 border rounded h-44 font-mono text-sm"
              placeholder="Enter email body content. You can use HTML and variables like {{variable_name}}"
              required
            />
          </div>
          
          {showVariableHelper && (
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Template Variables</h3>
              <p className="text-xs text-blue-700 mb-2">
                Click on a variable to insert it at the cursor position. Variables will be replaced with actual values when sending emails.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <h4 className="text-xs font-medium mb-1">Common Variables</h4>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {COMMON_VARIABLES.map((variable) => (
                      <button
                        key={variable.name}
                        type="button"
                        onClick={() => insertVariable(variable.name)}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 flex items-center"
                        title={variable.description}
                      >
                        {variable.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium mb-1">Custom Variables</h4>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {customVariables.map((variable) => (
                      <div 
                        key={variable} 
                        className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded flex items-center"
                      >
                        <button
                          type="button"
                          onClick={() => insertVariable(variable)}
                          className="mr-1"
                        >
                          {variable}
                        </button>
                        <button 
                          type="button"
                          onClick={() => removeCustomVariable(variable)}
                          className="text-red-500 hover:text-red-700"
                          title="Remove variable"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center mt-2">
                    <input
                      type="text"
                      value={newVariable}
                      onChange={(e) => setNewVariable(e.target.value)}
                      placeholder="Add custom variable"
                      className="p-1 text-xs border rounded flex-grow"
                    />
                    <button
                      type="button"
                      onClick={addCustomVariable}
                      className="ml-1 p-1 bg-green-500 text-white rounded hover:bg-green-600"
                      disabled={!newVariable.trim()}
                    >
                      <FontAwesomeIcon icon={faPlusCircle} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-medium mb-1">Usage Example:</h4>
                <div className="bg-gray-100 p-2 rounded text-xs">
                  <code>Dear {"{{user_name}}"}, <br /><br />
                  Welcome to {"{{company_name}}"}! <br /><br />
                  Click here to activate your account: {"{{activation_link}}"}<br /><br />
                  This link will expire on {"{{expiry_date}}"}.</code>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-medium mb-1">API Structure:</h4>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`{
  "company_id": ${companyId},
  "smtp_config_id": 1,
  "emails": ["recipient@example.com"],
  "template_type": "${formData.name || 'template_name'}",
  "variables": {
    "user_name": "John Doe",
    "company_name": "Your Company",
    "activation_link": "https://example.com/activate?token=abc123",
    "expiry_date": "March 11, 2025"
  }
}`}
                </pre>
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-1">Preview:</h3>
            <div 
              className="border rounded p-3 bg-white min-h-[100px] text-sm overflow-auto"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
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
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create Template'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTemplateModal;