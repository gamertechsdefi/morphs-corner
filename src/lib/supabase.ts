import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// For server-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For client-side operations (recommended for Next.js 13+)
export const createSupabaseClient = () => createClientComponentClient()

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_points: {
        Row: {
          id: string
          user_id: string
          total_points: number
          daily_streak: number
          last_claim_date: string | null
          level: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_points?: number
          daily_streak?: number
          last_claim_date?: string | null
          level?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_points?: number
          daily_streak?: number
          last_claim_date?: string | null
          level?: string
          created_at?: string
          updated_at?: string
        }
      }
      daily_tasks: {
        Row: {
          id: string
          user_id: string
          task_type: string
          completed: boolean
          points_earned: number
          completed_at: string | null
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_type: string
          completed?: boolean
          points_earned?: number
          completed_at?: string | null
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_type?: string
          completed?: boolean
          points_earned?: number
          completed_at?: string | null
          date?: string
          created_at?: string
        }
      }
      point_transactions: {
        Row: {
          id: string
          user_id: string
          points: number
          transaction_type: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          points: number
          transaction_type: string
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          points?: number
          transaction_type?: string
          description?: string
          created_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type UserPoints = Database['public']['Tables']['user_points']['Row']
export type DailyTask = Database['public']['Tables']['daily_tasks']['Row']
export type PointTransaction = Database['public']['Tables']['point_transactions']['Row']
