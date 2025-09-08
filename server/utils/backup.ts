import { 
  attendants, 
  sales, 
  goals, 
  achievements, 
  notifications,
  leaderboard,
  admins,
  type Attendant,
  type Sale,
  type Goal,
  type Achievement,
  type Notification,
  type Leaderboard,
  type Admin
} from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface BackupData {
  version: string;
  timestamp: string;
  database: {
    attendants: any[];
    sales: any[];
    goals: any[];
    achievements: any[];
    notifications: any[];
    leaderboard: any[];
    admins: any[];
  };
  metadata: {
    totalRecords: number;
    backupSize: string;
    environment: string;
  };
}

export class BackupManager {
  private backupDir: string;

  constructor() {
    // Create backups directory in project root
    this.backupDir = path.join(__dirname, '../../backups');
  }

  async ensureBackupDirectory() {
    try {
      await fs.access(this.backupDir);
    } catch {
      await fs.mkdir(this.backupDir, { recursive: true });
    }
  }

  async createFullBackup(): Promise<{ filename: string; data: BackupData }> {
    await this.ensureBackupDirectory();

    // Fetch all data from database
    const { db } = await import('../db');
    const [
      attendantsData,
      salesData,
      goalsData,
      achievementsData,
      notificationsData,
      leaderboardData,
      adminsData
    ] = await Promise.all([
      db.select().from(attendants),
      db.select().from(sales),
      db.select().from(goals),
      db.select().from(achievements),
      db.select().from(notifications),
      db.select().from(leaderboard),
      db.select().from(admins)
    ]);

    // Prepare backup data
    const backupData: BackupData = {
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      database: {
        attendants: attendantsData,
        sales: salesData,
        goals: goalsData,
        achievements: achievementsData,
        notifications: notificationsData,
        leaderboard: leaderboardData,
        admins: adminsData.map((admin: Admin) => ({
          ...admin,
          password: "[ENCRYPTED]" // Don't expose passwords in backups
        }))
      },
      metadata: {
        totalRecords: 
          attendantsData.length + 
          salesData.length + 
          goalsData.length + 
          achievementsData.length + 
          notificationsData.length + 
          leaderboardData.length + 
          adminsData.length,
        backupSize: "0KB", // Will be calculated after save
        environment: process.env.NODE_ENV || "development"
      }
    };

    // Generate filename
    const filename = `backup_${format(new Date(), "yyyy-MM-dd_HH-mm-ss", { locale: ptBR })}.json`;
    const filepath = path.join(this.backupDir, filename);

    // Save backup to file
    const jsonData = JSON.stringify(backupData, null, 2);
    await fs.writeFile(filepath, jsonData, 'utf-8');

    // Update backup size
    const stats = await fs.stat(filepath);
    backupData.metadata.backupSize = this.formatBytes(stats.size);

    // Update the file with correct size
    await fs.writeFile(filepath, JSON.stringify(backupData, null, 2), 'utf-8');

    // Also create a latest backup for easy access
    const latestPath = path.join(this.backupDir, 'latest_backup.json');
    await fs.writeFile(latestPath, JSON.stringify(backupData, null, 2), 'utf-8');

    return { filename, data: backupData };
  }

  async listBackups(): Promise<Array<{ filename: string; size: string; date: Date }>> {
    await this.ensureBackupDirectory();
    
    const files = await fs.readdir(this.backupDir);
    const backupFiles = files.filter(f => f.startsWith('backup_') && f.endsWith('.json'));
    
    const backupInfo = await Promise.all(
      backupFiles.map(async (filename) => {
        const filepath = path.join(this.backupDir, filename);
        const stats = await fs.stat(filepath);
        return {
          filename,
          size: this.formatBytes(stats.size),
          date: stats.mtime
        };
      })
    );

    return backupInfo.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getBackup(filename: string): Promise<BackupData | null> {
    try {
      const filepath = path.join(this.backupDir, filename);
      const data = await fs.readFile(filepath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading backup:', error);
      return null;
    }
  }

  async deleteOldBackups(daysToKeep: number = 30): Promise<number> {
    await this.ensureBackupDirectory();
    
    const files = await fs.readdir(this.backupDir);
    const backupFiles = files.filter(f => f.startsWith('backup_') && f.endsWith('.json'));
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    let deletedCount = 0;
    
    for (const filename of backupFiles) {
      const filepath = path.join(this.backupDir, filename);
      const stats = await fs.stat(filepath);
      
      if (stats.mtime < cutoffDate) {
        await fs.unlink(filepath);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  async exportToSQL(): Promise<string> {
    // Fetch all data
    const { db } = await import('../db');
    const [
      attendantsData,
      salesData,
      goalsData,
      achievementsData,
      notificationsData,
      leaderboardData
    ] = await Promise.all([
      db.select().from(attendants),
      db.select().from(sales),
      db.select().from(goals),
      db.select().from(achievements),
      db.select().from(notifications),
      db.select().from(leaderboard)
    ]);

    let sql = `-- Backup SQL Export
-- Generated at: ${new Date().toISOString()}
-- Total Records: ${attendantsData.length + salesData.length + goalsData.length + achievementsData.length + notificationsData.length + leaderboardData.length}

-- Clear existing data
DELETE FROM sales;
DELETE FROM goals;
DELETE FROM achievements;
DELETE FROM notifications;
DELETE FROM leaderboard;
DELETE FROM attendants;

-- Insert Attendants
`;

    // Generate INSERT statements for attendants
    attendantsData.forEach((attendant: Attendant) => {
      sql += `INSERT INTO attendants (id, name, "imageUrl", earnings) VALUES (${attendant.id}, '${attendant.name.replace(/'/g, "''")}', '${attendant.imageUrl.replace(/'/g, "''")}', '${attendant.earnings}');\n`;
    });

    sql += '\n-- Insert Sales\n';
    salesData.forEach((sale: Sale) => {
      const clientName = sale.clientName ? `'${sale.clientName.replace(/'/g, "''")}'` : 'NULL';
      const clientPhone = sale.clientPhone ? `'${sale.clientPhone.replace(/'/g, "''")}'` : 'NULL';
      const clientEmail = sale.clientEmail ? `'${sale.clientEmail.replace(/'/g, "''")}'` : 'NULL';
      sql += `INSERT INTO sales (id, "attendantId", value, "createdAt", "clientName", "clientPhone", "clientEmail") VALUES (${sale.id}, ${sale.attendantId}, '${sale.value}', '${sale.createdAt}', ${clientName}, ${clientPhone}, ${clientEmail});\n`;
    });

    sql += '\n-- Insert Goals\n';
    goalsData.forEach((goal: Goal) => {
      const description = goal.description ? `'${goal.description.replace(/'/g, "''")}'` : 'NULL';
      sql += `INSERT INTO goals (id, "attendantId", title, description, "targetValue", "currentValue", "endDate", "isActive", "createdAt") VALUES (${goal.id}, ${goal.attendantId}, '${goal.title.replace(/'/g, "''")}', ${description}, '${goal.targetValue}', '${goal.currentValue}', '${goal.endDate}', ${goal.isActive}, '${goal.createdAt}');\n`;
    });

    sql += '\n-- Insert Achievements\n';
    achievementsData.forEach((achievement: Achievement) => {
      const description = achievement.description ? `'${achievement.description.replace(/'/g, "''")}'` : 'NULL';
      sql += `INSERT INTO achievements (id, "attendantId", title, description, "pointsAwarded", "badgeColor", "achievedAt") VALUES (${achievement.id}, ${achievement.attendantId}, '${achievement.title.replace(/'/g, "''")}', ${description}, ${achievement.pointsAwarded}, '${achievement.badgeColor}', '${achievement.achievedAt}');\n`;
    });

    sql += '\n-- Insert Notifications\n';
    notificationsData.forEach((notification: Notification) => {
      const message = notification.message ? `'${notification.message.replace(/'/g, "''")}'` : 'NULL';
      sql += `INSERT INTO notifications (id, type, title, message, "isRead", "createdAt") VALUES (${notification.id}, '${notification.type}', '${notification.title.replace(/'/g, "''")}', ${message}, ${notification.isRead}, '${notification.createdAt}');\n`;
    });

    sql += '\n-- Insert Leaderboard\n';
    leaderboardData.forEach((entry: Leaderboard) => {
      sql += `INSERT INTO leaderboard (id, "attendantId", "totalPoints", "currentStreak", "bestStreak", "rank", "updatedAt") VALUES (${entry.id}, ${entry.attendantId}, ${entry.totalPoints}, ${entry.currentStreak}, ${entry.bestStreak}, ${entry.rank}, '${entry.updatedAt}');\n`;
    });

    return sql;
  }

  async createScheduledBackup(): Promise<void> {
    const backupHour = 3; // 3 AM
    const now = new Date();
    const nextBackup = new Date();
    
    nextBackup.setHours(backupHour, 0, 0, 0);
    if (nextBackup <= now) {
      nextBackup.setDate(nextBackup.getDate() + 1);
    }
    
    const timeUntilBackup = nextBackup.getTime() - now.getTime();
    
    setTimeout(async () => {
      try {
        await this.createFullBackup();
        await this.deleteOldBackups(30); // Keep backups for 30 days
        console.log(`Scheduled backup completed at ${new Date().toISOString()}`);
      } catch (error) {
        console.error('Scheduled backup failed:', error);
      }
      
      // Schedule next backup
      this.createScheduledBackup();
    }, timeUntilBackup);
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Create singleton instance
export const backupManager = new BackupManager();

// Start scheduled backups if in production
if (process.env.NODE_ENV === 'production') {
  backupManager.createScheduledBackup();
}