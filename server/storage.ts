import { attendants, sales, admins, goals, achievements, leaderboard, type Attendant, type InsertAttendant, type Sale, type InsertSale, type Admin, type Goal, type InsertGoal, type Achievement, type InsertAchievement, type Leaderboard, type InsertLeaderboard } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  // Attendants
  getAllAttendants(): Promise<Attendant[]>;
  getAttendant(id: number): Promise<Attendant | undefined>;
  createAttendant(attendant: InsertAttendant): Promise<Attendant>;
  updateAttendantEarnings(id: number, earnings: string): Promise<Attendant | undefined>;
  
  // Sales
  getAllSales(): Promise<Sale[]>;
  getSalesByAttendant(attendantId: number): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;
  
  // Admins
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  
  // Goals
  getAllGoals(): Promise<Goal[]>;
  getGoalsByAttendant(attendantId: number): Promise<Goal[]>;
  getActiveGoalsByAttendant(attendantId: number): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoalProgress(id: number, currentValue: string): Promise<Goal | undefined>;
  deactivateGoal(id: number): Promise<Goal | undefined>;
  
  // Achievements
  getAllAchievements(): Promise<Achievement[]>;
  getAchievementsByAttendant(attendantId: number): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  
  // Leaderboard
  getAllLeaderboard(): Promise<Leaderboard[]>;
  getLeaderboardByAttendant(attendantId: number): Promise<Leaderboard | undefined>;
  updateLeaderboard(attendantId: number, totalPoints: number, currentStreak: number, bestStreak: number): Promise<Leaderboard>;
  updateLeaderboardRanks(): Promise<void>;
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

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
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
}

export const storage = new DatabaseStorage();
