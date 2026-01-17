'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

interface Application {
  _id: string;
  user: User;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: User;
  reviewNotes?: string;
  reviewedAt?: string;
  createdAt: string;
}

interface ApplicationsResponse {
  items: Application[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function ContributorApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');

  useEffect(() => {
    fetchApplications();
  }, [page, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const statusParam = statusFilter === 'all' ? '' : `&status=${statusFilter}`;
      const response = await api.get<ApplicationsResponse>(
        `/contributor-applications?page=${page}&limit=20${statusParam}`
      );
      if (response.success && response.data) {
        setApplications(response.data.items);
        setPagination(response.data.pagination);
      } else {
        setError(response.error || 'Failed to fetch applications');
      }
    } catch (err) {
      setError('Error loading applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (applicationId: string, status: 'approved' | 'rejected') => {
    setReviewingId(applicationId);
    setReviewStatus(status);
    setReviewNotes('');
  };

  const handleSubmitReview = async () => {
    if (!reviewingId) return;

    try {
      const response = await api.put(`/contributor-applications/${reviewingId}`, {
        status: reviewStatus,
        reviewNotes: reviewNotes.trim() || undefined,
      });

      if (response.success) {
        setReviewingId(null);
        setReviewNotes('');
        fetchApplications();
      } else {
        alert(response.error || 'Failed to update application');
      }
    } catch (err) {
      alert('Error updating application');
      console.error(err);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-800' };
      case 'approved':
        return { text: 'موافق عليه', color: 'bg-green-100 text-green-800' };
      case 'rejected':
        return { text: 'مرفوض', color: 'bg-red-100 text-red-800' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (loading && applications.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contributor Applications</h1>
            <p className="text-sm text-gray-600 mt-1">Review and manage contributor applications</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Applications</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No applications found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const statusInfo = getStatusLabel(application.status);
              const isReviewing = reviewingId === application._id;

              return (
                <div
                  key={application._id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      {application.user.profilePicture ? (
                        <img
                          src={application.user.profilePicture}
                          alt={application.user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                          {application.user.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{application.user.name}</h3>
                          <span
                            className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}
                          >
                            {statusInfo.text}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{application.user.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Submitted:{' '}
                          {new Date(application.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Application Message:</p>
                    <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {application.message}
                    </p>
                  </div>

                  {application.reviewNotes && (
                    <div className="mb-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">Review Notes:</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap bg-blue-50 p-4 rounded-lg">
                        {application.reviewNotes}
                      </p>
                    </div>
                  )}

                  {application.status === 'pending' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {isReviewing ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Review Notes (optional)
                            </label>
                            <textarea
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                              rows={3}
                              maxLength={1000}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                              placeholder="Add notes about your decision..."
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={handleSubmitReview}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                reviewStatus === 'approved'
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : 'bg-red-600 text-white hover:bg-red-700'
                              }`}
                            >
                              {reviewStatus === 'approved' ? 'Approve' : 'Reject'}
                            </button>
                            <button
                              onClick={() => {
                                setReviewingId(null);
                                setReviewNotes('');
                              }}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleReview(application._id, 'approved')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReview(application._id, 'rejected')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

