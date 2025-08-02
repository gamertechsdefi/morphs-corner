'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from "@/components/Header";
import { useAuth } from '@/contexts/AuthContext';
import { pointsService } from '@/services/pointsService';
import { FiUser, FiMail, FiCalendar, FiTrendingUp, FiGift, FiClock, FiCheck, FiStar, FiLogOut, FiSettings, FiEdit3 } from 'react-icons/fi';
import type { UserPoints } from '@/lib/supabase';

// Mock user data - replace with actual user data from your auth system
const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: '/api/placeholder/100/100',
  joinDate: '2024-01-15',
  totalPoints: 2450,
  dailyStreak: 7,
  level: 'Gold Member',
  articlesRead: 45,
  lastLogin: new Date().toISOString(),
};

// Mock daily tasks
const dailyTasks = [
  { id: 1, title: 'Read an article', points: 10, completed: true, icon: '📖' },
  { id: 2, title: 'Share on social media', points: 15, completed: false, icon: '📱' },
  { id: 3, title: 'Comment on an article', points: 5, completed: false, icon: '💬' },
  { id: 4, title: 'Visit the site daily', points: 20, completed: true, icon: '🎯' },
];

export default function Dashboard() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [tasks, setTasks] = useState(dailyTasks);
  const [canClaim, setCanClaim] = useState(true);
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState('');
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Load user data and points
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Ensure profile exists
        if (!profile) {
          // Profile will be loaded by AuthContext, but let's wait a bit
          setTimeout(() => {
            if (!profile) {
              console.log('Profile not found, it may still be loading...');
            }
          }, 2000);
        }

        // Get user points (this will create them if they don't exist)
        const points = await pointsService.getUserPoints(user.id);
        if (points) {
          setUserPoints(points);
          setNeedsSetup(false);
        } else {
          // If we can't get points, probably need database setup
          setNeedsSetup(true);
        }

        // Check claim status
        const canClaimDaily = await pointsService.canClaimDailyPoints(user.id);
        setCanClaim(canClaimDaily);

        if (!canClaimDaily) {
          const timeLeft = await pointsService.getTimeUntilNextClaim(user.id);
          setTimeUntilNextClaim(timeLeft);
        }

      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user, profile]);

  // Update claim status periodically
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      const canClaimDaily = await pointsService.canClaimDailyPoints(user.id);
      setCanClaim(canClaimDaily);

      if (!canClaimDaily) {
        const timeLeft = await pointsService.getTimeUntilNextClaim(user.id);
        setTimeUntilNextClaim(timeLeft);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user]);

  const claimDailyPoints = async () => {
    if (!canClaim || !user) return;

    try {
      const result = await pointsService.claimDailyPoints(user.id);

      if (result.success) {
        // Refresh user points
        const updatedPoints = await pointsService.getUserPoints(user.id);
        if (updatedPoints) {
          setUserPoints(updatedPoints);
        }

        setCanClaim(false);
        alert(`Daily points claimed! +${result.points} points`);
      } else {
        alert('Failed to claim daily points. Please try again.');
      }
    } catch (error) {
      console.error('Error claiming daily points:', error);
      alert('An error occurred while claiming points.');
    }
  };

  const completeTask = async (taskId: number) => {
    if (!user) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const result = await pointsService.completeTask(user.id, task.title, task.points);

      if (result.success) {
        // Update local task state
        setTasks(prev => prev.map(t =>
          t.id === taskId
            ? { ...t, completed: true }
            : t
        ));

        // Refresh user points
        const updatedPoints = await pointsService.getUserPoints(user.id);
        if (updatedPoints) {
          setUserPoints(updatedPoints);
        }

        alert(`Task completed! +${task.points} points`);
      } else {
        alert('Failed to complete task. Please try again.');
      }
    } catch (error) {
      console.error('Error completing task:', error);
      alert('An error occurred while completing the task.');
    }
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut();
      router.push('/');
    }
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTaskPoints = tasks.reduce((sum, task) => task.completed ? sum + task.points : sum, 0);

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show setup message if database needs setup
  if (needsSetup && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 1.79 4 4 4h8c0-2.21-1.79-4-4-4H8c-2.21 0-4-1.79-4-4V7" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7c0-2.21 1.79-4 4-4h8c2.21 0 4 1.79 4 4v10c0 2.21-1.79 4-4 4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Database Setup Required</h2>
            <p className="text-gray-600 mb-6">
              Welcome! It looks like this is your first time here. We need to set up your database tables to get started with the points system.
            </p>
            <div className="space-y-3">
              <a
                href="/setup"
                className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Set Up Database
              </a>
              <button
                onClick={() => router.push('/')}
                className="block w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Please log in to access your dashboard.</p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Go Home
            </button>
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
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'User'}! 👋
            </h1>
            <p className="text-gray-600">
              Here's your Web3 journey overview and daily rewards.
            </p>
          </div>

           {/* Daily Points Claim Section */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-xl p-8 text-white mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Daily Points Reward</h2>
                    <p className="text-green-100">
                      Claim your daily 50 points to maintain your streak!
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <FiGift className="w-8 h-8" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">50</div>
                      <div className="text-sm text-green-100">Points</div>
                    </div>
                    {!canClaim && (
                      <div className="flex items-center gap-2 text-green-100">
                        <FiClock className="w-4 h-4" />
                        <span className="text-sm">Next claim in: {timeUntilNextClaim}</span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={claimDailyPoints}
                    disabled={!canClaim}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      canClaim
                        ? 'bg-white text-green-600 hover:bg-gray-100 transform hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {canClaim ? 'Claim Now' : 'Already Claimed'}
                  </button>
                </div>
              </div>

              {/* Daily Tasks */}
              {/* <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Daily Tasks</h3>
                  <div className="text-sm text-gray-600">
                    {completedTasks}/{tasks.length} completed • {totalTaskPoints} points earned
                  </div>
                </div>

                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                        task.completed
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-white hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{task.icon}</div>
                        <div>
                          <h4 className={`font-medium ${task.completed ? 'text-green-700' : 'text-gray-900'}`}>
                            {task.title}
                          </h4>
                          <p className="text-sm text-gray-600">+{task.points} points</p>
                        </div>
                      </div>
                      
                      {task.completed ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <FiCheck className="w-5 h-5" />
                          <span className="text-sm font-medium">Completed</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => completeTask(task.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div> */}
            </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Points */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Points</p>
                  <p className="text-2xl font-bold text-green-600">
                    {userPoints?.total_points?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiTrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Daily Streak */}
            {/* <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Daily Streak</p>
                  <p className="text-2xl font-bold text-green-600">
                    {userPoints?.daily_streak || 0} days
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FiCalendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div> */}

            {/* Articles Read */}
            {/* <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Articles Read</p>
                  <p className="text-2xl font-bold text-green-600">0</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiUser className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div> */}

            {/* Member Level */}
            {/* <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Member Level</p>
                  <p className="text-lg font-bold text-green-600">
                    {userPoints?.level || 'Bronze'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FiStar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div> */}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           

            {/* User Profile Sidebar */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <FiUser className="w-10 h-10 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                  </h3>
                  <p className="text-gray-600">{userPoints?.level || 'Bronze'}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FiMail className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">{profile?.email || user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiCalendar className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Joined {new Date(profile?.created_at || user?.created_at || new Date()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <FiEdit3 className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">Edit Profile</div>
                        <div className="text-sm text-gray-600">Update your information</div>
                      </div>
                    </div>
                  </button>
                  <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <FiClock className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">View History</div>
                        <div className="text-sm text-gray-600">See your activity log</div>
                      </div>
                    </div>
                  </button>
                  <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <FiSettings className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">Settings</div>
                        <div className="text-sm text-gray-600">Manage preferences</div>
                      </div>
                    </div>
                  </button>

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-3"></div>

                  {/* Logout Button */}
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <FiLogOut className="w-4 h-4 text-red-400 group-hover:text-red-600" />
                      <div>
                        <div className="font-medium text-red-600 group-hover:text-red-700">Sign Out</div>
                        <div className="text-sm text-red-500">Log out of your account</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
