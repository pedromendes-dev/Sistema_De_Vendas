import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSaleSchema } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}
