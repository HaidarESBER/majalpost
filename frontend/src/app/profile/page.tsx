'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { API_URL } from '@/lib/config';
import { getImageUrl } from '@/lib/imageUtils';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, [isAuthenticated, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get<{
        _id: string;
        email: string;
        name: string;
        role: string;
        profilePicture?: string;
      }>('/users/me');

      if (response.success && response.data) {
        setName(response.data.name);
        setEmail(response.data.email);
        setProfilePicture(response.data.profilePicture);
        if (response.data.profilePicture) {
          setProfilePicturePreview(getImageUrl(response.data.profilePicture));
        }
      } else {
        setError(response.error || 'Failed to load profile');
      }
    } catch (err) {
      setError('Error loading profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setProfilePicturePreview(URL.createObjectURL(file));
    handleMediaUpload(file);
  };

  const handleMediaUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = api.getToken();
      const response = await fetch(`${API_URL}/media/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data) {
        setProfilePicture(result.data.fileUrl);
        setProfilePicturePreview(getImageUrl(result.data.fileUrl));
      } else {
        alert(result.error || 'Failed to upload image');
        setProfilePicturePreview(profilePicture ? getImageUrl(profilePicture) : null);
      }
    } catch (err) {
      alert('Error uploading image');
      console.error(err);
      setProfilePicturePreview(profilePicture ? getImageUrl(profilePicture) : null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      const response = await api.put('/users/me', {
        name: name.trim(),
        profilePicture: profilePicture || null,
      });

      if (response.success && response.data) {
        setSuccess(true);
        // Update auth context - we'd need to refresh the user data
        // For now, just show success message
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError(response.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Error updating profile');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-gray-600">Loading profile...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ملفي الشخصي</h1>
            <p className="text-gray-600">إدارة معلوماتك الشخصية</p>
          </div>

          {/* Profile Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                تم تحديث الملف الشخصي بنجاح!
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الصورة الشخصية</label>
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    {profilePicturePreview ? (
                      <img
                        src={profilePicturePreview}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl border-4 border-gray-200">
                        {name.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      تغيير الصورة
                    </button>
                    {profilePicture && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfilePicture(undefined);
                          setProfilePicturePreview(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="mr-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                      >
                        إزالة الصورة
                      </button>
                    )}
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="اسمك الكامل"
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">لا يمكن تغيير البريد الإلكتروني</p>
              </div>

              {/* Role Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الدور</label>
                <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-purple-100 text-purple-700 rounded-full">
                    {user?.role === 'admin' ? 'مدير' : user?.role === 'editor' ? 'محرر' : user?.role === 'contributor' ? 'مساهم' : 'مستخدم'}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <Link
                  href="/"
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  إلغاء
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
              </div>
            </form>
          </div>

          {/* Become Contributor Card */}
          {user && user.role !== 'contributor' && user.role !== 'editor' && user.role !== 'admin' && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl">
                  ✍️
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">كن مساهماً</h2>
                <p className="text-gray-700">
                  هل تريد المساهمة بمحتوى على منصة مجال بوست؟ قدم طلبك الآن!
                </p>
              </div>
              <Link
                href="/become-contributor"
                className="block w-full text-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                التقديم كمساهم
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

