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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAttendantSchema = createInsertSchema(attendants).omit({
  id: true,
  earnings: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
});

export type InsertAttendant = z.infer<typeof insertAttendantSchema>;
export type Attendant = typeof attendants.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof sales.$inferSelect;
