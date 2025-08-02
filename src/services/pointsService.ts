import { createSupabaseClient } from '@/lib/supabase';
import type { UserPoints, DailyTask, PointTransaction } from '@/lib/supabase';

export class PointsService {
  private supabase = createSupabaseClient();

  // Calculate user level based on points
  calculateLevel(points: number): string {
    if (points >= 10000) return 'Diamond';
    if (points >= 5000) return 'Platinum';
    if (points >= 2500) return 'Gold';
    if (points >= 1000) return 'Silver';
    return 'Bronze';
  }

  // Get user points
  async getUserPoints() {
    try {
      const response = await fetch('/api/points/user-points');

      if (!response.ok) {
        console.error('Error fetching user points:', response.statusText);
        return null;
      }

      const data = await response.json();
      return data.userPoints;
    } catch (error) {
      console.error('Error fetching user points:', error);
      return null;
    }
  }

  // Initialize user points (called when user signs up)
  async initializeUserPoints(userId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase
        .from('user_points')
        .insert({
          user_id: userId,
          total_points: 0,
          daily_streak: 0,
          level: 'Bronze'
        });

      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Unknown error occurred') };
    }
  }

  // Check if user can claim daily points
  async canClaimDailyPoints(userId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/points/user-points');

      if (!response.ok) {
        console.error('Error checking claim status:', response.statusText);
        return false;
      }

      const data = await response.json();
      return data.canClaim;
    } catch (error) {
      console.error('Error checking claim status:', error);
      return false;
    }
  }

  // Claim daily points
  async claimDailyPoints(userId: string): Promise<{ success: boolean; points?: number; error?: string }> {
    try {
      const response = await fetch('/api/points/claim-daily', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      return { success: true, points: data.points };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  // Add points for activities
  async addActivityPoints(
    userId: string,
    points: number,
    activityType: string,
    description: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const userPoints = await this.getUserPoints();
      if (!userPoints) {
        return { success: false, error: 'User points not found' };
      }

      const newTotalPoints = userPoints.total_points + points;
      const newLevel = this.calculateLevel(newTotalPoints);

      // Update user points
      const { error: updateError } = await this.supabase
        .from('user_points')
        .update({
          total_points: newTotalPoints,
          level: newLevel,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        return { success: false, error: updateError.message || 'Failed to update points' };
      }

      // Record transaction
      await this.addPointTransaction(userId, points, activityType, description);

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  // Add point transaction record
  async addPointTransaction(
    userId: string,
    points: number,
    transactionType: string,
    description: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('point_transactions')
        .insert({
          user_id: userId,
          points,
          transaction_type: transactionType,
          description
        });
    } catch (error) {
      console.error('Error adding point transaction:', error);
    }
  }

  // Get user's point transaction history
  async getPointHistory(userId: string, limit: number = 50): Promise<PointTransaction[]> {
    try {
      const { data, error } = await this.supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching point history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching point history:', error);
      return [];
    }
  }

  // Get daily tasks for user
  async getDailyTasks(userId: string, date: string): Promise<DailyTask[]> {
    try {
      const { data, error } = await this.supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date);

      if (error) {
        console.error('Error fetching daily tasks:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching daily tasks:', error);
      return [];
    }
  }

  // Complete a daily task
  async completeTask(
    userId: string,
    taskType: string,
    points: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/points/complete-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskType, points }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  // Get time until next daily claim
  async getTimeUntilNextClaim(userId: string): Promise<string> {
    try {
      const response = await fetch('/api/points/user-points');

      if (!response.ok) {
        console.error('Error getting time until next claim:', response.statusText);
        return '';
      }

      const data = await response.json();
      return data.timeUntilNextClaim || '';
    } catch (error) {
      console.error('Error calculating time until next claim:', error);
      return '';
    }
  }
}

export const pointsService = new PointsService();
