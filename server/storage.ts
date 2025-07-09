import { attendants, sales, type Attendant, type InsertAttendant, type Sale, type InsertSale } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
