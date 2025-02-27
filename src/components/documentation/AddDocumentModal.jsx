import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';

const API_BASE_URL = 'https://core.qualitees.co.uk/api';

const AddDocumentModal = ({ isOpen, onClose, companyId, token, onDocumentAdded }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        fileName: '',
        fileType: '' // Changed from default value to empty string
    });

    useEffect(() => {
        if (!token) {
            toast.error('Company token not available');
            onClose();
        }
    }, [token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !formData.fileName || !formData.fileType) {
            toast.error('Please fill all required fields');
            return;
        }

        if (!token) {
            toast.error('Company token not available');
            return;
        }

        try {
            setIsUploading(true);
            const formPayload = new FormData();
            formPayload.append('files[]', file);
            formPayload.append('file_type', formData.fileType.toLowerCase()); // Convert to lowercase
            formPayload.append('entity_id', companyId);
            formPayload.append('file_name', formData.fileName);

            const response = await fetch(`${API_BASE_URL}/documents`, {
                method: 'POST',
                headers: {
                    'x-company-token': token
                },
                body: formPayload
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success('Document uploaded successfully');
                onDocumentAdded();
                onClose();
            } else {
                throw new Error(data.message || 'Failed to upload document');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Failed to upload document');
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                        Upload Document
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    File Name
                                </label>
                                <input
                                    type="text"
                                    name="fileName"
                                    value={formData.fileName}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    File Type
                                </label>
                                <input
                                    type="text"
                                    name="fileType"
                                    value={formData.fileType}
                                    onChange={handleInputChange}
                                    placeholder="Enter file type (e.g., profile, logo, document)"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Select File
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="mt-1 block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-5 flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isUploading}
                                className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white
                  ${isUploading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {isUploading ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                        Uploading...
                                    </>
                                ) : (
                                    'Upload'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddDocumentModal;