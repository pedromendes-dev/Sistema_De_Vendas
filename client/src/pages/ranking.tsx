import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Crown, Medal, Award, TrendingUp, Star, Target, Zap } from "lucide-react";
import ModernHeader from "@/components/ModernHeader";
import Navigation from "@/components/Navigation";
import type { Attendant, Sale } from "@shared/schema";

export default function Ranking() {
  // Fetch attendants and sales
  const { data: attendants, isLoading: loadingAttendants } = useQuery<Attendant[]>({
    queryKey: ["/api/attendants"],
  });

  const { data: sales, isLoading: loadingSales } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const isLoading = loadingAttendants || loadingSales;

  // Calculate ranking data
  const rankingData = attendants?.map(attendant => {
    const attendantSales = sales?.filter(sale => sale.attendantId === attendant.id) || [];
    const totalSales = attendantSales.length;
    const totalValue = parseFloat(attendant.earnings);
    const averageTicket = totalSales > 0 ? totalValue / totalSales : 0;
    
    // Calculate this month's performance
    const today = new Date();
    const thisMonth = attendantSales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return saleDate.getMonth() === today.getMonth() && saleDate.getFullYear() === today.getFullYear();
    });
    
    const thisMonthValue = thisMonth.reduce((sum, sale) => sum + parseFloat(sale.value), 0);
    const completionRate = Math.min((totalValue / 1000) * 100, 100); // Meta de R$ 1000
    
    return {
      ...attendant,
      totalSales,
      totalValue,
      averageTicket,
      thisMonthSales: thisMonth.length,
      thisMonthValue,
      completionRate,
      performance: totalValue > 0 ? 'excellent' : 'good'
    };
  }).sort((a, b) => b.totalValue - a.totalValue) || [];

  const maxEarnings = rankingData.length > 0 ? rankingData[0].totalValue : 1;

  const getRankIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Crown className="text-yellow-400" size={24} />;
      case 1:
        return <Medal className="text-gray-400" size={24} />;
      case 2:
        return <Award className="text-amber-600" size={24} />;
      default:
        return <Trophy className="text-secondary-light" size={24} />;
    }
  };

  const getRankBadge = (position: number) => {
    switch (position) {
      case 0:
        return <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-primary-dark font-bold">🥇 1º Lugar</Badge>;
      case 1:
        return <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 text-primary-dark font-bold">🥈 2º Lugar</Badge>;
      case 2:
        return <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold">🥉 3º Lugar</Badge>;
      default:
        return <Badge variant="outline" className="border-border text-secondary-light">{position + 1}º Lugar</Badge>;
    }
  };

  const getCardStyle = (position: number) => {
    switch (position) {
      case 0:
        return "bg-gradient-to-br from-yellow-400/10 to-orange-400/10 border-yellow-400/30 shadow-lg shadow-yellow-400/20";
      case 1:
        return "bg-gradient-to-br from-gray-300/10 to-gray-500/10 border-gray-400/30 shadow-lg shadow-gray-400/20";
      case 2:
        return "bg-gradient-to-br from-amber-600/10 to-orange-600/10 border-amber-600/30 shadow-lg shadow-amber-600/20";
      default:
        return "bg-card border-border hover:border-primary/20 transition-all duration-300";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary-dark to-secondary-dark/50">
        <ModernHeader />
        <Navigation />
        <main className="px-4 py-6 pb-20 sm:pb-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-accent rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-accent rounded w-3/4"></div>
                        <div className="h-3 bg-accent rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary-dark to-secondary-dark/50">
      <ModernHeader />
      <Navigation />

      <main className="px-4 py-6 pb-20 sm:pb-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-success to-info rounded-xl">
              <Trophy className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-light">Ranking de Vendas</h1>
              <p className="text-secondary-light">Classificação dos melhores vendedores</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <Card className="bg-card/50 border-border">
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-success mb-1">
                  {rankingData.length}
                </div>
                <div className="text-xs text-secondary-light">Vendedores</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border">
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-info mb-1">
                  {sales?.length || 0}
                </div>
                <div className="text-xs text-secondary-light">Vendas Total</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border">
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-warning mb-1">
                  R$ {rankingData.reduce((sum, a) => sum + a.totalValue, 0).toFixed(0)}
                </div>
                <div className="text-xs text-secondary-light">Faturamento</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border">
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-purple-400 mb-1">
                  R$ {rankingData.length > 0 ? (rankingData.reduce((sum, a) => sum + a.averageTicket, 0) / rankingData.length).toFixed(0) : 0}
                </div>
                <div className="text-xs text-secondary-light">Ticket Médio</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ranking List */}
        <div className="space-y-4">
          {rankingData.map((attendant, index) => (
            <Card key={attendant.id} className={`${getCardStyle(index)} ranking-card mobile-shadow-lg`}>
              <CardContent className="p-0">
                {/* Mobile Layout */}
                <div className="block lg:hidden p-4">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getRankIcon(index)}
                        <div>
                          {getRankBadge(index)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-success">
                          R$ {attendant.totalValue.toFixed(2)}
                        </div>
                        <div className="text-xs text-secondary-light">
                          Total Faturado
                        </div>
                      </div>
                    </div>
                    
                    {/* Profile */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img 
                          src={attendant.imageUrl}
                          alt={attendant.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-success/20"
                        />
                        {index < 3 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-success to-info rounded-full flex items-center justify-center text-xs font-bold text-white">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-primary-light truncate">
                          {attendant.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <TrendingUp size={14} className="text-success" />
                          <span className="text-sm text-secondary-light">
                            {attendant.completionRate.toFixed(0)}% da meta
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-secondary-light">
                        <span>Progresso da Meta</span>
                        <span>{attendant.completionRate.toFixed(0)}%</span>
                      </div>
                      <Progress value={attendant.completionRate} className="h-2" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-info/10 border border-info/20 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-info mb-1">
                          {attendant.totalSales}
                        </div>
                        <div className="text-xs text-secondary-light">
                          Vendas
                        </div>
                      </div>
                      <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-warning mb-1">
                          R$ {attendant.averageTicket.toFixed(0)}
                        </div>
                        <div className="text-xs text-secondary-light">
                          Ticket Médio
                        </div>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-purple-400 mb-1">
                          {attendant.thisMonthSales}
                        </div>
                        <div className="text-xs text-secondary-light">
                          Este Mês
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:flex lg:items-center lg:gap-6 lg:p-6">
                  {/* Rank */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    {getRankIcon(index)}
                    <span className="text-lg font-bold text-primary-light mt-1">
                      {index + 1}º
                    </span>
                  </div>

                  {/* Profile */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative">
                      <img 
                        src={attendant.imageUrl}
                        alt={attendant.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-success/20"
                      />
                      {index < 3 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-success to-info rounded-full flex items-center justify-center text-xs font-bold text-white">
                          ★
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-bold text-primary-light truncate">{attendant.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getRankBadge(index)}
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-4 gap-8 flex-1">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-success">R$ {attendant.totalValue.toFixed(2)}</p>
                      <p className="text-sm text-secondary-light">Faturamento</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-info">{attendant.totalSales}</p>
                      <p className="text-sm text-secondary-light">Vendas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-warning">R$ {attendant.averageTicket.toFixed(2)}</p>
                      <p className="text-sm text-secondary-light">Ticket Médio</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-400">{attendant.completionRate.toFixed(0)}%</p>
                      <p className="text-sm text-secondary-light">Meta</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="w-32">
                    <Progress 
                      value={(attendant.totalValue / maxEarnings) * 100} 
                      className="h-3"
                    />
                    <p className="text-sm text-secondary-light text-center mt-1">
                      {((attendant.totalValue / maxEarnings) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {rankingData.length === 0 && (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <Trophy size={48} className="mx-auto mb-4 text-secondary-light opacity-50" />
              <h3 className="text-lg font-semibold text-primary-light mb-2">Nenhum vendedor encontrado</h3>
              <p className="text-secondary-light">Adicione atendentes para ver o ranking de vendas.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}