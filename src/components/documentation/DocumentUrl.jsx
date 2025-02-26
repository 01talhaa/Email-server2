import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faCode, faCopy } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

const DocumentUrl = () => {
  const baseApiEndpoint = 'https://core.qualitees.co.uk/api';
  const companyToken = 'test-aserg5a4frg6534ae4r4qerJLKAQBE*&^&';
  
  const endpoints = {
    upload: `${baseApiEndpoint}/documents`,
    get: `${baseApiEndpoint}/documents`
  };

  const sampleUploadPayload = {
    files: ['file1.pdf'], // This will be a file in the actual FormData
    file_type: 'profile',
    entity_id: '123'
  };

  const requestHeaders = {
    'x-company-token': companyToken
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Document API Documentation</h1>
        
        {/* Headers Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faCode} className="text-purple-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Required Headers</h2>
            </div>
            <button
              onClick={() => handleCopy(JSON.stringify(requestHeaders, null, 2))}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FontAwesomeIcon icon={faCopy} />
            </button>
          </div>
          <div className="bg-gray-50 rounded-md p-4">
            <pre className="text-sm text-gray-800 overflow-x-auto">
              {JSON.stringify(requestHeaders, null, 2)}
            </pre>
          </div>
        </div>

        {/* Upload Endpoint Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faLink} className="text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Upload Document (POST)</h2>
            </div>
            <button
              onClick={() => handleCopy(endpoints.upload)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FontAwesomeIcon icon={faCopy} />
            </button>
          </div>
          <div className="bg-gray-50 rounded-md p-4 mb-4">
            <code className="text-sm text-blue-600">{endpoints.upload}</code>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Request Payload</h3>
          <div className="bg-gray-50 rounded-md p-4">
            <pre className="text-sm text-gray-800 overflow-x-auto">
              {JSON.stringify(sampleUploadPayload, null, 2)}
            </pre>
          </div>
        </div>

        {/* Get Documents Endpoint Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faLink} className="text-green-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Get Documents (GET)</h2>
            </div>
            <button
              onClick={() => handleCopy(endpoints.get)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FontAwesomeIcon icon={faCopy} />
            </button>
          </div>
          <div className="bg-gray-50 rounded-md p-4">
            <code className="text-sm text-blue-600">{endpoints.get}</code>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Query Parameters</h3>
            <ul className="list-disc pl-5 text-sm text-gray-600">
              <li>file_type (optional) - Filter by document type</li>
              <li>entity_id (required) - ID of the entity</li>
              <li>page (optional) - Page number for pagination</li>
              <li>limit (optional) - Items per page</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUrl;