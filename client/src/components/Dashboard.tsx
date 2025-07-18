import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Users, DollarSign, Target, Award, Activity } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { Attendant, Sale, Goal } from "@shared/schema";

export default function Dashboard() {
  // Fetch data
  const { data: attendants = [] } = useQuery<Attendant[]>({
    queryKey: ["/api/attendants"],
  });

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  // Calculate metrics
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.value), 0);
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
  const activeGoals = goals.filter(g => g.isActive === 1).length;

  // Sales by day (last 7 days)
  const salesByDay = (() => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySales = sales.filter(sale => {
        const saleDate = new Date(sale.createdAt);
        return saleDate.toISOString().split('T')[0] === dateStr;
      });
      
      days.push({
        date: date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }),
        vendas: daySales.length,
        valor: daySales.reduce((sum, sale) => sum + parseFloat(sale.value), 0)
      });
    }
    
    return days;
  })();

  // Top 5 attendants by revenue
  const topAttendants = attendants
    .map(att => ({
      name: att.name.length > 15 ? att.name.substring(0, 15) + '...' : att.name,
      value: parseFloat(att.earnings)
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Sales distribution by value range
  const salesDistribution = [
    { name: 'R$ 0-50', value: sales.filter(s => parseFloat(s.value) <= 50).length, color: '#10b981' },
    { name: 'R$ 51-100', value: sales.filter(s => parseFloat(s.value) > 50 && parseFloat(s.value) <= 100).length, color: '#3b82f6' },
    { name: 'R$ 101-200', value: sales.filter(s => parseFloat(s.value) > 100 && parseFloat(s.value) <= 200).length, color: '#f59e0b' },
    { name: 'R$ 200+', value: sales.filter(s => parseFloat(s.value) > 200).length, color: '#ef4444' }
  ].filter(item => item.value > 0); // Só mostra categorias com vendas

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Faturamento Total</p>
                <p className="text-2xl font-bold text-success">R$ {totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-success opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Vendas</p>
                <p className="text-2xl font-bold text-info">{totalSales}</p>
              </div>
              <Activity className="h-8 w-8 text-info opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold text-warning">R$ {averageTicket.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-warning opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Metas Ativas</p>
                <p className="text-2xl font-bold text-primary">{activeGoals}</p>
              </div>
              <Target className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Vendas dos Últimos 7 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                  name="Valor (R$)"
                />
                <Line 
                  type="monotone" 
                  dataKey="vendas" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  name="Quantidade"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Attendants */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top 5 Atendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topAttendants}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  formatter={(value: any) => `R$ ${value.toFixed(2)}`}
                />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Distribuição de Vendas por Valor</CardTitle>
          </CardHeader>
          <CardContent>
            {salesDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={salesDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {salesDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    formatter={(value: any) => [`${value} vendas`, 'Quantidade']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <p>Nenhuma venda registrada ainda</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goal Progress */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Progresso das Metas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {goals.filter(g => g.isActive === 1).slice(0, 5).map(goal => {
                const progress = (parseFloat(goal.currentValue) / parseFloat(goal.targetValue)) * 100;
                const attendant = attendants.find(a => a.id === goal.attendantId);
                
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{attendant?.name || 'Desconhecido'} - {goal.title}</span>
                      <span className="font-medium">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-success h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}