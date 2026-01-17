'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface Application {
  _id: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
  reviewedAt?: string;
  createdAt: string;
}

export default function BecomeContributorPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/become-contributor');
    } else if (user?.role === 'contributor' || user?.role === 'editor' || user?.role === 'admin') {
      router.push('/');
    } else {
      fetchMyApplications();
    }
  }, [isAuthenticated, user, router]);

  const fetchMyApplications = async () => {
    try {
      setLoadingApplications(true);
      const response = await api.get<Application[]>('/contributor-applications/my-applications');
      if (response.success && response.data) {
        setApplications(response.data);
      }
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!message.trim()) {
      setError('الرجاء كتابة رسالة التقديم');
      return;
    }

    if (message.trim().length < 50) {
      setError('الرسالة يجب أن تكون 50 حرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/contributor-applications', {
        message: message.trim(),
      });

      if (response.success) {
        setSuccess(true);
        setMessage('');
        fetchMyApplications();
      } else {
        setError(response.error || 'فشل إرسال الطلب');
      }
    } catch (err) {
      setError('حدث خطأ أثناء إرسال الطلب');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasPendingApplication = applications.some((app) => app.status === 'pending');

  if (!isAuthenticated || user?.role === 'contributor' || user?.role === 'editor' || user?.role === 'admin') {
    return null;
  }

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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">التقديم كمساهم</h1>
            <p className="text-xl text-gray-600">
              هل تريد المساهمة بمحتوى على منصة مجال بوست؟ قدم طلبك هنا
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              تم إرسال طلبك بنجاح! سيتم مراجعته من قبل الإدارة.
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Application Form */}
          {!hasPendingApplication ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">طلب جديد</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    رسالة التقديم <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={8}
                    minLength={50}
                    maxLength={2000}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="اكتب هنا لماذا تريد أن تصبح مساهماً، وما هي اهتماماتك، وما نوع المحتوى الذي تريد المساهمة به..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {message.length}/2000 حرف (الحد الأدنى: 50 حرف)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || message.trim().length < 50}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <p className="text-yellow-800 font-medium">
                لديك طلب قيد المراجعة. يرجى الانتظار حتى يتم مراجعة طلبك السابق.
              </p>
            </div>
          )}

          {/* Previous Applications */}
          {applications.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">طلباتي السابقة</h2>
              <div className="space-y-4">
                {applications.map((application) => {
                  const statusInfo = getStatusLabel(application.status);
                  return (
                    <div
                      key={application._id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${statusInfo.color}`}
                            >
                              {statusInfo.text}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(application.createdAt).toLocaleDateString('ar-LB', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{application.message}</p>
                      {application.reviewNotes && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-2">ملاحظات المراجعة:</p>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{application.reviewNotes}</p>
                        </div>
                      )}
                      {application.reviewedAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          تمت المراجعة في:{' '}
                          {new Date(application.reviewedAt).toLocaleDateString('ar-LB', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

