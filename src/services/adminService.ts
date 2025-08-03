import { createSupabaseClient } from '@/lib/supabase';
import type { Profile } from '@/lib/supabase';

export class AdminService {
  private supabase = createSupabaseClient();

  // Check if current user is admin
  async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session?.user) return false;

      const { data: profile } = await this.supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      return profile?.role === 'admin' || profile?.role === 'super_admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  // Check if user can create articles
  async canCreateArticles(): Promise<boolean> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session?.user) return false;

      const { data: profile } = await this.supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      return profile?.role === 'admin' || profile?.role === 'super_admin';
    } catch (error) {
      console.error('Error checking article creation permission:', error);
      return false;
    }
  }

  // Get all users (admin only)
  async getAllUsers(): Promise<{ users: Profile[]; error: string | null }> {
    try {
      const isAdmin = await this.isCurrentUserAdmin();
      if (!isAdmin) {
        return { users: [], error: 'Unauthorized: Admin access required' };
      }

      const { data: users, error } = await this.supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { users: [], error: error.message };
      }

      return { users: users || [], error: null };
    } catch (error) {
      return { users: [], error: 'Failed to fetch users' };
    }
  }

  // Update user role (admin only)
  async updateUserRole(userId: string, newRole: 'user' | 'admin'): Promise<{ success: boolean; error: string | null }> {
    try {
      const isAdmin = await this.isCurrentUserAdmin();
      if (!isAdmin) {
        return { success: false, error: 'Unauthorized: Admin access required' };
      }

      const { error } = await this.supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: 'Failed to update user role' };
    }
  }

  // Get admin statistics
  async getAdminStats(): Promise<{
    totalUsers: number;
    totalAdmins: number;
    totalArticles: number;
    error: string | null;
  }> {
    try {
      const isAdmin = await this.isCurrentUserAdmin();
      if (!isAdmin) {
        return { totalUsers: 0, totalAdmins: 0, totalArticles: 0, error: 'Unauthorized' };
      }

      // Get user counts
      const { count: totalUsers } = await this.supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: totalAdmins } = await this.supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('role', ['admin', 'super_admin']);

      // Get article count
      const { count: totalArticles } = await this.supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });

      return {
        totalUsers: totalUsers || 0,
        totalAdmins: totalAdmins || 0,
        totalArticles: totalArticles || 0,
        error: null
      };
    } catch (error) {
      return { totalUsers: 0, totalAdmins: 0, totalArticles: 0, error: 'Failed to fetch stats' };
    }
  }

  // Check if current user is super admin
  async isCurrentUserSuperAdmin(): Promise<boolean> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session?.user) return false;

      const { data: profile } = await this.supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      return profile?.role === 'super_admin';
    } catch (error) {
      console.error('Error checking super admin status:', error);
      return false;
    }
  }

  // Super admin can promote any user to admin (no email restrictions)
  async promoteUserToAdmin(emailOrUserId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const isSuperAdmin = await this.isCurrentUserSuperAdmin();
      if (!isSuperAdmin) {
        return { success: false, error: 'Super admin privileges required' };
      }

      // Check if input is email or userId
      const isEmail = emailOrUserId.includes('@');

      if (isEmail) {
        // Handle email-based promotion
        const { data: existingProfile, error: profileError } = await this.supabase
          .from('profiles')
          .select('id, email, role')
          .eq('email', emailOrUserId)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error checking existing profile:', profileError);
          return { success: false, error: 'Failed to check user profile' };
        }

        if (!existingProfile) {
          return { success: false, error: 'User not found. The user must sign up and log in at least once before being promoted to admin.' };
        }

        if (existingProfile.role === 'admin' || existingProfile.role === 'super_admin') {
          return { success: false, error: 'User is already an admin' };
        }

        const { error } = await this.supabase
          .from('profiles')
          .update({ role: 'admin', updated_at: new Date().toISOString() })
          .eq('email', emailOrUserId);

        if (error) {
          return { success: false, error: error.message };
        }
      } else {
        // Handle userId-based promotion (original functionality)
        const { error } = await this.supabase
          .from('profiles')
          .update({ role: 'admin', updated_at: new Date().toISOString() })
          .eq('id', emailOrUserId);

        if (error) {
          return { success: false, error: error.message };
        }
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error promoting user to admin:', error);
      return { success: false, error: 'Failed to promote user' };
    }
  }
}

// Export singleton instance
export const adminService = new AdminService();
