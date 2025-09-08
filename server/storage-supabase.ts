import { supabase } from './supabase.js';
import type { 
  Attendant, 
  InsertAttendant, 
  Sale, 
  InsertSale, 
  Admin, 
  InsertAdmin,
  Goal, 
  InsertGoal, 
  Achievement, 
  InsertAchievement,
  Notification,
  InsertNotification,
} from "@shared/schema-supabase";

export interface IStorage {
  // Attendants
  getAllAttendants(): Promise<Attendant[]>;
  getAttendant(id: string): Promise<Attendant | undefined>;
  createAttendant(attendant: InsertAttendant): Promise<Attendant>;
  updateAttendant(id: string, updates: Partial<Attendant>): Promise<Attendant | undefined>;
  updateAttendantEarnings(id: string, earnings: number): Promise<Attendant | undefined>;
  deleteAttendant(id: string): Promise<boolean>;
  
  // Sales
  getAllSales(): Promise<Sale[]>;
  getSalesByAttendant(attendantId: string): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;
  deleteSale(id: string): Promise<boolean>;
  
  // Admins
  getAllAdmins(): Promise<Admin[]>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  updateAdmin(id: string, updates: Partial<Admin>): Promise<Admin | undefined>;
  deleteAdmin(id: string): Promise<boolean>;
  activateAdmin(id: string): Promise<Admin | undefined>;
  deactivateAdmin(id: string): Promise<Admin | undefined>;
  
  // Goals
  getAllGoals(): Promise<Goal[]>;
  getGoalsByAttendant(attendantId: string): Promise<Goal[]>;
  getActiveGoalsByAttendant(attendantId: string): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | undefined>;
  deleteGoal(id: string): Promise<boolean>;
  
  // Achievements
  getAllAchievements(): Promise<Achievement[]>;
  getAchievementsByAttendant(attendantId: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  deleteAchievement(id: string): Promise<boolean>;
  
  // Notifications
  getAllNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<boolean>;
  deleteNotification(id: string): Promise<boolean>;
  markAllNotificationsAsRead(): Promise<boolean>;
  getUnreadNotifications(): Promise<Notification[]>;
  
  // Goals
  updateGoalProgress(id: string, currentValue: number): Promise<Goal | undefined>;
  
  // Leaderboard
  getAllLeaderboard(): Promise<any[]>;
  getLeaderboardByAttendant(attendantId: string): Promise<any | undefined>;
  updateLeaderboard(attendantId: string, totalPoints: number, currentStreak: number, bestStreak: number): Promise<any>;
  updateLeaderboardRanks(): Promise<void>;
  updateLeaderboardEntry(attendantId: string, updates: any): Promise<any>;
}

// Helper function to convert Supabase data to our schema format
function convertSupabaseAttendant(data: any): Attendant {
  return {
    id: data.id,
    name: data.name,
    imageUrl: data.image_url,
    earnings: parseFloat(data.earnings || '0'),
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

function convertSupabaseSale(data: any): Sale {
  return {
    id: data.id,
    attendantId: data.attendant_id,
    value: parseFloat(data.value || '0'),
    clientName: data.client_name,
    clientPhone: data.client_phone,
    clientEmail: data.client_email,
    createdAt: data.created_at
  };
}

function convertSupabaseAdmin(data: any): Admin {
  return {
    id: data.id,
    username: data.username,
    password: data.password,
    email: data.email,
    role: data.role,
    isActive: data.is_active,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

function convertSupabaseGoal(data: any): Goal {
  return {
    id: data.id,
    attendantId: data.attendant_id,
    title: data.title,
    description: data.description,
    targetValue: parseFloat(data.target_value || '0'),
    currentValue: parseFloat(data.current_value || '0'),
    goalType: data.goal_type,
    startDate: data.start_date,
    endDate: data.end_date,
    isActive: data.is_active,
    createdAt: data.created_at
  };
}

function convertSupabaseAchievement(data: any): Achievement {
  return {
    id: data.id,
    attendantId: data.attendant_id,
    title: data.title,
    description: data.description,
    achievedAt: data.achieved_at,
    createdAt: data.created_at
  };
}

function convertSupabaseNotification(data: any): Notification {
  return {
    id: data.id,
    title: data.title,
    message: data.message,
    type: data.type,
    isRead: data.is_read,
    createdAt: data.created_at
  };
}

export const storage: IStorage = {
  // Attendants
  async getAllAttendants(): Promise<Attendant[]> {
    const { data, error } = await supabase
      .from('attendants')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(convertSupabaseAttendant) || [];
  },

  async getAttendant(id: string): Promise<Attendant | undefined> {
    const { data, error } = await supabase
      .from('attendants')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return undefined;
    return data ? convertSupabaseAttendant(data) : undefined;
  },

  async createAttendant(attendant: InsertAttendant): Promise<Attendant> {
    const { data, error } = await supabase
      .from('attendants')
      .insert({
        name: attendant.name,
        image_url: attendant.imageUrl,
        earnings: attendant.earnings || 0
      })
      .select()
      .single();
    
    if (error) throw error;
    return convertSupabaseAttendant(data);
  },

  async updateAttendant(id: string, updates: Partial<Attendant>): Promise<Attendant | undefined> {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
    if (updates.earnings !== undefined) updateData.earnings = updates.earnings;

    const { data, error } = await supabase
      .from('attendants')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) return undefined;
    return data ? convertSupabaseAttendant(data) : undefined;
  },

  async updateAttendantEarnings(id: string, earnings: number): Promise<Attendant | undefined> {
    const { data, error } = await supabase
      .from('attendants')
      .update({ earnings })
      .eq('id', id)
      .select()
      .single();
    
    if (error) return undefined;
    return data ? convertSupabaseAttendant(data) : undefined;
  },

  async deleteAttendant(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('attendants')
      .delete()
      .eq('id', id);
    
    return !error;
  },

  // Sales
  async getAllSales(): Promise<Sale[]> {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(convertSupabaseSale) || [];
  },

  async getSalesByAttendant(attendantId: string): Promise<Sale[]> {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('attendant_id', attendantId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(convertSupabaseSale) || [];
  },

  async createSale(sale: InsertSale): Promise<Sale> {
    const { data, error } = await supabase
      .from('sales')
      .insert({
        attendant_id: sale.attendantId,
        value: sale.value,
        client_name: sale.clientName,
        client_phone: sale.clientPhone,
        client_email: sale.clientEmail
      })
      .select()
      .single();
    
    if (error) throw error;
    return convertSupabaseSale(data);
  },

  async deleteSale(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id);
    
    return !error;
  },

  // Admins
  async getAllAdmins(): Promise<Admin[]> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(convertSupabaseAdmin) || [];
  },

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) return undefined;
    return data ? convertSupabaseAdmin(data) : undefined;
  },

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const { data, error } = await supabase
      .from('admins')
      .insert({
        username: admin.username,
        password: admin.password,
        email: admin.email,
        role: admin.role,
        is_active: admin.isActive,
        created_by: admin.createdBy
      })
      .select()
      .single();
    
    if (error) throw error;
    return convertSupabaseAdmin(data);
  },

  async updateAdmin(id: string, updates: Partial<Admin>): Promise<Admin | undefined> {
    const updateData: any = {};
    if (updates.username) updateData.username = updates.username;
    if (updates.password) updateData.password = updates.password;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.role) updateData.role = updates.role;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('admins')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) return undefined;
    return data ? convertSupabaseAdmin(data) : undefined;
  },

  async deleteAdmin(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('id', id);
    
    return !error;
  },

  async activateAdmin(id: string): Promise<Admin | undefined> {
    const { data, error } = await supabase
      .from('admins')
      .update({ is_active: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) return undefined;
    return data ? convertSupabaseAdmin(data) : undefined;
  },

  async deactivateAdmin(id: string): Promise<Admin | undefined> {
    const { data, error } = await supabase
      .from('admins')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();
    
    if (error) return undefined;
    return data ? convertSupabaseAdmin(data) : undefined;
  },

  // Goals
  async getAllGoals(): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(convertSupabaseGoal) || [];
  },

  async getGoalsByAttendant(attendantId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('attendant_id', attendantId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(convertSupabaseGoal) || [];
  },

  async getActiveGoalsByAttendant(attendantId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('attendant_id', attendantId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(convertSupabaseGoal) || [];
  },

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .insert({
        attendant_id: goal.attendantId,
        title: goal.title,
        description: goal.description,
        target_value: goal.targetValue,
        current_value: goal.currentValue || 0,
        goal_type: goal.goalType,
        start_date: goal.startDate,
        end_date: goal.endDate,
        is_active: goal.isActive !== false
      })
      .select()
      .single();
    
    if (error) throw error;
    return convertSupabaseGoal(data);
  },

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | undefined> {
    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.targetValue !== undefined) updateData.target_value = updates.targetValue;
    if (updates.currentValue !== undefined) updateData.current_value = updates.currentValue;
    if (updates.goalType) updateData.goal_type = updates.goalType;
    if (updates.startDate) updateData.start_date = updates.startDate;
    if (updates.endDate) updateData.end_date = updates.endDate;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) return undefined;
    return data ? convertSupabaseGoal(data) : undefined;
  },

  async deleteGoal(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);
    
    return !error;
  },

  // Achievements
  async getAllAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(convertSupabaseAchievement) || [];
  },

  async getAchievementsByAttendant(attendantId: string): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('attendant_id', attendantId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(convertSupabaseAchievement) || [];
  },

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const { data, error } = await supabase
      .from('achievements')
      .insert({
        attendant_id: achievement.attendantId,
        title: achievement.title,
        description: achievement.description,
        achieved_at: achievement.achievedAt
      })
      .select()
      .single();
    
    if (error) throw error;
    return convertSupabaseAchievement(data);
  },

  async deleteAchievement(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('achievements')
      .delete()
      .eq('id', id);
    
    return !error;
  },

  // Notifications
  async getAllNotifications(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(convertSupabaseNotification) || [];
  },

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        is_read: notification.isRead || false
      })
      .select()
      .single();
    
    if (error) throw error;
    return convertSupabaseNotification(data);
  },

  async markNotificationAsRead(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    
    return !error;
  },

  async deleteNotification(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    
    return !error;
  },

  async markAllNotificationsAsRead(): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true });
    
    return !error;
  },

  async getUnreadNotifications(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(convertSupabaseNotification) || [];
  },

  async updateGoalProgress(id: string, currentValue: number): Promise<Goal | undefined> {
    const { data, error } = await supabase
      .from('goals')
      .update({ current_value: currentValue })
      .eq('id', id)
      .select()
      .single();
    
    if (error) return undefined;
    return data ? convertSupabaseGoal(data) : undefined;
  },

  async getAllLeaderboard(): Promise<any[]> {
    // Esta função retorna dados do leaderboard baseado nos atendentes e suas vendas
    const attendants = await this.getAllAttendants();
    const sales = await this.getAllSales();
    
    const leaderboard = attendants.map(attendant => {
      const attendantSales = sales.filter(sale => sale.attendantId === attendant.id);
      const totalSales = attendantSales.length;
      const totalValue = attendantSales.reduce((sum, sale) => sum + sale.value, 0);
      
      return {
        id: attendant.id,
        attendantId: attendant.id,
        attendantName: attendant.name,
        totalPoints: totalSales * 10, // 10 pontos por venda
        totalSales,
        totalValue,
        currentStreak: 1, // Implementar lógica de streak se necessário
        bestStreak: 1,
        rank: 0 // Será calculado pelo updateLeaderboardRanks
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);
    
    // Atribuir ranks
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    return leaderboard;
  },

  async getLeaderboardByAttendant(attendantId: string): Promise<any | undefined> {
    const leaderboard = await this.getAllLeaderboard();
    return leaderboard.find(entry => entry.attendantId === attendantId);
  },

  async updateLeaderboard(attendantId: string, totalPoints: number, currentStreak: number, bestStreak: number): Promise<any> {
    // Esta função simula a atualização do leaderboard
    // Em uma implementação real, você teria uma tabela de leaderboard no Supabase
    const entry = await this.getLeaderboardByAttendant(attendantId);
    if (entry) {
      entry.totalPoints += totalPoints;
      entry.currentStreak = currentStreak;
      entry.bestStreak = Math.max(entry.bestStreak, bestStreak);
    }
    return entry;
  },

  async updateLeaderboardRanks(): Promise<void> {
    // Esta função recalcula os ranks do leaderboard
    // Em uma implementação real, você atualizaria os ranks no banco
    const leaderboard = await this.getAllLeaderboard();
    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });
  },

  async updateLeaderboardEntry(attendantId: string, updates: any): Promise<any> {
    // Esta função simula a atualização de uma entrada do leaderboard
    const entry = await this.getLeaderboardByAttendant(attendantId);
    if (entry) {
      Object.assign(entry, updates);
    }
    return entry;
  }
};
