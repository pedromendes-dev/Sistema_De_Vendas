import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Upload, 
  Database, 
  FileDown, 
  Trash2, 
  RefreshCw,
  Shield,
  Clock,
  HardDrive,
  AlertCircle,
  CheckCircle,
  Calendar,
  FileJson,
  Code,
  Save
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface Backup {
  filename: string;
  size: string;
  date: string;
}

export function BackupManager() {
  const { toast } = useToast();
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [downloadingBackup, setDownloadingBackup] = useState<string | null>(null);

  // Fetch backup list
  const { data: backups = [], isLoading, refetch } = useQuery<Backup[]>({
    queryKey: ['/api/backup/list'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Create backup mutation
  const createBackup = useMutation({
    mutationFn: () => apiRequest('/api/backup/create'),
    onSuccess: (data) => {
      toast({
        title: "Backup Criado!",
        description: `Arquivo: ${data.filename} - ${data.size} - ${data.records} registros`,
        variant: "success"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/backup/list'] });
      setCreatingBackup(false);
    },
    onError: () => {
      toast({
        title: "Erro ao criar backup",
        description: "Não foi possível criar o backup. Tente novamente.",
        variant: "destructive"
      });
      setCreatingBackup(false);
    }
  });

  // Clean old backups mutation
  const cleanBackups = useMutation({
    mutationFn: () => apiRequest('/api/backup/clean?days=30', { method: 'DELETE' }),
    onSuccess: (data) => {
      toast({
        title: "Limpeza Concluída",
        description: data.message,
        variant: "success"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/backup/list'] });
    },
    onError: () => {
      toast({
        title: "Erro na limpeza",
        description: "Não foi possível limpar os backups antigos.",
        variant: "destructive"
      });
    }
  });

  const handleCreateBackup = () => {
    setCreatingBackup(true);
    createBackup.mutate();
  };

  const handleDownloadBackup = async (filename: string) => {
    setDownloadingBackup(filename);
    try {
      const response = await fetch(`/api/backup/download/${filename}`);
      const data = await response.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Concluído",
        description: `Backup ${filename} baixado com sucesso!`,
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o backup.",
        variant: "destructive"
      });
    } finally {
      setDownloadingBackup(null);
    }
  };

  const handleDownloadSQL = async () => {
    try {
      const response = await fetch('/api/backup/export-sql');
      const sql = await response.text();
      
      const blob = new Blob([sql], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${format(new Date(), 'yyyy-MM-dd')}.sql`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "SQL Exportado",
        description: "Arquivo SQL exportado com sucesso!",
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o SQL.",
        variant: "destructive"
      });
    }
  };

  // Auto backup reminder
  useEffect(() => {
    const lastBackup = backups[0];
    if (lastBackup) {
      const lastBackupDate = new Date(lastBackup.date);
      const daysSinceBackup = Math.floor((Date.now() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceBackup > 7) {
        toast({
          title: "Recomendação de Backup",
          description: `Último backup foi há ${daysSinceBackup} dias. Recomendamos criar um novo backup.`,
          variant: "warning"
        });
      }
    }
  }, [backups, toast]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Sistema de Backup</h2>
        <p className="text-muted-foreground">
          Proteja seus dados com backups regulares. Recomendamos fazer backup semanalmente.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Criar Backup</p>
                <p className="text-2xl font-bold">Instantâneo</p>
                <p className="text-xs text-muted-foreground mt-1">Salva todos os dados atuais</p>
              </div>
              <Button
                onClick={handleCreateBackup}
                disabled={creatingBackup}
                className="bg-success hover:bg-success-dark"
              >
                {creatingBackup ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span className="ml-2">Criar Agora</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Exportar SQL</p>
                <p className="text-2xl font-bold">Banco Completo</p>
                <p className="text-xs text-muted-foreground mt-1">Para restauração manual</p>
              </div>
              <Button
                onClick={handleDownloadSQL}
                variant="outline"
                className="border-info text-info hover:bg-info/10"
              >
                <Code className="h-4 w-4" />
                <span className="ml-2">Exportar</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Limpar Antigos</p>
                <p className="text-2xl font-bold">+30 dias</p>
                <p className="text-xs text-muted-foreground mt-1">Libera espaço em disco</p>
              </div>
              <Button
                onClick={() => cleanBackups.mutate()}
                variant="outline"
                className="border-warning text-warning hover:bg-warning/10"
              >
                <Trash2 className="h-4 w-4" />
                <span className="ml-2">Limpar</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <CheckCircle className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium">Total de Backups</p>
                <p className="text-2xl font-bold">{backups.length}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/20">
                <Calendar className="h-4 w-4 text-info" />
              </div>
              <div>
                <p className="text-sm font-medium">Último Backup</p>
                <p className="text-sm text-muted-foreground">
                  {backups[0] ? format(new Date(backups[0].date), "dd/MM/yyyy HH:mm", { locale: ptBR }) : 'Nenhum'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <HardDrive className="h-4 w-4 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium">Espaço Usado</p>
                <p className="text-sm text-muted-foreground">
                  {backups.reduce((acc, b) => {
                    const sizeNum = parseFloat(b.size.split(' ')[0]);
                    return acc + (b.size.includes('MB') ? sizeNum * 1024 : sizeNum);
                  }, 0).toFixed(2)} KB
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Database className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Tipo de Backup</p>
                <p className="text-sm text-muted-foreground">PostgreSQL + JSON</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              Histórico de Backups
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : backups.length === 0 ? (
            <Card className="bg-warning/10 border-warning/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-warning mt-1" />
                  <div>
                    <p className="font-medium">Nenhum backup encontrado</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Crie seu primeiro backup para proteger seus dados.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div 
                  key={backup.filename}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileJson className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{backup.filename}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(backup.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </span>
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          {backup.size}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadBackup(backup.filename)}
                    disabled={downloadingBackup === backup.filename}
                  >
                    {downloadingBackup === backup.filename ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span className="ml-2">Baixar</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup Information */}
      <Card className="bg-info/10 border-info/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-info mt-1" />
            <div className="space-y-2">
              <p className="font-medium">Informações Importantes sobre Backup</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• Os backups são salvos automaticamente no servidor em formato JSON</p>
                <p>• Recomendamos fazer backup semanalmente ou antes de grandes mudanças</p>
                <p>• Backups antigos (mais de 30 dias) podem ser limpos automaticamente</p>
                <p>• Para restaurar um backup, entre em contato com o suporte técnico</p>
                <p>• Os backups incluem: Atendentes, Vendas, Metas, Conquistas e Notificações</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}