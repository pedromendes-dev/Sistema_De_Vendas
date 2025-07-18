import { pgTable, text, serial, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tabela de configuração de comissões
export const commissionRules = pgTable("commission_rules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'percentage', 'fixed', 'tiered'
  baseValue: decimal("base_value", { precision: 10, scale: 2 }).notNull(),
  minTarget: decimal("min_target", { precision: 10, scale: 2 }),
  maxTarget: decimal("max_target", { precision: 10, scale: 2 }),
  bonusPercentage: decimal("bonus_percentage", { precision: 5, scale: 2 }),
  isActive: integer("is_active").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabela de comissões calculadas
export const commissions = pgTable("commissions", {
  id: serial("id").primaryKey(),
  attendantId: integer("attendant_id").notNull(),
  saleId: integer("sale_id").notNull(),
  ruleId: integer("rule_id").notNull(),
  saleValue: decimal("sale_value", { precision: 10, scale: 2 }).notNull(),
  commissionValue: decimal("commission_value", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending").notNull(), // 'pending', 'approved', 'paid'
  approvedBy: integer("approved_by"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabela de períodos de pagamento
export const paymentPeriods = pgTable("payment_periods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalCommissions: decimal("total_commissions", { precision: 10, scale: 2 }).default("0.00").notNull(),
  status: text("status").default("open").notNull(), // 'open', 'closed', 'paid'
  closedBy: integer("closed_by"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommissionRuleSchema = createInsertSchema(commissionRules).omit({
  id: true,
  createdAt: true,
});

export const insertCommissionSchema = createInsertSchema(commissions).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentPeriodSchema = createInsertSchema(paymentPeriods).omit({
  id: true,
  createdAt: true,
});

export type CommissionRule = typeof commissionRules.$inferSelect;
export type InsertCommissionRule = z.infer<typeof insertCommissionRuleSchema>;
export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = z.infer<typeof insertCommissionSchema>;
export type PaymentPeriod = typeof paymentPeriods.$inferSelect;
export type InsertPaymentPeriod = z.infer<typeof insertPaymentPeriodSchema>;