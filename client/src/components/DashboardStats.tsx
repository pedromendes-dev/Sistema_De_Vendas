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
    <Card className="bg-card border-border hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-secondary-light mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-primary-light">{value}</h3>
              {change !== undefined && (
                <Badge variant={change >= 0 ? "default" : "destructive"} className="text-xs">
                  {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(change)}%
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-light mt-1">{description}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Vendas do Dia"
        value={todaySales.length}
        change={salesChange}
        icon={<DollarSign size={24} />}
        description="vendas realizadas hoje"
        color="success"
      />
      
      <StatCard
        title="Faturamento Total"
        value={`R$ ${totalRevenue.toFixed(2)}`}
        change={revenueChange}
        icon={<TrendingUp size={24} />}
        description="receita acumulada"
        color="info"
      />
      
      <StatCard
        title="Ticket Médio"
        value={`R$ ${averageTicket.toFixed(2)}`}
        change={performanceChange}
        icon={<Target size={24} />}
        description="valor médio por venda"
        color="warning"
      />
      
      <StatCard
        title="Conquistas"
        value={totalAchievements}
        icon={<Trophy size={24} />}
        description="badges conquistadas"
        color="success"
      />
    </div>
  );
}