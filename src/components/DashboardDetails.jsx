import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faCode, faCopy } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

const DashboardDetails = () => {
  const apiEndpoint = 'https://email.jumpintojob.com/api/v1/send-email';
  const samplePayload = {
    company_id: 2,
    smtp_config_id: 3,
    email_draft_id: 2,
    subject: "test subject from payload",
    message: "test message is working from payload",
    emails: [
      "mehidy.gb@gmail.com",
      "mehidy@cyberpeers.co.uk"
    ]
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">URL and Payloads</h1>
        
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
        </div>

        {/* Sample Payload Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faCode} className="text-green-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Sample Payload</h2>
            </div>
            <button
              onClick={() => handleCopy(JSON.stringify(samplePayload, null, 2))}
              className="text-gray-400 hover:text-gray-600"
              title="Copy payload"
            >
              <FontAwesomeIcon icon={faCopy} />
            </button>
          </div>
          <div className="bg-gray-50 rounded-md p-4">
            <pre className="text-sm text-gray-800 overflow-x-auto">
              {JSON.stringify(samplePayload, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDetails;