'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FiUsers, FiFileText, FiShield, FiSettings, FiPlus, FiUserPlus, FiX, FiMail } from 'react-icons/fi';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/services/adminService';
import SuperAdminModal from '@/components/SuperAdminModal';
import type { Profile } from '@/lib/supabase';

interface AdminStats {
  totalUsers: number;
  totalAdmins: number;
  totalArticles: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, profileLoading, isAdmin, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, totalAdmins: 0, totalArticles: 0 });
  const [users, setUsers] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'articles'>('overview');
  const [showSuperAdminModal, setShowSuperAdminModal] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState<{ userId: string; newRole: 'user' | 'admin' } | null>(null);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [addAdminLoading, setAddAdminLoading] = useState(false);
  const [addAdminError, setAddAdminError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Admin page auth state:', {
      authLoading,
      profileLoading,
      user: user?.email,
      isAdmin,
      profileRole: profile?.role,
      hasUser: !!user,
      hasProfile: !!profile
    });

    // Don't redirect while still loading auth or profile
    if (authLoading || profileLoading) {
      console.log('Still loading auth or profile, waiting...');
      return;
    }

    // Only redirect after both auth and profile loading are complete
    if (!user) {
      console.log('No user found, redirecting to home');
      router.push('/');
      return;
    }

    if (!isAdmin) {
      console.log('User is not admin, redirecting to home', {
        userEmail: user.email,
        profileRole: profile?.role,
        isAdmin
      });
      router.push('/');
      return;
    }

    // User is admin, load admin data
    console.log('User is admin, loading admin data');
    loadAdminData();
  }, [user, authLoading, profileLoading, isAdmin, profile, router]);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load admin statistics
      const statsResult = await adminService.getAdminStats();
      if (statsResult.error) {
        setError(statsResult.error);
      } else {
        setStats({
          totalUsers: statsResult.totalUsers,
          totalAdmins: statsResult.totalAdmins,
          totalArticles: statsResult.totalArticles
        });
      }

      // Load users list
      const usersResult = await adminService.getAllUsers();
      if (usersResult.error) {
        setError(usersResult.error);
      } else {
        setUsers(usersResult.users);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    // Store the pending role change and show super admin modal
    setPendingRoleChange({ userId, newRole });
    setShowSuperAdminModal(true);
  };

  const handleSuperAdminSuccess = async () => {
    if (!pendingRoleChange) return;

    try {
      const result = await adminService.updateUserRole(pendingRoleChange.userId, pendingRoleChange.newRole);
      if (result.success) {
        // Refresh users list
        const usersResult = await adminService.getAllUsers();
        if (!usersResult.error) {
          setUsers(usersResult.users);
        }
        alert(`User role updated to ${pendingRoleChange.newRole}`);
      } else {
        alert(`Failed to update role: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    } finally {
      setPendingRoleChange(null);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      setAddAdminError('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAdminEmail.trim())) {
      setAddAdminError('Please enter a valid email address');
      return;
    }

    setAddAdminLoading(true);
    setAddAdminError(null);

    try {
      // First, try to find the user by email
      const result = await adminService.promoteUserToAdmin(newAdminEmail.trim());

      if (result.error) {
        setAddAdminError(result.error);
      } else {
        // Success - refresh the users list and close modal
        await loadAdminData();
        setShowAddAdminModal(false);
        setNewAdminEmail('');
        setAddAdminError(null);
      }
    } catch (error) {
      console.error('Error adding admin:', error);
      setAddAdminError('Failed to add admin. Please try again.');
    } finally {
      setAddAdminLoading(false);
    }
  };

  if (authLoading || profileLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">
              {authLoading ? 'Loading authentication...' :
               profileLoading ? 'Loading profile...' :
               'Loading admin dashboard...'}
            </p>

            {/* Debug info */}
            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left text-sm">
              <p><strong>Loading Debug Info:</strong></p>
              <p>Auth Loading: {authLoading ? 'true' : 'false'}</p>
              <p>Profile Loading: {profileLoading ? 'true' : 'false'}</p>
              <p>Dashboard Loading: {loading ? 'true' : 'false'}</p>
              <p>User: {user?.email || 'null'}</p>
              <p>Profile: {profile ? 'exists' : 'null'}</p>
              <p>Profile Role: {profile?.role || 'null'}</p>
              <p>Is Admin: {isAdmin ? 'true' : 'false'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You don&apos;t have admin privileges.</p>

            {/* Debug info */}
            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left text-sm max-w-md mx-auto">
              <p><strong>Debug Info:</strong></p>
              <p>Auth Loading: {authLoading ? 'true' : 'false'}</p>
              <p>Profile Loading: {profileLoading ? 'true' : 'false'}</p>
              <p>User: {user?.email || 'null'}</p>
              <p>User ID: {user?.id || 'null'}</p>
              <p>Profile: {profile ? 'exists' : 'null'}</p>
              <p>Profile ID: {profile?.id || 'null'}</p>
              <p>Profile Email: {profile?.email || 'null'}</p>
              <p>Profile Role: "{profile?.role || 'null'}"</p>
              <p>Profile Role Type: {typeof profile?.role}</p>
              <p>Is Admin: {isAdmin ? 'true' : 'false'}</p>
              <p>Role === 'admin': {profile?.role === 'admin' ? 'true' : 'false'}</p>
              <p>Role === 'super_admin': {profile?.role === 'super_admin' ? 'true' : 'false'}</p>
              <p>IDs Match: {user?.id === profile?.id ? 'true' : 'false'}</p>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Refresh Page
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="px-4 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage users, articles, and platform settings</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiSettings className="w-4 h-4 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiUsers className="w-4 h-4 inline mr-2" />
                Users ({stats.totalUsers})
              </button>
              <button
                onClick={() => setActiveTab('articles')}
                className={`px-6 py-4 font-medium text-sm ${
                  activeTab === 'articles'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiFileText className="w-4 h-4 inline mr-2" />
                Articles ({stats.totalArticles})
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Overview</h2>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <div className="flex items-center">
                        <FiUsers className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-blue-600">Total Users</p>
                          <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-6">
                      <div className="flex items-center">
                        <FiShield className="w-8 h-8 text-green-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-green-600">Admin Users</p>
                          <p className="text-2xl font-bold text-green-900">{stats.totalAdmins}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-6">
                      <div className="flex items-center">
                        <FiFileText className="w-8 h-8 text-purple-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-purple-600">Total Articles</p>
                          <p className="text-2xl font-bold text-purple-900">{stats.totalArticles}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <Link
                          href="/articles/create"
                          className="flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <FiPlus className="w-5 h-5" />
                          Create New Article
                        </Link>
                        <button
                          onClick={() => setActiveTab('users')}
                          className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors w-full text-left"
                        >
                          <FiUsers className="w-5 h-5" />
                          Manage Users
                        </button>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                      <p className="text-gray-600">Activity tracking coming soon...</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-gray-600">{users.length} total users</p>
                      <button
                        onClick={() => setShowAddAdminModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <FiUserPlus className="w-4 h-4" />
                        Add Admin
                      </button>
                    </div>
                  </div>

                  {/* Users Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Joined</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-green-600 font-medium text-sm">
                                    {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="font-medium text-gray-900">
                                  {user.full_name || 'No name'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{user.email}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === 'admin' || user.role === 'super_admin'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {user.role === 'user' ? (
                                  <button
                                    onClick={() => handleRoleChange(user.id, 'admin')}
                                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                                  >
                                    Make Admin
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleRoleChange(user.id, 'user')}
                                    className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                                  >
                                    Remove Admin
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'articles' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Article Management</h2>
                    <Link
                      href="/articles/create"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FiPlus className="w-4 h-4" />
                      Create Article
                    </Link>
                  </div>

                  <div className="text-center py-12">
                    <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Article Management</h3>
                    <p className="text-gray-600 mb-6">
                      Advanced article management features coming soon. For now, you can create and manage articles through the articles section.
                    </p>
                    <Link
                      href="/articles"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View All Articles
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Super Admin Modal */}
      <SuperAdminModal
        isOpen={showSuperAdminModal}
        onClose={() => {
          setShowSuperAdminModal(false);
          setPendingRoleChange(null);
        }}
        onSuccess={handleSuperAdminSuccess}
      />

      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Admin</h3>
              <button
                onClick={() => {
                  setShowAddAdminModal(false);
                  setNewAdminEmail('');
                  setAddAdminError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Enter the email address of the user you want to promote to admin.
                The user must have already signed up and logged in at least once.
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      id="adminEmail"
                      value={newAdminEmail}
                      onChange={(e) => {
                        setNewAdminEmail(e.target.value);
                        setAddAdminError(null);
                      }}
                      placeholder="user@example.com"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={addAdminLoading}
                    />
                  </div>
                </div>

                {addAdminError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{addAdminError}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddAdminModal(false);
                  setNewAdminEmail('');
                  setAddAdminError(null);
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={addAdminLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddAdmin}
                disabled={addAdminLoading || !newAdminEmail.trim()}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {addAdminLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </div>
                ) : (
                  'Add Admin'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
