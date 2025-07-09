import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertSaleSchema, insertAttendantSchema, insertNotificationSchema } from "@shared/schema";
import { z } from "zod";

// WebSocket clients storage
const wsClients = new Set<WebSocket>();

// Broadcast notification to all connected clients
export function broadcastNotification(notification: any) {
  const message = JSON.stringify({
    type: 'notification',
    data: notification
  });
  
  wsClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Send team performance updates
export function broadcastPerformanceUpdate(data: any) {
  const message = JSON.stringify({
    type: 'performance_update',
    data
  });
  
  wsClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

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

  // Update attendant
  app.put("/api/attendants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, imageUrl } = req.body;
      
      const attendant = await storage.getAttendant(id);
      if (!attendant) {
        return res.status(404).json({ message: "Attendant not found" });
      }
      
      const updatedAttendant = await storage.updateAttendant(id, { name, imageUrl });
      if (!updatedAttendant) {
        return res.status(500).json({ message: "Failed to update attendant" });
      }
      
      res.json(updatedAttendant);
    } catch (error) {
      res.status(500).json({ message: "Failed to update attendant" });
    }
  });

  // Delete attendant
  app.delete("/api/attendants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAttendant(id);
      if (!success) {
        return res.status(404).json({ message: "Attendant not found" });
      }
      res.json({ message: "Attendant deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete attendant" });
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
        
        // Create sale notification
        const saleNotification = await storage.createNotification({
          type: "sale",
          title: "💰 Nova Venda!",
          message: `${updatedAttendant.name} registrou uma venda de R$ ${validatedData.value}`,
          attendantId: validatedData.attendantId,
          metadata: JSON.stringify({ saleValue: validatedData.value, totalEarnings: currentEarnings }),
          priority: "normal"
        });
        
        broadcastNotification(saleNotification);
        
        // Check for goal completion and create achievements
        for (const goal of activeGoals) {
          const progress = (currentEarnings / parseFloat(goal.targetValue)) * 100;
          await storage.updateGoalProgress(goal.id, updatedAttendant.earnings);
          
          // Create achievement if goal is completed
          if (progress >= 100 && goal.isActive) {
            const achievement = await storage.createAchievement({
              attendantId: validatedData.attendantId,
              title: `Meta Alcançada: ${goal.title}`,
              description: `Parabéns! Você atingiu a meta de R$ ${goal.targetValue}`,
              icon: "trophy",
              badgeColor: "#10b981",
              pointsAwarded: 100
            });
            
            // Create achievement notification
            const achievementNotification = await storage.createNotification({
              type: "achievement",
              title: "🏆 Nova Conquista!",
              message: `${updatedAttendant.name} conquistou: ${achievement.title}`,
              attendantId: validatedData.attendantId,
              metadata: JSON.stringify({ achievementId: achievement.id, pointsAwarded: 100 }),
              priority: "high"
            });
            
            broadcastNotification(achievementNotification);
            
            // Update leaderboard
            const leaderboardEntry = await storage.getLeaderboardByAttendant(validatedData.attendantId);
            const currentPoints = leaderboardEntry ? leaderboardEntry.totalPoints : 0;
            const currentStreak = leaderboardEntry ? leaderboardEntry.currentStreak + 1 : 1;
            const bestStreak = leaderboardEntry ? Math.max(leaderboardEntry.bestStreak || 0, currentStreak) : 1;
            
            await storage.updateLeaderboard(validatedData.attendantId, currentPoints + 100, currentStreak, bestStreak);
            await storage.updateLeaderboardRanks();
            
            broadcastPerformanceUpdate({
              type: "leaderboard_update",
              attendantId: validatedData.attendantId,
              attendantName: updatedAttendant.name,
              newPoints: currentPoints + 100
            });
          }
        }
        
        // Team milestone notifications
        const allSales = await storage.getAllSales();
        if (allSales.length % 25 === 0) {
          const milestoneNotification = await storage.createNotification({
            type: "team_milestone",
            title: "🎉 Marco da Equipe!",
            message: `A equipe alcançou ${allSales.length} vendas registradas!`,
            metadata: JSON.stringify({ milestone: allSales.length }),
            priority: "high"
          });
          
          broadcastNotification(milestoneNotification);
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

  // Delete sale
  app.delete("/api/sales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSale(id);
      if (!success) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json({ message: "Sale deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete sale" });
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
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const admin = await storage.getAdminByUsername(username);
      
      if (!admin || admin.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (admin.isActive === 0) {
        return res.status(401).json({ message: "Account is inactive" });
      }
      
      res.json({ 
        success: true, 
        message: "Login successful",
        admin: { 
          id: admin.id, 
          username: admin.username, 
          role: admin.role,
          email: admin.email 
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Get all admins
  app.get("/api/admin/users", async (req, res) => {
    try {
      const admins = await storage.getAllAdmins();
      const safeAdmins = admins.map(admin => ({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        createdBy: admin.createdBy,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      }));
      res.json(safeAdmins);
    } catch (error) {
      console.error("Get admins error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create new admin
  app.post("/api/admin/users", async (req, res) => {
    try {
      const { username, password, email, role = "admin", createdBy } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Check if username already exists
      const existingAdmin = await storage.getAdminByUsername(username);
      if (existingAdmin) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const newAdmin = await storage.createAdmin({
        username,
        password,
        email,
        role,
        createdBy
      });

      const safeAdmin = {
        id: newAdmin.id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
        isActive: newAdmin.isActive,
        createdBy: newAdmin.createdBy,
        createdAt: newAdmin.createdAt,
        updatedAt: newAdmin.updatedAt
      };

      // Create notification for new admin creation
      await storage.createNotification({
        type: "admin",
        title: "Novo Administrador",
        message: `Administrador "${username}" foi criado com sucesso`,
        priority: "normal"
      });

      res.status(201).json(safeAdmin);
    } catch (error) {
      console.error("Create admin error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update admin
  app.put("/api/admin/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { username, email, role, isActive } = req.body;
      
      const updates: any = {};
      if (username !== undefined) updates.username = username;
      if (email !== undefined) updates.email = email;
      if (role !== undefined) updates.role = role;
      if (isActive !== undefined) updates.isActive = isActive;

      const updatedAdmin = await storage.updateAdmin(parseInt(id), updates);
      if (!updatedAdmin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      const safeAdmin = {
        id: updatedAdmin.id,
        username: updatedAdmin.username,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        isActive: updatedAdmin.isActive,
        createdBy: updatedAdmin.createdBy,
        createdAt: updatedAdmin.createdAt,
        updatedAt: updatedAdmin.updatedAt
      };

      res.json(safeAdmin);
    } catch (error) {
      console.error("Update admin error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete admin
  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteAdmin(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ message: "Admin not found" });
      }

      res.json({ message: "Admin deleted successfully" });
    } catch (error) {
      console.error("Delete admin error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Activate admin
  app.put("/api/admin/users/:id/activate", async (req, res) => {
    try {
      const { id } = req.params;
      const admin = await storage.activateAdmin(parseInt(id));
      
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      res.json({ message: "Admin activated successfully" });
    } catch (error) {
      console.error("Activate admin error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Deactivate admin
  app.put("/api/admin/users/:id/deactivate", async (req, res) => {
    try {
      const { id } = req.params;
      const admin = await storage.deactivateAdmin(parseInt(id));
      
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      res.json({ message: "Admin deactivated successfully" });
    } catch (error) {
      console.error("Deactivate admin error:", error);
      res.status(500).json({ message: "Internal server error" });
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

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteGoal(id);
      if (!success) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json({ message: "Goal deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete goal" });
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

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    try {
      const notifications = await storage.getAllNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread", async (req, res) => {
    try {
      const notifications = await storage.getUnreadNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread notifications" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const validatedData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(validatedData);
      
      // Broadcast to WebSocket clients
      broadcastNotification(notification);
      
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.markNotificationAsRead(id);
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch("/api/notifications/read-all", async (req, res) => {
    try {
      const success = await storage.markAllNotificationsAsRead();
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.delete("/api/notifications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteNotification(id);
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json({ message: "Notification deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established');
    wsClients.add(ws);
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to real-time notifications'
    }));
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
      wsClients.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      wsClients.delete(ws);
    });
  });
  
  return httpServer;
}
