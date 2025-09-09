import { pgTable, text, serial, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const attendants = pgTable("attendants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  earnings: decimal("earnings", { precision: 10, scale: 2 }).default("0.00").notNull(),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  attendantId: integer("attendant_id").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  clientName: text("client_name"),
  clientPhone: text("client_phone"),
  clientEmail: text("client_email"),
  clientAddress: text("client_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role").default("admin").notNull(), // 'admin', 'super_admin'
  isActive: integer("is_active").default(1).notNull(), // 1 for active, 0 for inactive
  createdBy: integer("created_by"), // ID of the admin who created this admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  attendantId: integer("attendant_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  targetValue: decimal("target_value", { precision: 10, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 10, scale: 2 }).default("0.00").notNull(),
  goalType: text("goal_type").notNull(), // 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  deadline: timestamp("deadline"),
  isActive: integer("is_active").default(1).notNull(), // 1 for active, 0 for inactive
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  attendantId: integer("attendant_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  icon: text("icon").notNull(),
  badgeColor: text("badge_color").default("#10b981").notNull(),
  pointsAwarded: integer("points_awarded").default(0).notNull(),
  points: integer("points").default(0).notNull(),
  achievedAt: timestamp("achieved_at").defaultNow().notNull(),
  unlockedAt: timestamp("unlocked_at"),
});

export const leaderboard = pgTable("leaderboard", {
  id: serial("id").primaryKey(),
  attendantId: integer("attendant_id").notNull(),
  totalPoints: integer("total_points").default(0).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  bestStreak: integer("best_streak").default(0).notNull(),
  rank: integer("rank").default(0).notNull(),
  points: integer("points").default(0).notNull(),
  salesStreak: integer("sales_streak").default(0).notNull(),
  lastSaleDate: timestamp("last_sale_date"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'sale', 'achievement', 'goal_progress', 'team_milestone'
  title: text("title").notNull(),
  message: text("message").notNull(),
  attendantId: integer("attendant_id"), // nullable for team-wide notifications
  metadata: text("metadata"), // JSON string for additional data
  isRead: integer("is_read").default(0).notNull(), // 0 = unread, 1 = read
  priority: text("priority").default("normal").notNull(), // 'low', 'normal', 'high', 'urgent'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAttendantSchema = z.object({
  name: z.string(),
  imageUrl: z.string(),
});

export const insertSaleSchema = z.object({
  attendantId: z.number(),
  value: z.string(),
  clientName: z.string().optional(),
  clientPhone: z.string().optional(),
  clientEmail: z.string().optional(),
  clientAddress: z.string().optional(),
});

export const insertAdminSchema = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string().optional(),
  role: z.string().default("admin"),
  isActive: z.number().default(1),
  createdBy: z.number().optional(),
});

export const insertGoalSchema = z.object({
  attendantId: z.number(),
  title: z.string(),
  description: z.string().optional(),
  targetValue: z.string(),
  goalType: z.string(),
  startDate: z.string().transform(val => new Date(val)),
  endDate: z.string().transform(val => new Date(val)),
  deadline: z.string().transform(val => new Date(val)).optional(),
  isActive: z.number().default(1).optional(),
});

export const insertAchievementSchema = z.object({
  attendantId: z.number(),
  title: z.string(),
  description: z.string().optional(),
  icon: z.string(),
  badgeColor: z.string().default("#10b981"),
  pointsAwarded: z.number().default(0),
  points: z.number().default(0),
  unlockedAt: z.string().transform(val => new Date(val)).optional(),
});

export const insertLeaderboardSchema = z.object({
  attendantId: z.number(),
  totalPoints: z.number().default(0),
  currentStreak: z.number().default(0),
  bestStreak: z.number().default(0),
  rank: z.number().default(0),
  points: z.number().default(0),
  salesStreak: z.number().default(0),
  lastSaleDate: z.string().transform(val => new Date(val)).optional(),
});

export const insertNotificationSchema = z.object({
  type: z.string(),
  title: z.string(),
  message: z.string(),
  attendantId: z.number().optional(),
  metadata: z.string().optional(),
  isRead: z.number().default(0),
  priority: z.string().default("normal"),
});

export type InsertAttendant = z.infer<typeof insertAttendantSchema>;
export type Attendant = typeof attendants.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof sales.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertLeaderboard = z.infer<typeof insertLeaderboardSchema>;
export type Leaderboard = typeof leaderboard.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;