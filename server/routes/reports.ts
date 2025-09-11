import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { generateSalesReport, exportToCSV } from "../utils/reports";
import { z } from "zod";
import { startOfMonth, endOfMonth, parseISO } from "date-fns";

export function registerReportRoutes(app: Express) {
  // Get sales report
  app.get("/api/reports/sales", async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      
      // Default to current month if no dates provided
      const start = startDate 
        ? parseISO(startDate as string) 
        : startOfMonth(new Date());
      const end = endDate 
        ? parseISO(endDate as string) 
        : endOfMonth(new Date());
      
      const [sales, attendants] = await Promise.all([
        storage.getAllSales(),
        storage.getAllAttendants()
      ]);
      
      const report = generateSalesReport(sales, attendants, start, end);
      
      res.json(report);
    } catch (error) {
      console.error("Report generation error:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });
  
  // Export sales data as CSV
  app.get("/api/reports/export/sales", async (_req: Request, res: Response) => {
    try {
      const sales = await storage.getAllSales();
      const attendants = await storage.getAllAttendants();
      
      const data = sales.map(sale => {
        const attendant = attendants.find(a => a.id === sale.attendantId);
        return {
          date: sale.createdAt,
          attendant: attendant?.name || "Unknown",
          value: sale.value,
          clientName: sale.clientName || "",
          clientPhone: sale.clientPhone || "",
          clientEmail: sale.clientEmail || ""
        };
      });
      
      const csv = exportToCSV(data, "sales");
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="sales_export.csv"');
      res.send(csv);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });
  
  // Export attendants data as CSV
  app.get("/api/reports/export/attendants", async (_req: Request, res: Response) => {
    try {
      const attendants = await storage.getAllAttendants();
      const sales = await storage.getAllSales();
      
      const data = attendants.map(attendant => {
        const attendantSales = sales.filter(s => s.attendantId === attendant.id);
        const totalSales = attendantSales.length;
        const averageTicket = totalSales > 0 
          ? parseFloat(attendant.earnings) / totalSales 
          : 0;
        
        return {
          name: attendant.name,
          totalEarnings: attendant.earnings,
          totalSales,
          averageTicket: averageTicket.toFixed(2),
          lastSale: attendantSales[attendantSales.length - 1]?.createdAt || "N/A"
        };
      });
      
      const csv = exportToCSV(data, "attendants");
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="attendants_export.csv"');
      res.send(csv);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });
  
  // Get performance metrics
  app.get("/api/reports/metrics", async (_req: Request, res: Response) => {
    try {
      const [sales, attendants, goals, achievements] = await Promise.all([
        storage.getAllSales(),
        storage.getAllAttendants(),
        storage.getAllGoals(),
        storage.getAllAchievements()
      ]);
      
      const today = new Date();
      const todaySales = sales.filter(s => {
        const saleDate = new Date(s.createdAt);
        return saleDate.toDateString() === today.toDateString();
      });
      
      const thisMonthSales = sales.filter(s => {
        const saleDate = new Date(s.createdAt);
        return saleDate.getMonth() === today.getMonth() && 
               saleDate.getFullYear() === today.getFullYear();
      });
      
      const metrics = {
        today: {
          sales: todaySales.length,
          revenue: todaySales.reduce((sum, s) => sum + parseFloat(s.value), 0)
        },
        thisMonth: {
          sales: thisMonthSales.length,
          revenue: thisMonthSales.reduce((sum, s) => sum + parseFloat(s.value), 0)
        },
        attendants: {
          total: attendants.length,
          active: attendants.length // All attendants are considered active for now
        },
        goals: {
          total: goals.length,
          active: goals.filter(g => g.isActive === 1).length,
          completed: goals.filter(g => parseFloat(g.currentValue) >= parseFloat(g.targetValue)).length
        },
        achievements: {
          total: achievements.length,
          thisMonth: achievements.filter(a => {
            const achievedDate = new Date(a.achievedAt);
            return achievedDate.getMonth() === today.getMonth() && 
                   achievedDate.getFullYear() === today.getFullYear();
          }).length
        }
      };
      
      res.json(metrics);
    } catch (error) {
      console.error("Metrics error:", error);
      res.status(500).json({ message: "Failed to get metrics" });
    }
  });
}