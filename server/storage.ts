import { attendants, sales, type Attendant, type InsertAttendant, type Sale, type InsertSale } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private attendants: Map<number, Attendant>;
  private sales: Map<number, Sale>;
  private attendantIdCounter: number;
  private saleIdCounter: number;

  constructor() {
    this.attendants = new Map();
    this.sales = new Map();
    this.attendantIdCounter = 1;
    this.saleIdCounter = 1;
    
    // Initialize with default attendants
    this.initializeAttendants();
  }

  private initializeAttendants() {
    const defaultAttendants: Attendant[] = [
      {
        id: 1,
        name: "Ana Silva",
        imageUrl: "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
        earnings: "9.90"
      },
      {
        id: 2,
        name: "Carlos Santos",
        imageUrl: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
        earnings: "12.90"
      },
      {
        id: 3,
        name: "Maria Oliveira",
        imageUrl: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
        earnings: "0.00"
      }
    ];

    defaultAttendants.forEach(attendant => {
      this.attendants.set(attendant.id, attendant);
    });
    
    this.attendantIdCounter = 4;
  }

  async getAllAttendants(): Promise<Attendant[]> {
    return Array.from(this.attendants.values());
  }

  async getAttendant(id: number): Promise<Attendant | undefined> {
    return this.attendants.get(id);
  }

  async createAttendant(insertAttendant: InsertAttendant): Promise<Attendant> {
    const id = this.attendantIdCounter++;
    const attendant: Attendant = {
      ...insertAttendant,
      id,
      earnings: "0.00"
    };
    this.attendants.set(id, attendant);
    return attendant;
  }

  async updateAttendantEarnings(id: number, earnings: string): Promise<Attendant | undefined> {
    const attendant = this.attendants.get(id);
    if (!attendant) return undefined;
    
    const updatedAttendant = { ...attendant, earnings };
    this.attendants.set(id, updatedAttendant);
    return updatedAttendant;
  }

  async getAllSales(): Promise<Sale[]> {
    return Array.from(this.sales.values());
  }

  async getSalesByAttendant(attendantId: number): Promise<Sale[]> {
    return Array.from(this.sales.values()).filter(sale => sale.attendantId === attendantId);
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const id = this.saleIdCounter++;
    const sale: Sale = {
      ...insertSale,
      id,
      createdAt: new Date()
    };
    this.sales.set(id, sale);
    
    // Update attendant earnings
    const attendant = this.attendants.get(insertSale.attendantId);
    if (attendant) {
      const currentEarnings = parseFloat(attendant.earnings);
      const saleValue = parseFloat(insertSale.value);
      const newEarnings = (currentEarnings + saleValue).toFixed(2);
      await this.updateAttendantEarnings(insertSale.attendantId, newEarnings);
    }
    
    return sale;
  }
}

export const storage = new MemStorage();
