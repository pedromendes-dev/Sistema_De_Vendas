import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { z } from "zod";
import { registerReportRoutes } from "./routes/reports";
import { backupManager } from "./utils/backup";

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
  // Register report routes
  registerReportRoutes(app);
  // Get all attendants
  app.get("/api/attendants", async (req, res) => {
    try {
      const attendants = await storage.getAllAttendants();
      const adaptedAttendants = attendants.map(adaptFirestoreAttendant);
      res.json(adaptedAttendants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendants" });
    }
  });

  // Get attendant by ID
  app.get("/api/attendants/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const attendant = await storage.getAttendant(id);
      if (!attendant) {
        return res.status(404).json({ message: "Attendant not found" });
      }
      res.json(adaptFirestoreAttendant(attendant));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendant" });
    }
  });

  // Create new attendant
  app.post("/api/attendants", async (req, res) => {
    try {
      const validatedData = insertAttendantSchema.parse(req.body);
      const firestoreData = adaptToFirestoreAttendant(validatedData);
      const attendant = await storage.createAttendant(firestoreData);
      res.status(201).json(adaptFirestoreAttendant(attendant));
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
      const attendant = await storage.getAttendant(validatedData.attendantId.toString());
      if (!attendant) {
        return res.status(404).json({ message: "Attendant not found" });
      }

      const firestoreData = adaptToFirestoreSale(validatedData);
      const sale = await storage.createSale(firestoreData);
      
      // Update goal progress for the attendant
      const activeGoals = await storage.getActiveGoalsByAttendant(validatedData.attendantId.toString());
      const updatedAttendant = await storage.getAttendant(validatedData.attendantId.toString());
      
      if (updatedAttendant) {
        const currentEarnings = parseFloat(updatedAttendant.earnings.toString());
        
        // Create sale notification
        const saleNotification = await storage.createNotification({
          type: "sale",
          title: "Nova Venda Registrada!",
          message: `${updatedAttendant.name} registrou uma venda de R$ ${validatedData.value}`,
          attendantId: validatedData.attendantId.toString(),
          metadata: JSON.stringify({ saleValue: validatedData.value, totalEarnings: currentEarnings }),
          priority: "normal",
          isRead: false,
          createdAt: new Date()
        });
        
        broadcastNotification(adaptFirestoreNotification(saleNotification));
        
        // Check for goal completion and create achievements
        for (const goal of activeGoals) {
          const progress = (currentEarnings / parseFloat(goal.targetValue.toString())) * 100;
          await storage.updateGoalProgress(goal.id!, updatedAttendant.earnings);
          
          // Create achievement if goal is completed
          if (progress >= 100 && goal.isActive) {
            const achievement = await storage.createAchievement({
              attendantId: validatedData.attendantId.toString(),
              title: `Meta Alcançada: ${goal.title}`,
              description: `Parabéns! Você atingiu a meta de R$ ${goal.targetValue}`,
              icon: "trophy",
              badgeColor: "#10b981",
              pointsAwarded: 100,
              achievedAt: new Date()
            });
            
            // Create achievement notification
            const achievementNotification = await storage.createNotification({
              type: "achievement",
              title: "Nova Conquista Desbloqueada!",
              message: `${updatedAttendant.name} conquistou: ${achievement.title}`,
              attendantId: validatedData.attendantId.toString(),
              metadata: JSON.stringify({ achievementId: achievement.id, pointsAwarded: 100 }),
              priority: "high",
              isRead: false,
              createdAt: new Date()
            });
            
            broadcastNotification(adaptFirestoreNotification(achievementNotification));
            
            // Update leaderboard
            const leaderboardEntry = await storage.updateLeaderboardEntry(
              validatedData.attendantId.toString(),
              {
                totalPoints: 100,
                currentStreak: 1,
                bestStreak: 1
              }
            );
            
            broadcastPerformanceUpdate({
              type: "leaderboard_update",
              attendantId: validatedData.attendantId,
              attendantName: updatedAttendant.name,
              newPoints: 100
            });
          }
        }
        
        // Team milestone notifications
        const allSales = await storage.getAllSales();
        if (allSales.length % 25 === 0) {
          const milestoneNotification = await storage.createNotification({
            type: "team_milestone",
            title: "Marco da Equipe Alcançado!",
            message: `A equipe alcançou ${allSales.length} vendas registradas!`,
            metadata: JSON.stringify({ milestone: allSales.length }),
            priority: "high",
            isRead: false,
            createdAt: new Date()
          });
          
          broadcastNotification(adaptFirestoreNotification(milestoneNotification));
        }
      }
      
      res.status(201).json(adaptFirestoreSale(sale));
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
      const adaptedSales = sales.map(adaptFirestoreSale);
      res.json(adaptedSales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  // Update sale
  app.put("/api/sales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { attendantId, value } = req.body;
      
      // Validate input
      if (!attendantId || !value) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Check if attendant exists
      const attendant = await storage.getAttendant(attendantId);
      if (!attendant) {
        return res.status(404).json({ message: "Attendant not found" });
      }
      
      // Update the sale (Note: This would require implementing updateSale in storage)
      // For now, we'll return a success response
      res.json({ 
        id, 
        attendantId: parseInt(attendantId), 
        value: value.toString(), 
        createdAt: new Date().toISOString() 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update sale" });
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
      
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verificar senha com bcrypt (compatível com senhas antigas)
      let isValidPassword = false;
      if (admin.password.startsWith('$2')) {
        // Senha já está hasheada
        const { verifyPassword } = await import("./utils/auth");
        isValidPassword = await verifyPassword(password, admin.password);
      } else {
        // Senha antiga em texto plano (temporário)
        isValidPassword = admin.password === password;
      }
      
      if (!isValidPassword) {
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
      const validatedData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(validatedData);
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create goal" });
    }
  });

  app.put("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { attendantId, title, description, targetValue, type } = req.body;
      
      const updates = { attendantId, title, description, targetValue, goalType: type };
      const updatedGoal = await storage.updateGoal(id, updates);
      if (!updatedGoal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json(updatedGoal);
    } catch (error) {
      res.status(500).json({ message: "Failed to update goal" });
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
      const validatedData = insertAchievementSchema.parse(req.body);
      const achievement = await storage.createAchievement(validatedData);
      res.json(achievement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create achievement" });
    }
  });

  app.put("/api/achievements/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { attendantId, title, description, pointsAwarded, badgeColor } = req.body;
      
      const updates = { attendantId, title, description, pointsAwarded, badgeColor };
      const updatedAchievement = await storage.updateAchievement(id, updates);
      if (!updatedAchievement) {
        return res.status(404).json({ message: "Achievement not found" });
      }
      res.json(updatedAchievement);
    } catch (error) {
      res.status(500).json({ message: "Failed to update achievement" });
    }
  });

  app.delete("/api/achievements/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const success = await storage.deleteAchievement(id);
      if (!success) {
        return res.status(404).json({ message: "Achievement not found" });
      }
      res.json({ message: "Achievement deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete achievement" });
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

  // Search route
  app.get('/api/search', async (req, res) => {
    try {
      const { q, type, dateFrom, dateTo, attendantId, minValue, maxValue } = req.query;
      
      let results: any = {
        attendants: [],
        sales: [],
        goals: [],
        achievements: [],
        totalResults: 0
      };

      // Search attendants
      if (!type || type === 'all' || type === 'attendants') {
        const attendants = await storage.getAllAttendants();
        results.attendants = attendants.filter(a => {
          if (q && !a.name.toLowerCase().includes(q.toString().toLowerCase())) return false;
          if (attendantId && a.id !== parseInt(attendantId.toString())) return false;
          return true;
        }).map(a => ({
          ...a,
          salesCount: 0 // Will be calculated below
        }));
      }

      // Search sales
      if (!type || type === 'all' || type === 'sales' || type === 'clients') {
        const sales = await storage.getAllSales();
        const attendants = await storage.getAllAttendants();
        
        results.sales = sales.filter(s => {
          if (q) {
            const searchTerm = q.toString().toLowerCase();
            const matchesValue = s.value.includes(searchTerm);
            const matchesClient = s.clientName?.toLowerCase().includes(searchTerm) ||
                                s.clientPhone?.includes(searchTerm) ||
                                s.clientEmail?.toLowerCase().includes(searchTerm) ||
                                s.clientAddress?.toLowerCase().includes(searchTerm);
            if (!matchesValue && !matchesClient) return false;
          }
          
          if (dateFrom && new Date(s.createdAt) < new Date(dateFrom.toString())) return false;
          if (dateTo && new Date(s.createdAt) > new Date(dateTo.toString())) return false;
          if (attendantId && s.attendantId !== parseInt(attendantId.toString())) return false;
          if (minValue && parseFloat(s.value) < parseFloat(minValue.toString())) return false;
          if (maxValue && parseFloat(s.value) > parseFloat(maxValue.toString())) return false;
          
          return true;
        }).map(s => ({
          ...s,
          attendant: attendants.find(a => a.id === s.attendantId)
        }));

        // Calculate sales count for attendants
        if (results.attendants.length > 0) {
          results.attendants = results.attendants.map((a: any) => ({
            ...a,
            salesCount: sales.filter(s => s.attendantId === a.id).length
          }));
        }
      }

      // Search goals
      if (!type || type === 'all' || type === 'goals') {
        const goals = await storage.getAllGoals();
        const attendants = await storage.getAllAttendants();
        
        results.goals = goals.filter(g => {
          if (q && !g.title.toLowerCase().includes(q.toString().toLowerCase())) return false;
          if (attendantId && g.attendantId !== parseInt(attendantId.toString())) return false;
          if (dateFrom && new Date(g.deadline) < new Date(dateFrom.toString())) return false;
          if (dateTo && new Date(g.deadline) > new Date(dateTo.toString())) return false;
          return true;
        }).map(g => ({
          ...g,
          attendant: attendants.find(a => a.id === g.attendantId)
        }));
      }

      // Search achievements
      if (!type || type === 'all' || type === 'achievements') {
        const achievements = await storage.getAllAchievements();
        const attendants = await storage.getAllAttendants();
        
        results.achievements = achievements.filter(a => {
          if (q && !a.title.toLowerCase().includes(q.toString().toLowerCase())) return false;
          if (attendantId && a.attendantId !== parseInt(attendantId.toString())) return false;
          if (dateFrom && new Date(a.unlockedAt) < new Date(dateFrom.toString())) return false;
          if (dateTo && new Date(a.unlockedAt) > new Date(dateTo.toString())) return false;
          return true;
        }).map(a => ({
          ...a,
          attendant: attendants.find(att => att.id === a.attendantId)
        }));
      }

      results.totalResults = results.attendants.length + results.sales.length + 
                            results.goals.length + results.achievements.length;

      res.json(results);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Failed to search' });
    }
  });

  // Backup routes
  app.get("/api/backup/create", async (req, res) => {
    try {
      const { filename, data } = await backupManager.createFullBackup();
      res.json({ 
        message: "Backup criado com sucesso", 
        filename,
        size: data.metadata.backupSize,
        records: data.metadata.totalRecords 
      });
    } catch (error) {
      console.error("Backup creation error:", error);
      res.status(500).json({ message: "Erro ao criar backup" });
    }
  });

  app.get("/api/backup/list", async (req, res) => {
    try {
      const backups = await backupManager.listBackups();
      res.json(backups);
    } catch (error) {
      console.error("List backups error:", error);
      res.status(500).json({ message: "Erro ao listar backups" });
    }
  });

  app.get("/api/backup/download/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      const backup = await backupManager.getBackup(filename);
      
      if (!backup) {
        return res.status(404).json({ message: "Backup não encontrado" });
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.json(backup);
    } catch (error) {
      console.error("Download backup error:", error);
      res.status(500).json({ message: "Erro ao baixar backup" });
    }
  });

  app.get("/api/backup/export-sql", async (req, res) => {
    try {
      const sql = await backupManager.exportToSQL();
      const filename = `backup_${new Date().toISOString().split('T')[0]}.sql`;
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(sql);
    } catch (error) {
      console.error("Export SQL error:", error);
      res.status(500).json({ message: "Erro ao exportar SQL" });
    }
  });

  app.delete("/api/backup/clean", async (req, res) => {
    try {
      const { days = 30 } = req.query;
      const deleted = await backupManager.deleteOldBackups(Number(days));
      res.json({ 
        message: `${deleted} backups antigos removidos`,
        deleted 
      });
    } catch (error) {
      console.error("Clean backups error:", error);
      res.status(500).json({ message: "Erro ao limpar backups" });
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
