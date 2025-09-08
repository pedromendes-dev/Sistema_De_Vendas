import { z } from "zod";

// Supabase Schema Types
export interface Attendant {
  id: string;
  name: string;
  imageUrl: string | null;
  earnings: number;
  createdAt: string;
  updatedAt: string;
}

export interface InsertAttendant {
  name: string;
  imageUrl?: string | null;
  earnings?: number;
}

export interface Sale {
  id: string;
  attendantId: string;
  value: number;
  clientName: string | null;
  clientPhone: string | null;
  clientEmail: string | null;
  createdAt: string;
}

export interface InsertSale {
  attendantId: string;
  value: number;
  clientName?: string | null;
  clientPhone?: string | null;
  clientEmail?: string | null;
}

export interface Admin {
  id: string;
  username: string;
  password: string;
  email: string | null;
  role: string;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InsertAdmin {
  username: string;
  password: string;
  email?: string | null;
  role?: string;
  isActive?: boolean;
  createdBy?: string | null;
}

export interface Goal {
  id: string;
  attendantId: string;
  title: string;
  description: string | null;
  targetValue: number;
  currentValue: number;
  goalType: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface InsertGoal {
  attendantId: string;
  title: string;
  description?: string | null;
  targetValue: number;
  currentValue?: number;
  goalType: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface Achievement {
  id: string;
  attendantId: string;
  title: string;
  description: string | null;
  achievedAt: string;
  createdAt: string;
}

export interface InsertAchievement {
  attendantId: string;
  title: string;
  description?: string | null;
  achievedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface InsertNotification {
  title: string;
  message: string;
  type: string;
  isRead?: boolean;
}

export interface Leaderboard {
  id: string;
  attendantId: string;
  position: number;
  totalSales: number;
  period: string;
  createdAt: string;
}

export interface InsertLeaderboard {
  attendantId: string;
  position: number;
  totalSales: number;
  period: string;
}

// Zod Schemas for validation
export const insertAttendantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  imageUrl: z.string().url().nullable().optional(),
  earnings: z.number().min(0).optional(),
});

export const insertSaleSchema = z.object({
  attendantId: z.string().min(1, "Attendant ID is required"),
  value: z.number().min(0.01, "Value must be greater than 0"),
  clientName: z.string().nullable().optional(),
  clientPhone: z.string().nullable().optional(),
  clientEmail: z.string().email().nullable().optional(),
});

export const insertAdminSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  email: z.string().email().nullable().optional(),
  role: z.string().default("admin"),
  isActive: z.boolean().default(true),
  createdBy: z.string().nullable().optional(),
});

export const insertGoalSchema = z.object({
  attendantId: z.string().min(1, "Attendant ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  targetValue: z.number().min(0.01, "Target value must be greater than 0"),
  currentValue: z.number().min(0).default(0),
  goalType: z.string().min(1, "Goal type is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isActive: z.boolean().default(true),
});

export const insertAchievementSchema = z.object({
  attendantId: z.string().min(1, "Attendant ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  achievedAt: z.string().min(1, "Achieved at is required"),
});

export const insertNotificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: z.string().min(1, "Type is required"),
  isRead: z.boolean().default(false),
});

export const insertLeaderboardSchema = z.object({
  attendantId: z.string().min(1, "Attendant ID is required"),
  position: z.number().min(1, "Position must be at least 1"),
  totalSales: z.number().min(0, "Total sales cannot be negative"),
  period: z.string().min(1, "Period is required"),
});
