import { 
  attendants, 
  sales, 
  admins, 
  goals, 
  achievements, 
  leaderboard, 
  notifications,
  type Attendant, 
  type InsertAttendant, 
  type Sale, 
  type InsertSale, 
  type Admin, 
  type InsertAdmin,
  type Goal, 
  type InsertGoal, 
  type Achievement, 
  type InsertAchievement, 
  type Leaderboard, 
  type InsertLeaderboard,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  // Attendants
  getAllAttendants(): Promise<Attendant[]>;
  getAttendant(id: number): Promise<Attendant | undefined>;
  createAttendant(attendant: InsertAttendant): Promise<Attendant>;
  updateAttendantEarnings(id: number, earnings: string): Promise<Attendant | undefined>;
  deleteAttendant(id: number): Promise<boolean>;
  
  // Sales
  getAllSales(): Promise<Sale[]>;
  getSalesByAttendant(attendantId: number): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;
  deleteSale(id: number): Promise<boolean>;
  
  // Admins
  getAllAdmins(): Promise<Admin[]>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  updateAdmin(id: number, updates: Partial<Admin>): Promise<Admin | undefined>;
  deleteAdmin(id: number): Promise<boolean>;
  activateAdmin(id: number): Promise<Admin | undefined>;
  deactivateAdmin(id: number): Promise<Admin | undefined>;
  
  // Goals
  getAllGoals(): Promise<Goal[]>;
  getGoalsByAttendant(attendantId: number): Promise<Goal[]>;
  getActiveGoalsByAttendant(attendantId: number): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoalProgress(id: number, currentValue: string): Promise<Goal | undefined>;
  deactivateGoal(id: number): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;
  
  // Achievements
  getAllAchievements(): Promise<Achievement[]>;
  getAchievementsByAttendant(attendantId: number): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  
  // Leaderboard
  getAllLeaderboard(): Promise<Leaderboard[]>;
  getLeaderboardByAttendant(attendantId: number): Promise<Leaderboard | undefined>;
  updateLeaderboard(attendantId: number, totalPoints: number, currentStreak: number, bestStreak: number): Promise<Leaderboard>;
  updateLeaderboardRanks(): Promise<void>;
  
  // Notifications
  getAllNotifications(): Promise<Notification[]>;
  getUnreadNotifications(): Promise<Notification[]>;
  getNotificationsByAttendant(attendantId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<boolean>;
  markAllNotificationsAsRead(): Promise<boolean>;
  deleteNotification(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getAllAttendants(): Promise<Attendant[]> {
    const result = await db.select().from(attendants);
    return result;
  }

  async getAttendant(id: number): Promise<Attendant | undefined> {
    const [attendant] = await db.select().from(attendants).where(eq(attendants.id, id));
    return attendant || undefined;
  }

  async createAttendant(insertAttendant: InsertAttendant): Promise<Attendant> {
    const [attendant] = await db
      .insert(attendants)
      .values(insertAttendant)
      .returning();
    return attendant;
  }

  async updateAttendantEarnings(id: number, earnings: string): Promise<Attendant | undefined> {
    const [attendant] = await db
      .update(attendants)
      .set({ earnings })
      .where(eq(attendants.id, id))
      .returning();
    return attendant || undefined;
  }

  async deleteAttendant(id: number): Promise<boolean> {
    try {
      // Delete related sales first
      await db.delete(sales).where(eq(sales.attendantId, id));
      // Delete related goals
      await db.delete(goals).where(eq(goals.attendantId, id));
      // Delete related achievements
      await db.delete(achievements).where(eq(achievements.attendantId, id));
      // Delete related leaderboard entries
      await db.delete(leaderboard).where(eq(leaderboard.attendantId, id));
      // Finally delete the attendant
      const result = await db.delete(attendants).where(eq(attendants.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }

  async getAllSales(): Promise<Sale[]> {
    const result = await db.select().from(sales);
    return result;
  }

  async getSalesByAttendant(attendantId: number): Promise<Sale[]> {
    const result = await db.select().from(sales).where(eq(sales.attendantId, attendantId));
    return result;
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const [sale] = await db
      .insert(sales)
      .values(insertSale)
      .returning();
    
    // Update attendant earnings
    const attendant = await this.getAttendant(insertSale.attendantId);
    if (attendant) {
      const currentEarnings = parseFloat(attendant.earnings);
      const saleValue = parseFloat(insertSale.value);
      const newEarnings = (currentEarnings + saleValue).toFixed(2);
      await this.updateAttendantEarnings(insertSale.attendantId, newEarnings);
    }
    
    return sale;
  }

  async deleteSale(id: number): Promise<boolean> {
    try {
      // Get the sale first to update attendant earnings
      const [sale] = await db.select().from(sales).where(eq(sales.id, id));
      if (sale) {
        const attendant = await this.getAttendant(sale.attendantId);
        if (attendant) {
          const currentEarnings = parseFloat(attendant.earnings);
          const saleValue = parseFloat(sale.value);
          const newEarnings = Math.max(0, currentEarnings - saleValue).toFixed(2);
          await this.updateAttendantEarnings(sale.attendantId, newEarnings);
        }
      }
      
      await db.delete(sales).where(eq(sales.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }

  async getAllAdmins(): Promise<Admin[]> {
    const result = await db.select().from(admins).orderBy(asc(admins.createdAt));
    return result;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin || undefined;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const [admin] = await db
      .insert(admins)
      .values(insertAdmin)
      .returning();
    return admin;
  }

  async updateAdmin(id: number, updates: Partial<Admin>): Promise<Admin | undefined> {
    const [admin] = await db
      .update(admins)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(admins.id, id))
      .returning();
    return admin || undefined;
  }

  async deleteAdmin(id: number): Promise<boolean> {
    const result = await db.delete(admins).where(eq(admins.id, id));
    return (result.rowCount || 0) > 0;
  }

  async activateAdmin(id: number): Promise<Admin | undefined> {
    const [admin] = await db
      .update(admins)
      .set({ isActive: 1, updatedAt: new Date() })
      .where(eq(admins.id, id))
      .returning();
    return admin || undefined;
  }

  async deactivateAdmin(id: number): Promise<Admin | undefined> {
    const [admin] = await db
      .update(admins)
      .set({ isActive: 0, updatedAt: new Date() })
      .where(eq(admins.id, id))
      .returning();
    return admin || undefined;
  }

  // Goals methods
  async getAllGoals(): Promise<Goal[]> {
    return await db.select().from(goals).orderBy(desc(goals.createdAt));
  }

  async getGoalsByAttendant(attendantId: number): Promise<Goal[]> {
    return await db.select().from(goals).where(eq(goals.attendantId, attendantId)).orderBy(desc(goals.createdAt));
  }

  async getActiveGoalsByAttendant(attendantId: number): Promise<Goal[]> {
    return await db.select().from(goals).where(
      and(eq(goals.attendantId, attendantId), eq(goals.isActive, 1))
    ).orderBy(desc(goals.createdAt));
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const [goal] = await db.insert(goals).values(insertGoal).returning();
    return goal;
  }

  async updateGoalProgress(id: number, currentValue: string): Promise<Goal | undefined> {
    const [goal] = await db.update(goals)
      .set({ currentValue })
      .where(eq(goals.id, id))
      .returning();
    return goal || undefined;
  }

  async deactivateGoal(id: number): Promise<Goal | undefined> {
    const [goal] = await db.update(goals)
      .set({ isActive: 0 })
      .where(eq(goals.id, id))
      .returning();
    return goal || undefined;
  }

  async deleteGoal(id: number): Promise<boolean> {
    try {
      await db.delete(goals).where(eq(goals.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }

  // Achievements methods
  async getAllAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements).orderBy(desc(achievements.achievedAt));
  }

  async getAchievementsByAttendant(attendantId: number): Promise<Achievement[]> {
    return await db.select().from(achievements).where(eq(achievements.attendantId, attendantId)).orderBy(desc(achievements.achievedAt));
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db.insert(achievements).values(insertAchievement).returning();
    return achievement;
  }

  // Leaderboard methods
  async getAllLeaderboard(): Promise<Leaderboard[]> {
    return await db.select().from(leaderboard).orderBy(asc(leaderboard.rank));
  }

  async getLeaderboardByAttendant(attendantId: number): Promise<Leaderboard | undefined> {
    const [entry] = await db.select().from(leaderboard).where(eq(leaderboard.attendantId, attendantId));
    return entry || undefined;
  }

  async updateLeaderboard(attendantId: number, totalPoints: number, currentStreak: number, bestStreak: number): Promise<Leaderboard> {
    const existingEntry = await this.getLeaderboardByAttendant(attendantId);
    
    if (existingEntry) {
      const [entry] = await db.update(leaderboard)
        .set({
          totalPoints,
          currentStreak,
          bestStreak,
          updatedAt: new Date()
        })
        .where(eq(leaderboard.attendantId, attendantId))
        .returning();
      return entry;
    } else {
      const [entry] = await db.insert(leaderboard)
        .values({
          attendantId,
          totalPoints,
          currentStreak,
          bestStreak,
          rank: 0
        })
        .returning();
      return entry;
    }
  }

  async updateLeaderboardRanks(): Promise<void> {
    const entries = await db.select().from(leaderboard).orderBy(desc(leaderboard.totalPoints));
    
    for (let i = 0; i < entries.length; i++) {
      await db.update(leaderboard)
        .set({ rank: i + 1 })
        .where(eq(leaderboard.id, entries[i].id));
    }
  }

  // Notification methods
  async getAllNotifications(): Promise<Notification[]> {
    const result = await db.select().from(notifications).orderBy(desc(notifications.createdAt));
    return result;
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    const result = await db
      .select()
      .from(notifications)
      .where(eq(notifications.isRead, 0))
      .orderBy(desc(notifications.createdAt));
    return result;
  }

  async getNotificationsByAttendant(attendantId: number): Promise<Notification[]> {
    const result = await db
      .select()
      .from(notifications)
      .where(eq(notifications.attendantId, attendantId))
      .orderBy(desc(notifications.createdAt));
    return result;
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    try {
      await db
        .update(notifications)
        .set({ isRead: 1 })
        .where(eq(notifications.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }

  async markAllNotificationsAsRead(): Promise<boolean> {
    try {
      await db
        .update(notifications)
        .set({ isRead: 1 })
        .where(eq(notifications.isRead, 0));
      return true;
    } catch (error) {
      return false;
    }
  }

  async deleteNotification(id: number): Promise<boolean> {
    try {
      await db.delete(notifications).where(eq(notifications.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
