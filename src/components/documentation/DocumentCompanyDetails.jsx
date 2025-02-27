import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faSpinner, faDownload, faTrash } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
import AddDocumentModal from './AddDocumentModal';

const API_BASE_URL = 'https://core.qualitees.co.uk/api';
const TOKEN = 'test-aserg5a4frg6534ae4r4qerJLKAQBE*&^&';
// const FILE_TYPES = ['profile', 'logo', 'document', 'other'];

const DocumentCompanyDetails = () => {
  const { id } = useParams();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const savedItemsPerPage = localStorage.getItem('docItemsPerPage');
    return savedItemsPerPage ? parseInt(savedItemsPerPage) : 10;
  });
  const [selectedFileType, setSelectedFileType] = useState('all');

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const fileTypeQuery = selectedFileType !== 'all' ? `&file_type=${selectedFileType}` : '';
      const response = await fetch(
        `${API_BASE_URL}/documents?entity_id=${id}&page=${currentPage}&limit=${itemsPerPage}${fileTypeQuery}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-company-token': TOKEN
          }
        }
      );

      const data = await response.json();
      if (data.meta && data.result) {
        setDocuments(data.result);
        setTotalPages(data.meta.totalPage);
      }
    } catch (error) {
      console.error('Fetch documents error:', error);
      toast.error('Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [currentPage, itemsPerPage, id, selectedFileType]);

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-company-token': TOKEN
        }
      });

      const data = await response.json();

      if (data.success) {
        // Optimistically update the UI
        setDocuments(prevDocuments =>
          prevDocuments.filter(doc => doc.id !== documentId)
        );
        toast.success('Document deleted successfully');

        // Then refresh the data to ensure sync with server
        await fetchDocuments();
      } else {
        throw new Error(data.message || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Delete document error:', error);
      toast.error(error.message);
      // Refresh documents in case of error to ensure UI is in sync
      await fetchDocuments();
    }
  };

  const getFileTypeBadgeColor = (fileType) => {
    switch (fileType) {
      case 'profile':
        return 'bg-blue-100 text-blue-800';
      case 'logo':
        return 'bg-green-100 text-green-800';
      case 'document':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    localStorage.setItem('docItemsPerPage', newItemsPerPage.toString());
    setCurrentPage(1);
  };

  const handleFileTypeChange = (e) => {
    setSelectedFileType(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Documents Management
          </h1>
          <div className="flex items-center space-x-4">
            {/* <div className="flex items-center space-x-2">
              <label htmlFor="fileType" className="text-sm text-gray-600">
                Filter by type:
              </label>
              <select
                id="fileType"
                value={selectedFileType}
                onChange={handleFileTypeChange}
                className="border border-gray-300 rounded-md text-sm py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                {FILE_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div> */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <FontAwesomeIcon icon={faUpload} className="mr-1.5" />
              Upload Document
            </button>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">File Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">File URL</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-4 py-2 text-center">
                    <FontAwesomeIcon icon={faSpinner} spin className="mr-1.5" />
                    Loading...
                  </td>
                </tr>
              ) : documents.length > 0 ? (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{doc.id}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getFileTypeBadgeColor(doc.file_type)}`}>
                        {doc.file_type}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FontAwesomeIcon icon={faDownload} className="mr-1.5" />
                        Download
                      </a>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FontAwesomeIcon icon={faTrash} className="mr-1.5" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-2 text-center text-sm text-gray-500">
                    No documents found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center space-x-2">
                  <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
                    Show per page:
                  </label>
                  <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="border border-gray-300 rounded-md text-sm py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                >
                  Previous
                </button>
                <div className="flex items-center space-x-2">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-4 py-2 text-sm font-medium rounded-md ${currentPage === index + 1
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isUploadModalOpen && (
        <AddDocumentModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          companyId={id}
          token={TOKEN}
          onDocumentAdded={() => {
            fetchDocuments();
            setIsUploadModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default DocumentCompanyDetails;