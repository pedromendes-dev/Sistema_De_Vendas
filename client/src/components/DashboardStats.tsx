import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Trophy, Calendar, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  description?: string;
  color?: 'success' | 'warning' | 'danger' | 'info';
}

function StatCard({ title, value, change, icon, description, color = 'info' }: StatCardProps) {
  const colorClasses = {
    success: 'text-success bg-success/10 border-success/20',
    warning: 'text-warning bg-warning/10 border-warning/20',
    danger: 'text-danger bg-danger/10 border-danger/20',
    info: 'text-info bg-info/10 border-info/20',
  };

  return (
    <Card className="bg-card border-border hover:border-primary/20 transition-all duration-300 hover:shadow-lg h-full card-adaptive constrain-width">
      <CardContent className="space-adaptive h-full">
        <div className="flex flex-col items-center text-center h-full justify-center">
          {/* Ícone no topo */}
          <div className={`space-adaptive rounded-lg ${colorClasses[color]} mb-2`}>
            {icon}
          </div>
          
          {/* Valor principal */}
          <div className="space-y-1">
            <h3 className="text-fluid-lg font-bold text-primary-light">{value}</h3>
            <p className="text-fluid-xs font-medium text-secondary-light leading-tight">{title}</p>
            {description && (
              <p className="text-fluid-xs text-muted-light leading-tight">{description}</p>
            )}
          </div>

          {/* Badge de mudança se houver */}
          {change !== undefined && (
            <Badge variant={change >= 0 ? "default" : "destructive"} className="text-fluid-xs mt-2">
              {change >= 0 ? <TrendingUp className="icon-adaptive" /> : <TrendingDown className="icon-adaptive" />}
              {Math.abs(change)}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardStats() {
  const { data: attendants = [] } = useQuery({ queryKey: ["/api/attendants"] });
  const { data: sales = [] } = useQuery({ queryKey: ["/api/sales"] });
  const { data: goals = [] } = useQuery({ queryKey: ["/api/goals"] });
  const { data: achievements = [] } = useQuery({ queryKey: ["/api/achievements"] });

  // Calculate statistics
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum: number, sale: any) => sum + parseFloat(sale.value), 0);
  const activeGoals = goals.filter((goal: any) => goal.isActive).length;
  const totalAchievements = achievements.length;
  
  const today = new Date();
  const todaySales = sales.filter((sale: any) => {
    const saleDate = new Date(sale.createdAt);
    return saleDate.toDateString() === today.toDateString();
  });

  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Mock performance data (in a real app, this would come from your API)
  const performanceChange = 12.5;
  const revenueChange = 8.3;
  const salesChange = -2.1;

  return (
    <div className="mb-6 sm:mb-8 constrain-width">
      {/* Universal Responsive Grid */}
      <div className="grid-adaptive">
        <StatCard
          title="Atendentes"
          value={attendants.length}
          icon={<Users className="icon-adaptive" />}
          description="total cadastrados"
          color="info"
        />
        
        <StatCard
          title="Vendas"
          value={totalSales}
          change={salesChange}
          icon={<DollarSign className="icon-adaptive" />}
          description="total realizadas"
          color="success"
        />
        
        <StatCard
          title="Metas"
          value={activeGoals}
          icon={<Target className="icon-adaptive" />}
          description="ativas"
          color="warning"
        />
        
        <StatCard
          title="Ativos"
          value={attendants.filter((a: any) => a.status === 'active').length}
          icon={<Zap className="icon-adaptive" />}
          description="trabalhando"
          color="success"
        />
      </div>

      {/* Summary Cards - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 constrain-width">
        <Card className="bg-gradient-to-r from-success/10 to-success/5 border-success/20 card-adaptive">
          <CardContent className="space-adaptive">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-fluid-sm font-medium text-secondary-light mb-1">Vendas Totais</p>
                <h3 className="text-fluid-xl font-bold text-success">R$ {totalRevenue.toFixed(2)}</h3>
                <p className="text-fluid-xs text-muted-light">Faturamento acumulado</p>
              </div>
              <div className="space-adaptive rounded-lg bg-success/20 text-success">
                <TrendingUp className="icon-adaptive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-info/10 to-info/5 border-info/20 card-adaptive">
          <CardContent className="space-adaptive">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-fluid-sm font-medium text-secondary-light mb-1">Média por Atendente</p>
                <h3 className="text-fluid-xl font-bold text-info">
                  R$ {attendants.length > 0 ? (totalRevenue / attendants.length).toFixed(2) : '0.00'}
                </h3>
                <p className="text-fluid-xs text-muted-light">Performance individual</p>
              </div>
              <div className="space-adaptive rounded-lg bg-info/20 text-info">
                <Trophy size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}