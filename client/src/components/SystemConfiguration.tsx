import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Building2, 
  Users, 
  DollarSign, 
  Target, 
  Trophy, 
  Bell, 
  Palette,
  Save,
  RotateCcw
} from 'lucide-react';

interface SystemConfig {
  company: {
    name: string;
    logo: string;
    theme: string;
    currency: string;
  };
  sales: {
    enableCommissions: boolean;
    commissionRate: number;
    autoCalculateEarnings: boolean;
    requireApproval: boolean;
  };
  goals: {
    enableGoals: boolean;
    defaultGoalPeriod: string;
    autoCreateGoals: boolean;
    goalNotifications: boolean;
  };
  notifications: {
    enableSound: boolean;
    enablePush: boolean;
    salesNotifications: boolean;
    achievementNotifications: boolean;
    goalNotifications: boolean;
  };
  gamification: {
    enablePoints: boolean;
    enableBadges: boolean;
    enableLeaderboard: boolean;
    pointsPerSale: number;
  };
}

export default function SystemConfiguration() {
  const { toast } = useToast();
  const [config, setConfig] = useState<SystemConfig>({
    company: {
      name: '',
      logo: '',
      theme: 'default',
      currency: 'BRL'
    },
    sales: {
      enableCommissions: true,
      commissionRate: 5,
      autoCalculateEarnings: true,
      requireApproval: false
    },
    goals: {
      enableGoals: true,
      defaultGoalPeriod: 'monthly',
      autoCreateGoals: false,
      goalNotifications: true
    },
    notifications: {
      enableSound: true,
      enablePush: true,
      salesNotifications: true,
      achievementNotifications: true,
      goalNotifications: true
    },
    gamification: {
      enablePoints: true,
      enableBadges: true,
      enableLeaderboard: true,
      pointsPerSale: 10
    }
  });

  // Load configuration from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('system_config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const saveConfiguration = () => {
    localStorage.setItem('system_config', JSON.stringify(config));
    toast({
      title: "Configuração salva",
      description: "As configurações do sistema foram atualizadas com sucesso.",
    });
  };

  const resetConfiguration = () => {
    localStorage.removeItem('system_config');
    setConfig({
      company: {
        name: '',
        logo: '',
        theme: 'default',
        currency: 'BRL'
      },
      sales: {
        enableCommissions: true,
        commissionRate: 5,
        autoCalculateEarnings: true,
        requireApproval: false
      },
      goals: {
        enableGoals: true,
        defaultGoalPeriod: 'monthly',
        autoCreateGoals: false,
        goalNotifications: true
      },
      notifications: {
        enableSound: true,
        enablePush: true,
        salesNotifications: true,
        achievementNotifications: true,
        goalNotifications: true
      },
      gamification: {
        enablePoints: true,
        enableBadges: true,
        enableLeaderboard: true,
        pointsPerSale: 10
      }
    });
    toast({
      title: "Configuração resetada",
      description: "Todas as configurações foram restauradas para os valores padrão.",
    });
  };

  const updateConfig = (section: keyof SystemConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-light">Configurações do Sistema</h2>
          <p className="text-secondary-light">Personalize seu sistema de gestão de vendas</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={resetConfiguration}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Resetar
          </Button>
          <Button
            onClick={saveConfiguration}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nome da Empresa</Label>
              <Input
                id="company-name"
                value={config.company.name}
                onChange={(e) => updateConfig('company', 'name', e.target.value)}
                placeholder="Digite o nome da sua empresa"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company-logo">URL do Logo</Label>
              <Input
                id="company-logo"
                value={config.company.logo}
                onChange={(e) => updateConfig('company', 'logo', e.target.value)}
                placeholder="https://exemplo.com/logo.png"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moeda</Label>
              <Select 
                value={config.company.currency} 
                onValueChange={(value) => updateConfig('company', 'currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real (R$)</SelectItem>
                  <SelectItem value="USD">Dólar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Tema</Label>
              <Select 
                value={config.company.theme} 
                onValueChange={(value) => updateConfig('company', 'theme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Padrão</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="modern">Moderno</SelectItem>
                  <SelectItem value="minimal">Minimalista</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sales Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Vendas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Comissões Automáticas</Label>
                <p className="text-sm text-muted-foreground">Calcular automaticamente comissões de vendas</p>
              </div>
              <Switch
                checked={config.sales.enableCommissions}
                onCheckedChange={(checked) => updateConfig('sales', 'enableCommissions', checked)}
              />
            </div>

            {config.sales.enableCommissions && (
              <div className="space-y-2">
                <Label htmlFor="commission-rate">Taxa de Comissão (%)</Label>
                <Input
                  id="commission-rate"
                  type="number"
                  value={config.sales.commissionRate}
                  onChange={(e) => updateConfig('sales', 'commissionRate', Number(e.target.value))}
                  min="0"
                  max="100"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Aprovação Obrigatória</Label>
                <p className="text-sm text-muted-foreground">Vendas precisam ser aprovadas por um gestor</p>
              </div>
              <Switch
                checked={config.sales.requireApproval}
                onCheckedChange={(checked) => updateConfig('sales', 'requireApproval', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Goals Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Metas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sistema de Metas</Label>
                <p className="text-sm text-muted-foreground">Ativar sistema de metas para vendedores</p>
              </div>
              <Switch
                checked={config.goals.enableGoals}
                onCheckedChange={(checked) => updateConfig('goals', 'enableGoals', checked)}
              />
            </div>

            {config.goals.enableGoals && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="goal-period">Período Padrão das Metas</Label>
                  <Select 
                    value={config.goals.defaultGoalPeriod} 
                    onValueChange={(value) => updateConfig('goals', 'defaultGoalPeriod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações de Metas</Label>
                    <p className="text-sm text-muted-foreground">Receber notificações sobre progresso das metas</p>
                  </div>
                  <Switch
                    checked={config.goals.goalNotifications}
                    onCheckedChange={(checked) => updateConfig('goals', 'goalNotifications', checked)}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Gamification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Gamificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sistema de Pontos</Label>
                <p className="text-sm text-muted-foreground">Ativar pontuação para vendas</p>
              </div>
              <Switch
                checked={config.gamification.enablePoints}
                onCheckedChange={(checked) => updateConfig('gamification', 'enablePoints', checked)}
              />
            </div>

            {config.gamification.enablePoints && (
              <div className="space-y-2">
                <Label htmlFor="points-per-sale">Pontos por Venda</Label>
                <Input
                  id="points-per-sale"
                  type="number"
                  value={config.gamification.pointsPerSale}
                  onChange={(e) => updateConfig('gamification', 'pointsPerSale', Number(e.target.value))}
                  min="1"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Conquistas</Label>
                <p className="text-sm text-muted-foreground">Sistema de badges e conquistas</p>
              </div>
              <Switch
                checked={config.gamification.enableBadges}
                onCheckedChange={(checked) => updateConfig('gamification', 'enableBadges', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Ranking</Label>
                <p className="text-sm text-muted-foreground">Ranking público de vendedores</p>
              </div>
              <Switch
                checked={config.gamification.enableLeaderboard}
                onCheckedChange={(checked) => updateConfig('gamification', 'enableLeaderboard', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sound Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Sons e Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Som de Caixa Registradora</Label>
                <p className="text-sm text-muted-foreground">Tocar som ao registrar vendas</p>
                <a href="/sound-test" target="_blank" className="text-xs text-primary hover:underline">
                  Clique aqui para testar os sons →
                </a>
              </div>
              <Switch
                checked={config.notifications.enableSound}
                onCheckedChange={(checked) => updateConfig('notifications', 'enableSound', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações Push</Label>
                <p className="text-sm text-muted-foreground">Receber notificações do navegador</p>
              </div>
              <Switch
                checked={config.notifications.enablePush}
                onCheckedChange={(checked) => updateConfig('notifications', 'enablePush', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações de Vendas</Label>
                <p className="text-sm text-muted-foreground">Alertas para novas vendas</p>
              </div>
              <Switch
                checked={config.notifications.salesNotifications}
                onCheckedChange={(checked) => updateConfig('notifications', 'salesNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações de Conquistas</Label>
                <p className="text-sm text-muted-foreground">Alertas ao desbloquear conquistas</p>
              </div>
              <Switch
                checked={config.notifications.achievementNotifications}
                onCheckedChange={(checked) => updateConfig('notifications', 'achievementNotifications', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Preview da Configuração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Badge variant={config.sales.enableCommissions ? "default" : "secondary"}>
                Comissões {config.sales.enableCommissions ? 'ON' : 'OFF'}
              </Badge>
            </div>
            <div className="text-center">
              <Badge variant={config.goals.enableGoals ? "default" : "secondary"}>
                Metas {config.goals.enableGoals ? 'ON' : 'OFF'}
              </Badge>
            </div>
            <div className="text-center">
              <Badge variant={config.gamification.enablePoints ? "default" : "secondary"}>
                Pontos {config.gamification.enablePoints ? 'ON' : 'OFF'}
              </Badge>
            </div>
            <div className="text-center">
              <Badge variant={config.notifications.enableSound ? "default" : "secondary"}>
                Som {config.notifications.enableSound ? 'ON' : 'OFF'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}