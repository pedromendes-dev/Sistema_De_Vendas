import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Scatter, ScatterChart, ComposedChart
} from 'recharts';
import { 
  DollarSign, TrendingUp, Users, Target, Activity, Award, ArrowUp, ArrowDown, Clock, Calendar,
  BarChart3, PieChartIcon, ShoppingCart, Percent, Timer, Zap, Trophy, Star, Hash, Filter,
  Download, RefreshCw, ChevronRight, Info, AlertCircle, TrendingDown, Eye, CalendarDays
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  subtitle?: string;
  color?: string;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend, subtitle, color = 'primary', onClick }) => {
  const colorClasses = {
    primary: 'from-primary/10 to-primary/5 border-primary/20 text-primary bg-primary/20',
    success: 'from-success/10 to-success/5 border-success/20 text-success bg-success/20',
    info: 'from-info/10 to-info/5 border-info/20 text-info bg-info/20',
    warning: 'from-warning/10 to-warning/5 border-warning/20 text-warning bg-warning/20',
  };

  const classes = colorClasses[color as keyof typeof colorClasses] || colorClasses.primary;
  const [fromClass, toClass, borderClass, textClass, bgClass] = classes.split(' ');

  return (
    <Card 
      className={`relative overflow-hidden transition-all hover:shadow-lg cursor-pointer bg-gradient-to-br ${fromClass} ${toClass} ${borderClass}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className={`text-3xl font-bold ${textClass}`}>{value}</p>
              {trend !== undefined && (
                <Badge variant={trend >= 0 ? 'success' : 'destructive'} className="gap-1">
                  {trend >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {Math.abs(trend).toFixed(1)}%
                </Badge>
              )}
            </div>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-lg ${bgClass}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function DashboardAdvanced() {
  const [period, setPeriod] = useState('week');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const { data: sales = [], refetch: refetchSales } = useQuery<any[]>({
    queryKey: ['/api/sales']
  });

  const { data: attendants = [], refetch: refetchAttendants } = useQuery<any[]>({
    queryKey: ['/api/attendants']
  });

  const { data: goals = [], refetch: refetchGoals } = useQuery<any[]>({
    queryKey: ['/api/goals']
  });

  const { data: achievements = [] } = useQuery<any[]>({
    queryKey: ['/api/achievements']
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchSales(), refetchAttendants(), refetchGoals()]);
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleExport = () => {
    const data = {
      period,
      totalRevenue,
      totalSales: sales.length,
      averageTicket,
      topPerformers,
      salesByPeriod,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
  };

  // Calculate metrics based on period
  const getPeriodDates = () => {
    const now = new Date();
    switch (period) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'week':
        return { start: startOfWeek(now, { locale: ptBR }), end: endOfWeek(now, { locale: ptBR }) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'quarter':
        return { start: subDays(now, 90), end: now };
      case 'year':
        return { start: subDays(now, 365), end: now };
      default:
        return { start: subDays(now, 7), end: now };
    }
  };

  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.createdAt);
    const { start, end } = getPeriodDates();
    return saleDate >= start && saleDate <= end;
  });

  // Advanced Metrics
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.value), 0);
  const totalSales = filteredSales.length;
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
  const conversionRate = attendants.length > 0 ? (attendants.filter(a => parseFloat(a.earnings) > 0).length / attendants.length) * 100 : 0;
  
  // Period comparison
  const previousPeriodSales = sales.filter(sale => {
    const saleDate = new Date(sale.createdAt);
    const { start } = getPeriodDates();
    const periodLength = period === 'today' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 90;
    const previousStart = subDays(start, periodLength);
    const previousEnd = subDays(start, 1);
    return saleDate >= previousStart && saleDate <= previousEnd;
  });
  
  const previousRevenue = previousPeriodSales.reduce((sum, sale) => sum + parseFloat(sale.value), 0);
  const revenueTrend = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

  // Top performers with advanced metrics
  const topPerformers = attendants
    .map(att => {
      const attSales = filteredSales.filter(s => s.attendantId === att.id);
      const revenue = attSales.reduce((sum, sale) => sum + parseFloat(sale.value), 0);
      const salesCount = attSales.length;
      const avgTicket = salesCount > 0 ? revenue / salesCount : 0;
      const attGoals = goals.filter(g => g.attendantId === att.id && g.isActive === 1);
      const completedGoals = attGoals.filter(g => g.progress >= 100).length;
      
      return {
        ...att,
        revenue,
        salesCount,
        avgTicket,
        totalGoals: attGoals.length,
        completedGoals,
        performance: salesCount > 0 ? (revenue / totalRevenue) * 100 : 0
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Sales by hour analysis
  const salesByHour = Array.from({ length: 24 }, (_, hour) => {
    const hourSales = filteredSales.filter(sale => {
      const saleHour = new Date(sale.createdAt).getHours();
      return saleHour === hour;
    });
    
    return {
      hour: `${hour}:00`,
      vendas: hourSales.length,
      valor: hourSales.reduce((sum, sale) => sum + parseFloat(sale.value), 0)
    };
  });

  // Sales velocity (sales per day)
  const salesVelocity = (() => {
    const daysInPeriod = period === 'today' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 90;
    return totalSales / daysInPeriod;
  })();

  // Customer insights
  const customerMetrics = {
    uniqueCustomers: new Set(filteredSales.map(s => s.clientName).filter(Boolean)).size,
    repeatCustomers: (() => {
      const customerCounts = filteredSales.reduce((acc, sale) => {
        if (sale.clientName) {
          acc[sale.clientName] = (acc[sale.clientName] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      return Object.values(customerCounts).filter(count => count > 1).length;
    })(),
    averageCustomerValue: 0
  };
  
  customerMetrics.averageCustomerValue = customerMetrics.uniqueCustomers > 0 
    ? totalRevenue / customerMetrics.uniqueCustomers 
    : 0;

  // Product category distribution (simulated)
  const categoryDistribution = [
    { name: 'Produtos', value: filteredSales.filter(s => parseFloat(s.value) < 50).length, color: '#10b981' },
    { name: 'Serviços', value: filteredSales.filter(s => parseFloat(s.value) >= 50 && parseFloat(s.value) < 150).length, color: '#3b82f6' },
    { name: 'Premium', value: filteredSales.filter(s => parseFloat(s.value) >= 150).length, color: '#8b5cf6' }
  ].filter(cat => cat.value > 0);

  // Goals progress
  const activeGoals = goals.filter(g => g.isActive === 1);
  const goalsProgress = activeGoals.length > 0 
    ? activeGoals.reduce((sum, goal) => sum + goal.progress, 0) / activeGoals.length 
    : 0;

  // Performance radar data
  const performanceRadar = topPerformers.slice(0, 5).map(performer => ({
    name: performer.name.split(' ')[0],
    vendas: performer.salesCount,
    faturamento: performer.revenue / 100,
    ticket: performer.avgTicket,
    metas: performer.completedGoals * 20,
    eficiência: performer.performance
  }));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Avançado</h1>
          <p className="text-muted-foreground">Análise completa do desempenho de vendas</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Faturamento Total"
          value={`R$ ${totalRevenue.toFixed(2)}`}
          icon={<DollarSign className="h-6 w-6" />}
          trend={revenueTrend}
          subtitle={`${totalSales} vendas realizadas`}
          color="success"
        />
        
        <MetricCard
          title="Ticket Médio"
          value={`R$ ${averageTicket.toFixed(2)}`}
          icon={<ShoppingCart className="h-6 w-6" />}
          trend={previousPeriodSales.length > 0 ? ((averageTicket - (previousRevenue / previousPeriodSales.length)) / (previousRevenue / previousPeriodSales.length)) * 100 : 0}
          subtitle="Por transação"
          color="info"
        />
        
        <MetricCard
          title="Taxa de Conversão"
          value={`${conversionRate.toFixed(1)}%`}
          icon={<Percent className="h-6 w-6" />}
          subtitle="Atendentes com vendas"
          color="warning"
        />
        
        <MetricCard
          title="Velocidade de Vendas"
          value={salesVelocity.toFixed(1)}
          icon={<Zap className="h-6 w-6" />}
          subtitle="Vendas por dia"
          color="primary"
        />
      </div>

      {/* Customer Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Insights de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{customerMetrics.uniqueCustomers}</p>
              <p className="text-sm text-muted-foreground">Clientes Únicos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{customerMetrics.repeatCustomers}</p>
              <p className="text-sm text-muted-foreground">Clientes Recorrentes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">R$ {customerMetrics.averageCustomerValue.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Valor Médio por Cliente</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Charts */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="distribution">Distribuição</TabsTrigger>
          <TabsTrigger value="goals">Metas</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Performers Table */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.slice(0, 5).map((performer, index) => (
                    <div key={performer.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{performer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {performer.salesCount} vendas | Ticket: R$ {performer.avgTicket.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">R$ {performer.revenue.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{performer.performance.toFixed(1)}% do total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Análise de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={performanceRadar}>
                    <PolarGrid strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Performance" dataKey="eficiência" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                    <Radar name="Vendas" dataKey="vendas" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Sales by Hour */}
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Hora</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesByHour}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `R$ ${value.toFixed(2)}`} />
                    <Area type="monotone" dataKey="valor" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Composed Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Análise Combinada</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={salesByHour.filter((_, i) => i % 3 === 0)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="vendas" fill="#10b981" />
                    <Line yAxisId="right" type="monotone" dataKey="valor" stroke="#f59e0b" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Scatter Plot */}
            <Card>
              <CardHeader>
                <CardTitle>Análise de Dispersão</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="salesCount" name="Vendas" />
                    <YAxis dataKey="avgTicket" name="Ticket Médio" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Atendentes" data={topPerformers} fill="#8b5cf6">
                      {topPerformers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index < 3 ? '#10b981' : '#8b5cf6'} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progresso de Metas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Progresso Geral</p>
                  <p className="text-sm text-muted-foreground">{goalsProgress.toFixed(1)}%</p>
                </div>
                <Progress value={goalsProgress} className="h-2" />
                
                <Separator />
                
                <div className="space-y-3">
                  {activeGoals.slice(0, 5).map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">{goal.title}</p>
                        <Badge variant={goal.progress >= 100 ? 'success' : 'secondary'}>
                          {goal.progress}%
                        </Badge>
                      </div>
                      <Progress value={goal.progress} className="h-1" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-warning" />
              <div>
                <p className="text-2xl font-bold">{achievements.length}</p>
                <p className="text-xs text-muted-foreground">Conquistas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">{activeGoals.length}</p>
                <p className="text-xs text-muted-foreground">Metas Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-info" />
              <div>
                <p className="text-2xl font-bold">{attendants.length}</p>
                <p className="text-xs text-muted-foreground">Atendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-success" />
              <div>
                <p className="text-2xl font-bold">{format(new Date(), 'HH:mm')}</p>
                <p className="text-xs text-muted-foreground">Hora Atual</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Add missing imports
import { startOfDay, endOfDay } from 'date-fns';