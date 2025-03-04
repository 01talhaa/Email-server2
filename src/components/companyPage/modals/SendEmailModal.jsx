import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getAuthToken } from '../../../utils/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = 'https://email.jumpintojob.com/api/v1';

const SendEmailModal = ({ isOpen, onClose, companyId, draft, template, onEmailSent }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company_id: parseInt(companyId),
    subject: '',
    message: '',
    smtp_id: '',
    to_email: '',
    draft_id: '',
    template_type: '',
    variables: {}
  });
  const [smtpConfigs, setSmtpConfigs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [useTemplate, setUseTemplate] = useState(false);
  const [useDraft, setUseDraft] = useState(false);
  const [variableFields, setVariableFields] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);

  // Fetch company details
  const fetchCompanyDetails = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch company details');
      }

      if (data.success && data.data) {
        setCompanyDetails(data.data);

        // Pre-populate variables with company details
        setFormData(prev => ({
          ...prev,
          variables: {
            ...prev.variables,
            company_name: data.data.name || '',
          }
        }));
      }
    } catch (error) {
      console.error('Company details fetch error:', error);
    }
  };

  // Fetch Templates
  const fetchTemplates = async () => {
    try {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/templates?company_id=${companyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch templates');
      }

      if (data.success && data.data && Array.isArray(data.data.result)) {
        setTemplates(data.data.result);
      }
    } catch (error) {
      console.error('Templates fetch error:', error);
      toast.error(error.message);
    }
  };

  // Fetch SMTP configs
  const fetchSmtpConfigs = async () => {
    try {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/smtp?company_id=${companyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

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

  // Fetch drafts
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

  // Parse template variables to create form fields
  const parseTemplateVariables = (bodyContent) => {
    if (!bodyContent) return [];

    // Extract variables from template content using regex to find {{variable_name}}
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = [];
    let match;

    while ((match = regex.exec(bodyContent)) !== null) {
      matches.push(match[1]);
    }

    // Add common variables if none are found in the template
    // This ensures we always have some variables to demonstrate the feature
    if (matches.length === 0) {
      return ["subject", "company_name", "user_name", "reset_link"];
    }

    // Return unique variable names without the curly braces
    return [...new Set(matches)];
  };

  // Set up default template variables
  const setupDefaultVariables = (variables) => {
    const defaultVariables = {};

    // Common variables with default values
    const commonDefaults = {
      subject: formData.subject || "Password Reset Request",
      company_name: companyDetails?.name || "Your Company Name",
      user_name: "John Doe",
      reset_link: "https://example.com/reset?token=abc123",
      verification_code: "123456",
      activation_link: "https://example.com/activate?token=xyz789",
      support_email: "support@example.com",
      expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
    };

    // For each variable, provide a default value if available
    variables.forEach(variable => {
      defaultVariables[variable] = commonDefaults[variable] || `[${variable.replace(/_/g, ' ')}]`;
    });

    return defaultVariables;
  };

  // Update handleTemplateSelection function
  const handleTemplateSelection = (templateId) => {
    if (!templateId) {
      setSelectedTemplate(null);
      setVariableFields([]);
      setFormData(prev => ({
        ...prev,
        template_type: '',
        variables: {}
      }));
      return;
    }

    const selected = templates.find(t => t.id === parseInt(templateId));
    if (selected) {
      setSelectedTemplate(selected);

      // Parse variables from template body
      const extractedVariables = parseTemplateVariables(selected.body);
      setVariableFields(extractedVariables);

      // Set up default variables
      const defaultVars = setupDefaultVariables(extractedVariables);

      // Update form
      setFormData(prev => ({
        ...prev,
        subject: selected.subject || prev.subject,
        message: !useDraft ? (selected.body || '') : prev.message,
        template_type: selected.name,
        variables: defaultVars
      }));

      // Show a console example of the API payload
      console.log("Example API payload with template variables:", {
        company_id: parseInt(companyId),
        smtp_config_id: parseInt(formData.smtp_id || "1"),
        emails: ["recipient@example.com"],
        template_type: selected.name,
        variables: defaultVars
      });
    }
  };

  // Send email
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = getAuthToken();

      // Prepare email recipients as an array
      const emails = formData.to_email
        .split(',')
        .map(email => email.trim())
        .filter(email => email);

      if (emails.length === 0) {
        throw new Error('At least one valid email address is required');
      }

      // Format the data according to the API requirements
      const sendEmailData = {
        company_id: parseInt(companyId),
        smtp_config_id: parseInt(formData.smtp_id),
        emails: emails
      };

      // Add subject and message if not using template, or as fallback
      sendEmailData.subject = formData.subject;
      sendEmailData.message = formData.message;

      // Add draft ID if selected
      if (useDraft && formData.draft_id) {
        sendEmailData.email_draft_id = parseInt(formData.draft_id);
      }

      // Add template info if using a template
      if (useTemplate && selectedTemplate) {
        sendEmailData.template_type = selectedTemplate.name;

        // Add all variables from the form
        if (Object.keys(formData.variables).length > 0) {
          sendEmailData.variables = formData.variables;
        }

        // Log example for better understanding
        console.log("Sending email with template:", {
          template_name: selectedTemplate.name,
          variables: formData.variables,
        });
      }

      console.log('Complete API payload:', sendEmailData);

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

  // Handle changes to variable fields
  const handleVariableChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      variables: {
        ...prev.variables,
        [name]: value
      }
    }));
  };

  // Update useEffect to fetch everything we need
  useEffect(() => {
    if (isOpen && companyId) {
      fetchSmtpConfigs();
      fetchDrafts();
      fetchTemplates();
      fetchCompanyDetails();
    }
  }, [isOpen, companyId]);

  // Handle draft and template data
  useEffect(() => {
    // Reset form when modal opens/closes
    if (isOpen) {
      setFormData({
        company_id: parseInt(companyId),
        subject: '',
        message: '',
        smtp_id: smtpConfigs.length > 0 ? smtpConfigs[0].id : '',
        to_email: '',
        draft_id: '',
        template_type: '',
        variables: {}
      });
      setUseTemplate(false);
      setUseDraft(false);
      setSelectedTemplate(null);
    }

    // Handle draft
    if (draft && draft.id) {
      setUseDraft(true);
      setFormData(prev => ({
        ...prev,
        to_email: draft.to_email || prev.to_email,
        subject: draft.subject || prev.subject,
        message: draft.body || draft.message || prev.message,
        draft_id: draft.id
      }));
    }

    // Handle template if passed directly to modal
    if (template && template.id) {
      console.log("Using template:", template);
      setUseTemplate(true);
      setSelectedTemplate(template);

      // Parse variables from template body
      const extractedVariables = parseTemplateVariables(template.body);
      setVariableFields(extractedVariables);

      // Set up default variables
      const defaultVars = setupDefaultVariables(extractedVariables);

      // Only update certain fields to allow co-existence with draft
      setFormData(prev => ({
        ...prev,
        subject: template.subject || prev.subject,
        template_type: template.name || '',
        // Don't override message if draft is selected
        message: !useDraft ? (template.body || prev.message) : prev.message,
        variables: defaultVars
      }));
    }
  }, [isOpen, companyId, smtpConfigs, draft, template]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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

          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={useDraft}
                onChange={(e) => {
                  setUseDraft(e.target.checked);
                  if (!e.target.checked) {
                    setFormData(prev => ({
                      ...prev,
                      draft_id: ''
                    }));
                  }
                }}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-sm">Use Draft</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={useTemplate}
                onChange={(e) => {
                  setUseTemplate(e.target.checked);
                  if (!e.target.checked) {
                    setSelectedTemplate(null);
                    setFormData(prev => ({
                      ...prev,
                      template_type: '',
                      variables: {}
                    }));
                  }
                }}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-sm">Use Template</span>
            </label>
          </div>

          {useDraft && (
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
                    message: selectedDraft?.message || selectedDraft?.body || prev.message,
                    to_email: selectedDraft?.to_email || prev.to_email // Also fetch the recipient email if available
                  }));
                }}
                className="w-full p-2 border rounded"
                disabled={isLoading}
              >
                <option value="">Select Draft</option>
                {drafts.map(draft => (
                  <option key={draft.id} value={draft.id}>
                    {draft.subject} - {new Date(draft.created_at).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {useTemplate && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Email Template
              </label>
              <select
                value={selectedTemplate?.id || ''}
                onChange={(e) => handleTemplateSelection(e.target.value)}
                className="w-full p-2 border rounded"
                disabled={isLoading}
              >
                <option value="">Select Template</option>
                {templates.map(tmpl => (
                  <option key={tmpl.id} value={tmpl.id}>
                    {tmpl.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              To Email <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.to_email}
              onChange={(e) => setFormData({ ...formData, to_email: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="recipient@example.com (separate multiple emails with commas)"
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
              onChange={(e) => {
                setFormData({ ...formData, subject: e.target.value });
                // Also update the subject variable if using a template
                if (useTemplate) {
                  handleVariableChange('subject', e.target.value);
                }
              }}
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

          {useTemplate && selectedTemplate && (
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Template Variables for: {selectedTemplate.name}
              </h3>

              <div className="mb-3 text-xs text-gray-700 bg-gray-100 p-2 rounded">
                <p className="font-medium">API Example:</p>
                <pre className="overflow-x-auto whitespace-pre-wrap">
                  {`{
  "company_id": ${companyId},
  "smtp_config_id": ${formData.smtp_id || "1"},
  "emails": ["recipient@example.com"],
  "template_type": "${selectedTemplate.name}",
  "variables": ${JSON.stringify(formData.variables, null, 2)}
}`}
                </pre>
              </div>

              {variableFields.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-blue-700">
                    These variables will replace placeholders like <code>{'{{variable_name}}'}</code> in your template:
                  </p>

                  {variableFields.map((variable) => (
                    <div key={variable} className="mt-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {variable.replace(/_/g, ' ')}:
                      </label>
                      <input
                        type="text"
                        value={formData.variables[variable] || ''}
                        onChange={(e) => handleVariableChange(variable, e.target.value)}
                        className="w-full p-1 text-sm border rounded"
                        placeholder={`Value for {{${variable}}}`}
                      />
                    </div>
                  ))}

                  <div className="mt-4">
                    <p className="text-xs text-gray-600 mb-1">Template Preview with Variables:</p>
                    <div className="bg-white border rounded p-2 text-sm max-h-32 overflow-y-auto">
                      {selectedTemplate.body ? (
                        <div dangerouslySetInnerHTML={{
                          __html: selectedTemplate.body.replace(
                            /\{\{([^}]+)\}\}/g,
                            (match, variable) => formData.variables[variable] || match
                          )
                        }} />
                      ) : (
                        <p className="text-gray-500 italic">No template content available</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-blue-700 mb-2">
                    No variables were detected in this template. You can still add common variables:
                  </p>

                  {["subject", "company_name", "user_name", "reset_link"].map((variable) => (
                    <div key={variable} className="mt-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {variable.replace(/_/g, ' ')}:
                      </label>
                      <input
                        type="text"
                        value={formData.variables[variable] || ''}
                        onChange={(e) => handleVariableChange(variable, e.target.value)}
                        className="w-full p-1 text-sm border rounded"
                        placeholder={`Value for {{${variable}}}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                  Sending...
                </>
              ) : (
                'Send Email'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendEmailModal;