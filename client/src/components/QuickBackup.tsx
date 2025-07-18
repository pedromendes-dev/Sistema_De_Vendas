import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Shield, CheckCircle, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getBackupHistory } from '@/utils/auto-backup';

export default function QuickBackup() {
  const { toast } = useToast();
  const [lastBackup, setLastBackup] = useState<{
    time: Date;
    filename: string;
  } | null>(null);
  const [backupHistory, setBackupHistory] = useState<any[]>([]);

  // Load backup history on mount
  useEffect(() => {
    const history = getBackupHistory();
    setBackupHistory(history);
    
    if (history.length > 0) {
      const latest = history[history.length - 1];
      setLastBackup({
        time: new Date(latest.time),
        filename: latest.filename
      });
    }
  }, []);

  // Create backup mutation
  const createBackupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', '/api/backup/create');
      return response.json();
    },
    onSuccess: (data) => {
      setLastBackup({
        time: new Date(),
        filename: data.filename
      });
      
      toast({
        title: "✅ Backup criado com sucesso!",
        description: `${data.records} registros salvos`,
      });
      
      // Update backup history
      const newHistory = getBackupHistory();
      setBackupHistory(newHistory);
      
      // Auto download
      if (data.filename) {
        window.open(`/api/backup/download/${data.filename}`, '_blank');
      }
    },
    onError: () => {
      toast({
        title: "Erro ao criar backup",
        description: "Não foi possível criar o backup. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleBackup = () => {
    createBackupMutation.mutate();
  };

  return (
    <Card className="bg-gradient-to-r from-info/10 to-success/10 border-info/20 hover:shadow-lg transition-all">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-info/20 rounded-full">
              <Shield className="h-5 w-5 text-info" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Backup Rápido</h3>
              <div className="text-xs text-muted-foreground">
                {lastBackup ? (
                  <>
                    Último: {format(lastBackup.time, "HH:mm", { locale: ptBR })}
                    {differenceInMinutes(new Date(), lastBackup.time) > 60 && (
                      <Badge variant="outline" className="ml-2 text-xs text-warning">
                        <Clock className="h-3 w-3 mr-1" />
                        {Math.floor(differenceInMinutes(new Date(), lastBackup.time) / 60)}h atrás
                      </Badge>
                    )}
                    {differenceInMinutes(new Date(), lastBackup.time) <= 60 && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Protegido
                      </Badge>
                    )}
                  </>
                ) : (
                  <>
                    Proteja seus dados agora
                    <Badge variant="outline" className="ml-2 text-xs text-warning">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Sem backup
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleBackup}
            disabled={createBackupMutation.isPending}
            size="sm"
            className="bg-info hover:bg-info/90"
          >
            {createBackupMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Backup
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}