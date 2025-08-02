'use client';

import { useState, useEffect } from 'react';
import { FiGift, FiClock, FiStar } from 'react-icons/fi';

interface PointsSystemProps {
  userId?: string;
  onPointsUpdate?: (newPoints: number) => void;
}

interface UserPoints {
  totalPoints: number;
  dailyStreak: number;
  lastClaimTime: string | null;
  level: string;
}

export default function PointsSystem({ userId = 'default', onPointsUpdate }: PointsSystemProps) {
  const [userPoints, setUserPoints] = useState<UserPoints>({
    totalPoints: 0,
    dailyStreak: 0,
    lastClaimTime: null,
    level: 'Bronze'
  });
  const [canClaim, setCanClaim] = useState(true);
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  // Load user points from localStorage
  useEffect(() => {
    const savedPoints = localStorage.getItem(`userPoints_${userId}`);
    if (savedPoints) {
      setUserPoints(JSON.parse(savedPoints));
    }
  }, [userId]);

  // Save user points to localStorage
  const saveUserPoints = (points: UserPoints) => {
    localStorage.setItem(`userPoints_${userId}`, JSON.stringify(points));
    setUserPoints(points);
    if (onPointsUpdate) {
      onPointsUpdate(points.totalPoints);
    }
  };

  // Calculate user level based on points
  const calculateLevel = (points: number): string => {
    if (points >= 10000) return 'Diamond';
    if (points >= 5000) return 'Platinum';
    if (points >= 2500) return 'Gold';
    if (points >= 1000) return 'Silver';
    return 'Bronze';
  };

  // Check if user can claim daily points
  useEffect(() => {
    const checkClaimStatus = () => {
      if (userPoints.lastClaimTime) {
        const lastClaimDate = new Date(userPoints.lastClaimTime);
        const now = new Date();
        const timeDiff = now.getTime() - lastClaimDate.getTime();
        const hoursDiff = timeDiff / (1000 * 3600);
        
        if (hoursDiff < 24) {
          setCanClaim(false);
          const hoursLeft = 24 - hoursDiff;
          const hours = Math.floor(hoursLeft);
          const minutes = Math.floor((hoursLeft - hours) * 60);
          setTimeUntilNextClaim(`${hours}h ${minutes}m`);
        } else {
          setCanClaim(true);
          setTimeUntilNextClaim('');
        }
      }
    };

    checkClaimStatus();
    const interval = setInterval(checkClaimStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [userPoints.lastClaimTime]);

  // Claim daily points
  const claimDailyPoints = () => {
    if (!canClaim) return;
    
    setIsAnimating(true);
    const now = new Date().toISOString();
    const pointsToAdd = 50 + (userPoints.dailyStreak * 5); // Bonus points for streak
    const newTotalPoints = userPoints.totalPoints + pointsToAdd;
    const newLevel = calculateLevel(newTotalPoints);
    
    const updatedPoints: UserPoints = {
      totalPoints: newTotalPoints,
      dailyStreak: userPoints.dailyStreak + 1,
      lastClaimTime: now,
      level: newLevel
    };
    
    saveUserPoints(updatedPoints);
    setCanClaim(false);
    
    // Reset animation after 2 seconds
    setTimeout(() => setIsAnimating(false), 2000);
  };

  // Add points for activities
  // const addActivityPoints = (points: number, activity: string) => {
  //   const newTotalPoints = userPoints.totalPoints + points;
  //   const newLevel = calculateLevel(newTotalPoints);
    
  //   const updatedPoints: UserPoints = {
  //     ...userPoints,
  //     totalPoints: newTotalPoints,
  //     level: newLevel
  //   };
    
  //   saveUserPoints(updatedPoints);
    
  //   // Show notification (you can replace with a toast)
  //   console.log(`+${points} points for ${activity}!`);
  // };

  const getStreakBonus = () => {
    return userPoints.dailyStreak * 5;
  };

  const getNextLevelPoints = () => {
    const currentPoints = userPoints.totalPoints;
    if (currentPoints < 1000) return 1000 - currentPoints;
    if (currentPoints < 2500) return 2500 - currentPoints;
    if (currentPoints < 5000) return 5000 - currentPoints;
    if (currentPoints < 10000) return 10000 - currentPoints;
    return 0;
  };

  const getLevelProgress = () => {
    const currentPoints = userPoints.totalPoints;
    let levelStart = 0;
    let levelEnd = 1000;
    
    if (currentPoints >= 10000) return 100;
    if (currentPoints >= 5000) { levelStart = 5000; levelEnd = 10000; }
    else if (currentPoints >= 2500) { levelStart = 2500; levelEnd = 5000; }
    else if (currentPoints >= 1000) { levelStart = 1000; levelEnd = 2500; }
    
    return ((currentPoints - levelStart) / (levelEnd - levelStart)) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Points Overview */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Your Points</h3>
            <div className={`text-3xl font-bold transition-all duration-500 ${isAnimating ? 'scale-110 text-yellow-300' : ''}`}>
              {userPoints.totalPoints.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <FiStar className="w-5 h-5" />
              <span className="font-semibold">{userPoints.level}</span>
            </div>
            <div className="text-sm opacity-90">
              {getNextLevelPoints() > 0 ? `${getNextLevelPoints()} to next level` : 'Max level reached!'}
            </div>
          </div>
        </div>
        
        {/* Level Progress Bar */}
        <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mb-4">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-500"
            style={{ width: `${getLevelProgress()}%` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between text-sm opacity-90">
          <span>Streak: {userPoints.dailyStreak} days</span>
          <span>Level Progress: {Math.round(getLevelProgress())}%</span>
        </div>
      </div>

      {/* Daily Claim */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiGift className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Daily Reward</h4>
              <p className="text-sm text-gray-600">
                {50 + getStreakBonus()} points available
                {getStreakBonus() > 0 && (
                  <span className="text-green-600 font-medium"> (+{getStreakBonus()} streak bonus)</span>
                )}
              </p>
            </div>
          </div>
          
          {!canClaim && (
            <div className="flex items-center gap-2 text-gray-500">
              <FiClock className="w-4 h-4" />
              <span className="text-sm">{timeUntilNextClaim}</span>
            </div>
          )}
        </div>
        
        <button
          onClick={claimDailyPoints}
          disabled={!canClaim}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
            canClaim
              ? 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          } ${isAnimating ? 'animate-pulse' : ''}`}
        >
          {canClaim ? 'Claim Daily Points' : 'Already Claimed Today'}
        </button>
      </div>

      {/* Activity Points */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4">Earn More Points</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-xl">📖</span>
              <span className="text-sm font-medium">Read an article</span>
            </div>
            <span className="text-sm font-semibold text-green-600">+10 pts</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-xl">💬</span>
              <span className="text-sm font-medium">Leave a comment</span>
            </div>
            <span className="text-sm font-semibold text-green-600">+5 pts</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-xl">📱</span>
              <span className="text-sm font-medium">Share content</span>
            </div>
            <span className="text-sm font-semibold text-green-600">+15 pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
