import { apiRequest } from '@/lib/queryClient';

// Check if auto backup is enabled
const isAutoBackupEnabled = () => {
  const settings = localStorage.getItem('system_config');
  if (!settings) return true; // Default to enabled
  
  try {
    const config = JSON.parse(settings);
    return config.autoBackup !== false;
  } catch {
    return true;
  }
};

// Get last backup time
const getLastBackupTime = (): Date | null => {
  const lastBackup = localStorage.getItem('last_backup_time');
  return lastBackup ? new Date(lastBackup) : null;
};

// Set last backup time
const setLastBackupTime = () => {
  localStorage.setItem('last_backup_time', new Date().toISOString());
};

// Check if backup is needed (more than 1 hour since last backup)
const isBackupNeeded = (): boolean => {
  const lastBackup = getLastBackupTime();
  if (!lastBackup) return true;
  
  const hoursSinceLastBackup = (Date.now() - lastBackup.getTime()) / (1000 * 60 * 60);
  return hoursSinceLastBackup > 1;
};

// Create automatic backup
export const createAutoBackup = async (trigger: 'sale' | 'attendant' | 'goal' | 'manual' = 'manual') => {
  try {
    // Check if auto backup is enabled
    if (!isAutoBackupEnabled() && trigger !== 'manual') {
      console.log('Auto backup disabled');
      return;
    }

    // Check if backup is needed
    if (!isBackupNeeded() && trigger !== 'manual') {
      console.log('Backup not needed yet');
      return;
    }

    // Create backup
    const response = await apiRequest('GET', '/api/backup/create');
    const data = await response.json();
    
    if (data.filename) {
      setLastBackupTime();
      console.log(`Auto backup created: ${data.filename}`);
      
      // Store backup info
      const backupHistory = JSON.parse(localStorage.getItem('backup_history') || '[]');
      backupHistory.push({
        filename: data.filename,
        time: new Date().toISOString(),
        trigger,
        records: data.records
      });
      
      // Keep only last 10 backups in history
      if (backupHistory.length > 10) {
        backupHistory.shift();
      }
      
      localStorage.setItem('backup_history', JSON.stringify(backupHistory));
    }
    
    return data;
  } catch (error) {
    console.error('Auto backup failed:', error);
  }
};

// Get backup history
export const getBackupHistory = () => {
  const history = localStorage.getItem('backup_history');
  return history ? JSON.parse(history) : [];
};

// Schedule automatic backups every 30 minutes when the app is active
let backupInterval: NodeJS.Timeout | null = null;

export const startAutoBackupSchedule = () => {
  if (backupInterval) return;
  
  // Initial check
  createAutoBackup('manual');
  
  // Schedule every 30 minutes
  backupInterval = setInterval(() => {
    createAutoBackup('manual');
  }, 30 * 60 * 1000);
};

export const stopAutoBackupSchedule = () => {
  if (backupInterval) {
    clearInterval(backupInterval);
    backupInterval = null;
  }
};

// Auto start when module is imported
if (typeof window !== 'undefined') {
  startAutoBackupSchedule();
  
  // Stop on page unload
  window.addEventListener('beforeunload', stopAutoBackupSchedule);
}