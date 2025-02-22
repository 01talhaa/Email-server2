import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEmailById } from '../api/mockApi';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

const EmailDetail = () => {
  const { id } = useParams();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const data = await getEmailById(id);
        setEmail(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching email:', error);
        setLoading(false);
      }
    };

    fetchEmail();
  }, [id]);

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (!email) {
    return <div className="text-center mt-8">Email not found</div>;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to Inbox
        </Link>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">From</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {email.sender} ({email.company})
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Subject</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {email.subject}
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Date</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {new Date(email.date).toLocaleString()}
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Message</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {email.content}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default EmailDetail;