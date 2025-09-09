import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://wgxnnylsmfvzyhzubzjb.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndneG5ueWxzbWZ2enloenViempiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjAzOTMsImV4cCI6MjA3Mjc5NjM5M30.evVEOaqpJ8qJVfQ0M1pALXzY3RVjeZ0dNBFNakqvzmM'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      attendants: {
        Row: {
          id: string
          name: string
          image_url: string | null
          earnings: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          image_url?: string | null
          earnings?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          image_url?: string | null
          earnings?: number
          created_at?: string
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          attendant_id: string
          value: number
          client_name: string | null
          client_phone: string | null
          client_email: string | null
          created_at: string
        }
        Insert: {
          id?: string
          attendant_id: string
          value: number
          client_name?: string | null
          client_phone?: string | null
          client_email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          attendant_id?: string
          value?: number
          client_name?: string | null
          client_phone?: string | null
          client_email?: string | null
          created_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          attendant_id: string
          title: string
          description: string | null
          target_value: number
          current_value: number
          goal_type: string
          start_date: string
          end_date: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          attendant_id: string
          title: string
          description?: string | null
          target_value: number
          current_value?: number
          goal_type: string
          start_date: string
          end_date: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          attendant_id?: string
          title?: string
          description?: string | null
          target_value?: number
          current_value?: number
          goal_type?: string
          start_date?: string
          end_date?: string
          is_active?: boolean
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          attendant_id: string
          title: string
          description: string | null
          achieved_at: string
          created_at: string
        }
        Insert: {
          id?: string
          attendant_id: string
          title: string
          description?: string | null
          achieved_at: string
          created_at?: string
        }
        Update: {
          id?: string
          attendant_id?: string
          title?: string
          description?: string | null
          achieved_at?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          title: string
          message: string
          type: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          message: string
          type: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
          created_at?: string
        }
      }
      admins: {
        Row: {
          id: string
          username: string
          password: string
          email: string | null
          role: string
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          password: string
          email?: string | null
          role: string
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          password?: string
          email?: string | null
          role?: string
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

