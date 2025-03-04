import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLink, 
  faCode, 
  faCopy, 
  faEnvelope, 
  faInbox, 
  faFileAlt, 
  faCog, 
  faPaperPlane, 
  faFileCode, 
  faListAlt 
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';

const DashboardDetails = () => {
  const apiEndpoint = 'https://email.jumpintojob.com/api/v1/send-email';
  
  const emailPayload = {
    company_id: 2,
    smtp_config_id: 3,
    emails: [
      "recipient@example.com",
      "another@example.com"
    ],
    subject: "Your Account Information",
    message: "This is a simple email message without any template."
  };
  
  const templatePayload = {
    company_id: 2,
    smtp_config_id: 3,
    emails: ["user@example.com"],
    template_type: "forgot_password",
    variables: {
      subject: "Password Reset Request",
      company_name: "YourCompany",
      user_name: "John Doe",
      reset_link: "https://example.com/reset-password?token=xyz123"
    }
  };
  
  const draftPayload = {
    company_id: 2,
    smtp_config_id: 3,
    email_draft_id: 5,
    emails: ["contact@example.com"]
  };
  
  const combinedPayload = {
    company_id: 2,
    smtp_config_id: 3,
    email_draft_id: 5,
    template_type: "welcome_email",
    emails: ["new_user@example.com"],
    variables: {
      user_name: "Sarah Johnson",
      account_type: "Premium",
      activation_link: "https://example.com/activate/abc123"
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Email System Documentation</h1>
        
        {/* Overview Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
          <p className="text-gray-600 mb-4">
            This email system provides comprehensive functionality for managing and sending emails. 
            Key features include:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faEnvelope} className="text-blue-500 mr-2" />
                <h3 className="font-medium">Email Management</h3>
              </div>
              <ul className="list-disc pl-8 text-sm text-gray-600">
                <li>Sending emails via SMTP</li>
                <li>Tracking sent and received emails</li>
                <li>Managing email drafts</li>
                <li>Creating reusable email templates</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faCog} className="text-purple-500 mr-2" />
                <h3 className="font-medium">Configuration</h3>
              </div>
              <ul className="list-disc pl-8 text-sm text-gray-600">
                <li>Multiple SMTP server configurations</li>
                <li>Template variables and customization</li>
                <li>Company-specific settings</li>
                <li>Email drafts for future use</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* API Endpoint Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faLink} className="text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">API Endpoint</h2>
            </div>
            <button
              onClick={() => handleCopy(apiEndpoint)}
              className="text-gray-400 hover:text-gray-600"
              title="Copy endpoint"
            >
              <FontAwesomeIcon icon={faCopy} />
            </button>
          </div>
          <div className="bg-gray-50 rounded-md p-4">
            <code className="text-sm text-blue-600">{apiEndpoint}</code>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            This is the main endpoint for sending emails. All requests must include your authentication token in the headers.
          </p>
        </div>

        {/* Email Sending Options */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Sending Options</h2>
          <p className="text-gray-600 mb-4">
            You can send emails using several methods. Choose the approach that best fits your needs:
          </p>
          
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <FontAwesomeIcon icon={faPaperPlane} className="text-blue-500 mr-2" />
              <h3 className="text-lg font-medium">1. Simple Email</h3>
              <button
                onClick={() => handleCopy(JSON.stringify(emailPayload, null, 2))}
                className="text-gray-400 hover:text-gray-600 ml-2"
                title="Copy payload"
              >
                <FontAwesomeIcon icon={faCopy} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Send a basic email by specifying the subject and message directly.
            </p>
            <div className="bg-gray-50 rounded-md p-4">
              <pre className="text-sm text-gray-800 overflow-x-auto">
                {JSON.stringify(emailPayload, null, 2)}
              </pre>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-sm text-gray-600">
              <div>
                <p className="font-medium">Required fields:</p>
                <ul className="list-disc pl-6">
                  <li>company_id</li>
                  <li>smtp_config_id</li>
                  <li>emails (array)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Either:</p>
                <ul className="list-disc pl-6">
                  <li>subject + message</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Response:</p>
                <p>Success message with email log details</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <FontAwesomeIcon icon={faFileCode} className="text-green-500 mr-2" />
              <h3 className="text-lg font-medium">2. Template-Based Email</h3>
              <button
                onClick={() => handleCopy(JSON.stringify(templatePayload, null, 2))}
                className="text-gray-400 hover:text-gray-600 ml-2"
                title="Copy payload"
              >
                <FontAwesomeIcon icon={faCopy} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Send an email using a pre-defined template with variable substitution.
            </p>
            <div className="bg-gray-50 rounded-md p-4">
              <pre className="text-sm text-gray-800 overflow-x-auto">
                {JSON.stringify(templatePayload, null, 2)}
              </pre>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-sm text-gray-600">
              <div>
                <p className="font-medium">Required fields:</p>
                <ul className="list-disc pl-6">
                  <li>company_id</li>
                  <li>smtp_config_id</li>
                  <li>emails (array)</li>
                  <li>template_type</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Optional:</p>
                <ul className="list-disc pl-6">
                  <li>variables (object)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Common variables:</p>
                <ul className="list-disc pl-6">
                  <li>subject</li>
                  <li>company_name</li>
                  <li>user_name</li>
                  <li>reset_link</li>
                  <li>verification_code</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <FontAwesomeIcon icon={faFileAlt} className="text-yellow-500 mr-2" />
              <h3 className="text-lg font-medium">3. Draft-Based Email</h3>
              <button
                onClick={() => handleCopy(JSON.stringify(draftPayload, null, 2))}
                className="text-gray-400 hover:text-gray-600 ml-2"
                title="Copy payload"
              >
                <FontAwesomeIcon icon={faCopy} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Send an email using a previously saved draft.
            </p>
            <div className="bg-gray-50 rounded-md p-4">
              <pre className="text-sm text-gray-800 overflow-x-auto">
                {JSON.stringify(draftPayload, null, 2)}
              </pre>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm text-gray-600">
              <div>
                <p className="font-medium">Required fields:</p>
                <ul className="list-disc pl-6">
                  <li>company_id</li>
                  <li>smtp_config_id</li>
                  <li>emails (array)</li>
                  <li>email_draft_id</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Notes:</p>
                <p>The draft contains pre-defined subject and message content.</p>
                <p>You can override the recipient emails.</p>
              </div>
            </div>
          </div>
          
          <div className="mb-2">
            <div className="flex items-center mb-2">
              <FontAwesomeIcon icon={faListAlt} className="text-purple-500 mr-2" />
              <h3 className="text-lg font-medium">4. Combined (Template + Draft)</h3>
              <button
                onClick={() => handleCopy(JSON.stringify(combinedPayload, null, 2))}
                className="text-gray-400 hover:text-gray-600 ml-2"
                title="Copy payload"
              >
                <FontAwesomeIcon icon={faCopy} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Send an email using both a template and a draft together.
            </p>
            <div className="bg-gray-50 rounded-md p-4">
              <pre className="text-sm text-gray-800 overflow-x-auto">
                {JSON.stringify(combinedPayload, null, 2)}
              </pre>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              In this advanced scenario, the template structure is used but content from the draft can be incorporated as well.
            </p>
          </div>
        </div>

        {/* Management Features */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Management Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faFileAlt} className="text-green-500 mr-2" />
                <h3 className="text-lg font-medium">Drafts</h3>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600 mb-2">
                  Email drafts allow you to save and reuse email content.
                </p>
                <h4 className="font-medium text-sm mb-1">Features:</h4>
                <ul className="list-disc pl-6 text-sm text-gray-600 mb-2">
                  <li>Create draft emails to use later</li>
                  <li>Reference drafts by ID when sending</li>
                  <li>Management through web interface</li>
                </ul>
                <h4 className="font-medium text-sm mb-1">Typical Use Cases:</h4>
                <ul className="list-disc pl-6 text-sm text-gray-600">
                  <li>Frequently sent standard communications</li>
                  <li>Prepared responses for common scenarios</li>
                </ul>
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faFileCode} className="text-blue-500 mr-2" />
                <h3 className="text-lg font-medium">Templates</h3>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600 mb-2">
                  Templates provide dynamic email content with variable substitution.
                </p>
                <h4 className="font-medium text-sm mb-1">Template Variables:</h4>
                <ul className="list-disc pl-6 text-sm text-gray-600 mb-2">
                  <li>Use <code className="bg-gray-100 px-1">{'{{variable_name}}'}</code> syntax in templates</li>
                  <li>Common variables: subject, company_name, user_name, reset_link</li>
                  <li>Custom variables supported</li>
                </ul>
                <h4 className="font-medium text-sm mb-1">Template Types:</h4>
                <ul className="list-disc pl-6 text-sm text-gray-600">
                  <li>forgot_password</li>
                  <li>welcome_email</li>
                  <li>account_verification</li>
                  <li>custom templates</li>
                </ul>
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faCog} className="text-purple-500 mr-2" />
                <h3 className="text-lg font-medium">SMTP Configuration</h3>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600 mb-2">
                  Multiple SMTP servers can be configured for different purposes.
                </p>
                <h4 className="font-medium text-sm mb-1">Configuration Options:</h4>
                <ul className="list-disc pl-6 text-sm text-gray-600">
                  <li>Host and port settings</li>
                  <li>Authentication credentials</li>
                  <li>From email address</li>
                  <li>SSL/TLS settings</li>
                </ul>
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faInbox} className="text-red-500 mr-2" />
                <h3 className="text-lg font-medium">Email Tracking</h3>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600 mb-2">
                  Track all sent and received emails for audit and troubleshooting.
                </p>
                <h4 className="font-medium text-sm mb-1">Available Information:</h4>
                <ul className="list-disc pl-6 text-sm text-gray-600">
                  <li>Delivery status (sent, failed)</li>
                  <li>Error messages for failed emails</li>
                  <li>Timestamps and recipient information</li>
                  <li>Message content and subjects</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Web Interface Guide */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Web Interface Guide</h2>
          <p className="text-gray-600 mb-4">
            The email system includes a comprehensive web interface with the following sections:
          </p>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-medium mb-2">📥 Inbox</h3>
              <p className="text-sm text-gray-600">
                View incoming emails with status information, error details for failed deliveries, and timestamps.
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-lg font-medium mb-2">📤 Sent</h3>
              <p className="text-sm text-gray-600">
                Track all sent emails including recipient information, subjects, and delivery timestamps.
              </p>
            </div>
            
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="text-lg font-medium mb-2">📝 Drafts</h3>
              <p className="text-sm text-gray-600">
                Create, manage, and use email drafts with the ability to select drafts when sending new emails.
              </p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-lg font-medium mb-2">⚙️ SMTP</h3>
              <p className="text-sm text-gray-600">
                Configure multiple SMTP servers with different settings and credentials for various email sending needs.
              </p>
            </div>
            
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="text-lg font-medium mb-2">📋 Templates</h3>
              <p className="text-sm text-gray-600">
                Create and edit email templates with variable placeholders. Preview, edit, and use templates directly from the interface.
              </p>
              <div className="bg-gray-50 p-3 rounded mt-2 text-sm text-gray-600">
                <p className="font-medium">Template Variable Format:</p>
                <code className="bg-gray-100 px-2 py-1 rounded">{'{{variable_name}}'}</code>
                <p className="mt-2">Example template body:</p>
                <pre className="bg-white p-2 rounded text-xs">
                  {`Dear {{user_name}},\n\nThank you for joining {{company_name}}!\n\nPlease verify your account using this link: {{verification_link}}\n\nRegards,\nSupport Team`}
                </pre>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-gray-50 p-4 rounded">
            <h3 className="font-medium mb-2">Getting Started:</h3>
            <ol className="list-decimal pl-6 text-sm text-gray-600 space-y-1">
              <li>Configure at least one SMTP server in the SMTP tab</li>
              <li>Create email templates if you need reusable content with variables</li>
              <li>Optionally create email drafts for frequently used messages</li>
              <li>Use the "Send Email" button to compose and send new emails</li>
              <li>Track delivery status in the Sent and Inbox tabs</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDetails;