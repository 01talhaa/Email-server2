import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faSpinner, faDownload, faTrash, faCopy, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
import AddDocumentModal from './AddDocumentModal';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://core.qualitees.co.uk/api';

const DocumentCompanyDetails = () => {
  const { id } = useParams();
  const [companyDetails, setCompanyDetails] = useState(null);
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
  const navigate = useNavigate();

  const fetchCompanyDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch company details');
      }

      const data = await response.json();
      if (data.success) {
        setCompanyDetails(data.data);
      }
    } catch (error) {
      console.error('Fetch company error:', error);
      toast.error('Failed to fetch company details');
    }
  };

  const fetchDocuments = async () => {
    if (!companyDetails?.token) return;

    try {
      setIsLoading(true);
      const fileTypeQuery = selectedFileType !== 'all' ? `&file_type=${selectedFileType}` : '';
      const response = await fetch(
        `${API_BASE_URL}/documents?entity_id=${id}&page=${currentPage}&limit=${itemsPerPage}${fileTypeQuery}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-company-token': companyDetails.token
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
    fetchCompanyDetails();
  }, [id]);

  useEffect(() => {
    if (companyDetails?.token) {
      fetchDocuments();
    }
  }, [currentPage, itemsPerPage, id, selectedFileType, companyDetails]);

  const handleDeleteDocument = async (documentId) => {
    if (!companyDetails?.token) {
      toast.error('Company token not available');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-company-token': companyDetails.token
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Only update the UI, don't call fetchDocuments
        setDocuments(prevDocuments =>
          prevDocuments.filter(doc => doc.id !== documentId)
        );

        // Update total pages if needed
        if (documents.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else if (documents.length === 1) {
          setTotalPages(0);
        } else if (documents.length % itemsPerPage === 1) {
          setTotalPages(prev => Math.max(1, prev - 1));
        }

        toast.success('Document deleted successfully');
      } else {
        throw new Error(data.message || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Delete document error:', error);
      toast.error(error.message || 'Failed to delete document');
      // Only fetch on error to ensure UI is in sync
      await fetchDocuments();
    } finally {
      setIsLoading(false);
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

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="">
      <div className="">
        {/* Company Info Card */}
        <div className="bg-white shadow-sm rounded-lg p-3 mb-3">
          <div className="grid grid-cols-5 gap-3 items-center">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard/docs/company')}
                className="text-gray-500 hover:text-gray-700 flex items-center text-xs font-medium"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="h-3 w-3" />
                <span className="ml-1">Back</span>
              </button>
            </div>
            <div className="flex flex-col">
              <p className="text-[11px] text-gray-400 uppercase font-medium tracking-wider">Company Name</p>
              <p className="text-xs font-medium text-gray-700 mt-0.5">{companyDetails?.name || '-'}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-[11px] text-gray-400 uppercase font-medium tracking-wider">Email Address</p>
              <p className="text-xs font-medium text-gray-700 mt-0.5">{companyDetails?.email || '-'}</p>
            </div>
            <div className="flex flex-col col-span-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-gray-400 uppercase font-medium tracking-wider">Company Token</p>
                <button
                  onClick={() => handleCopy(companyDetails?.token)}
                  className="text-gray-400 hover:text-gray-600 p-0.5 transition-colors"
                  title="Copy token"
                >
                  <FontAwesomeIcon icon={faCopy} className="h-3 w-3" />
                </button>
              </div>
              <p className="text-xs font-medium text-gray-700 mt-0.5 truncate font-mono">
                {companyDetails?.token || '-'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-3">
          <h1 className="text-base font-semibold text-gray-800">
            Documents Management
          </h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center px-2.5 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <FontAwesomeIcon icon={faUpload} className="h-3 w-3 mr-1" />
              Upload Document
            </button>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-1.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-3 py-1.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">File Type</th>
                <th className="px-3 py-1.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">File URL</th>
                <th className="px-3 py-1.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center space-x-2">
                  <label htmlFor="itemsPerPage" className="text-xs text-gray-500">
                    Show per page:
                  </label>
                  <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="border border-gray-200 rounded text-xs py-0.5 px-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
          token={companyDetails?.token}
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