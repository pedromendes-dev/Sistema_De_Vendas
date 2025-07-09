import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSaleSchema, insertAttendantSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all attendants
  app.get("/api/attendants", async (req, res) => {
    try {
      const attendants = await storage.getAllAttendants();
      res.json(attendants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendants" });
    }
  });

  // Get attendant by ID
  app.get("/api/attendants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const attendant = await storage.getAttendant(id);
      if (!attendant) {
        return res.status(404).json({ message: "Attendant not found" });
      }
      res.json(attendant);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendant" });
    }
  });

  // Create new attendant
  app.post("/api/attendants", async (req, res) => {
    try {
      const validatedData = insertAttendantSchema.parse(req.body);
      const attendant = await storage.createAttendant(validatedData);
      res.status(201).json(attendant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create attendant" });
    }
  });

  // Create new sale
  app.post("/api/sales", async (req, res) => {
    try {
      const validatedData = insertSaleSchema.parse(req.body);
      
      // Check if attendant exists
      const attendant = await storage.getAttendant(validatedData.attendantId);
      if (!attendant) {
        return res.status(404).json({ message: "Attendant not found" });
      }

      const sale = await storage.createSale(validatedData);
      
      // Update goal progress for the attendant
      const activeGoals = await storage.getActiveGoalsByAttendant(validatedData.attendantId);
      const updatedAttendant = await storage.getAttendant(validatedData.attendantId);
      
      if (updatedAttendant) {
        const currentEarnings = parseFloat(updatedAttendant.earnings);
        
        // Check for goal completion and create achievements
        for (const goal of activeGoals) {
          const progress = (currentEarnings / parseFloat(goal.targetValue)) * 100;
          await storage.updateGoalProgress(goal.id, updatedAttendant.earnings);
          
          // Create achievement if goal is completed
          if (progress >= 100 && goal.isActive) {
            await storage.createAchievement({
              attendantId: validatedData.attendantId,
              title: `Meta Alcançada: ${goal.title}`,
              description: `Parabéns! Você atingiu a meta de R$ ${goal.targetValue}`,
              icon: "trophy",
              badgeColor: "#10b981",
              pointsAwarded: 100
            });
            
            // Update leaderboard
            const leaderboardEntry = await storage.getLeaderboardByAttendant(validatedData.attendantId);
            const currentPoints = leaderboardEntry ? leaderboardEntry.totalPoints : 0;
            const currentStreak = leaderboardEntry ? leaderboardEntry.currentStreak + 1 : 1;
            const bestStreak = leaderboardEntry ? Math.max(leaderboardEntry.bestStreak || 0, currentStreak) : 1;
            
            await storage.updateLeaderboard(validatedData.attendantId, currentPoints + 100, currentStreak, bestStreak);
            await storage.updateLeaderboardRanks();
          }
        }
      }
      
      res.status(201).json(sale);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create sale" });
    }
  });

  // Get all sales
  app.get("/api/sales", async (req, res) => {
    try {
      const sales = await storage.getAllSales();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  // Get sales by attendant
  app.get("/api/sales/attendant/:attendantId", async (req, res) => {
    try {
      const attendantId = parseInt(req.params.attendantId);
      const sales = await storage.getSalesByAttendant(attendantId);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  // Delete attendant
  app.delete("/api/attendants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAttendant(id);
      if (!deleted) {
        return res.status(404).json({ message: "Attendant not found" });
      }
      res.json({ message: "Attendant deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete attendant" });
    }
  });

  // Delete sale
  app.delete("/api/sales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSale(id);
      if (!deleted) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json({ message: "Sale deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete sale" });
    }
  });

  // Delete goal
  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteGoal(id);
      if (!deleted) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json({ message: "Goal deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Admin authentication
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      console.log("Login attempt:", { username, password });
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const admin = await storage.getAdminByUsername(username);
      console.log("Found admin:", admin);
      
      if (!admin || admin.password !== password) {
        console.log("Auth failed - admin:", admin, "password match:", admin?.password === password);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ 
        success: true, 
        message: "Login successful",
        admin: { id: admin.id, username: admin.username }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Goals routes
  app.get("/api/goals", async (req, res) => {
    try {
      const goals = await storage.getAllGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.get("/api/goals/attendant/:attendantId", async (req, res) => {
    try {
      const attendantId = parseInt(req.params.attendantId);
      const goals = await storage.getGoalsByAttendant(attendantId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.get("/api/goals/active/:attendantId", async (req, res) => {
    try {
      const attendantId = parseInt(req.params.attendantId);
      const goals = await storage.getActiveGoalsByAttendant(attendantId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const goal = await storage.createGoal(req.body);
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Failed to create goal" });
    }
  });

  app.put("/api/goals/:id/progress", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { currentValue } = req.body;
      const goal = await storage.updateGoalProgress(id, currentValue);
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Failed to update goal progress" });
    }
  });

  app.put("/api/goals/:id/deactivate", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const goal = await storage.deactivateGoal(id);
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Failed to deactivate goal" });
    }
  });

  // Achievements routes
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAllAchievements();
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.get("/api/achievements/attendant/:attendantId", async (req, res) => {
    try {
      const attendantId = parseInt(req.params.attendantId);
      const achievements = await storage.getAchievementsByAttendant(attendantId);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.post("/api/achievements", async (req, res) => {
    try {
      const achievement = await storage.createAchievement(req.body);
      res.json(achievement);
    } catch (error) {
      res.status(500).json({ message: "Failed to create achievement" });
    }
  });

  // Leaderboard routes
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getAllLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.get("/api/leaderboard/attendant/:attendantId", async (req, res) => {
    try {
      const attendantId = parseInt(req.params.attendantId);
      const entry = await storage.getLeaderboardByAttendant(attendantId);
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard entry" });
    }
  });

  app.post("/api/leaderboard/update", async (req, res) => {
    try {
      const { attendantId, totalPoints, currentStreak, bestStreak } = req.body;
      const entry = await storage.updateLeaderboard(attendantId, totalPoints, currentStreak, bestStreak);
      await storage.updateLeaderboardRanks();
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to update leaderboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
