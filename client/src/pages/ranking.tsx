import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Crown, Medal, Award } from "lucide-react";
import Header from "@/components/Header";
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
    
    // Calculate this month's sales (simplified - all sales for demo)
    const thisMonthSales = attendantSales.length;
    const thisMonthValue = totalValue;
    
    return {
      ...attendant,
      totalSales,
      totalValue,
      averageTicket,
      thisMonthSales,
      thisMonthValue,
      completionRate: Math.min((totalValue / 100) * 100, 100), // Simplified completion rate
    };
  }).sort((a, b) => b.totalValue - a.totalValue) || [];

  const maxEarnings = rankingData.length > 0 ? rankingData[0].totalValue : 1;

  const getRankIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Crown className="text-gold" size={20} />;
      case 1:
        return <Medal className="text-silver" size={20} />;
      case 2:
        return <Award className="text-bronze" size={20} />;
      default:
        return <Trophy className="text-muted-light" size={20} />;
    }
  };

  const getRankBgColor = (position: number) => {
    switch (position) {
      case 0:
        return "bg-gold/20 border-gold/30";
      case 1:
        return "bg-silver/20 border-silver/30";
      case 2:
        return "bg-bronze/20 border-bronze/30";
      default:
        return "bg-secondary-dark border-border";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center">
        <div className="text-lg text-secondary-light">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      <Header />
      <Navigation />

      <main className="mobile-safe max-w-6xl py-4 sm:py-6 lg:py-8">
        {/* Ranking Header */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Trophy className="text-gold" size={24} />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-2xl font-bold text-primary-light">Ranking de Vendas</h2>
            <p className="text-xs sm:text-sm text-secondary-light">Classificação dos melhores vendedores do mês</p>
          </div>
        </div>

        {/* Ranking Cards */}
        <div className="space-y-3 sm:space-y-4">
          {rankingData.map((attendant, index) => (
            <Card key={attendant.id} className={`${getRankBgColor(index)} border-2`}>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                {/* Mobile Layout */}
                <div className="block sm:hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getRankIcon(index)}
                      <span className="text-base font-bold text-primary-light">
                        {index + 1}º
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-success">
                        R$ {attendant.totalValue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <img 
                      src={attendant.imageUrl}
                      alt={attendant.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-border flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-primary-light truncate">{attendant.name}</h3>
                      <p className="text-xs text-secondary-light">Total de Vendas</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <p className="text-sm font-bold text-info">{attendant.totalSales}</p>
                      <p className="text-xs text-secondary-light">Vendas</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-warning">R$ {attendant.averageTicket.toFixed(2)}</p>
                      <p className="text-xs text-secondary-light">Ticket Médio</p>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex sm:items-center sm:gap-4">
                  {/* Rank Icon */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    {getRankIcon(index)}
                    <span className="text-lg font-bold text-primary-light mt-1">
                      {index + 1}º
                    </span>
                  </div>

                  {/* Attendant Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <img 
                      src={attendant.imageUrl}
                      alt={attendant.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-border flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-bold text-primary-light truncate">{attendant.name}</h3>
                      <p className="text-secondary-light">Total de Vendas</p>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="hidden lg:grid lg:grid-cols-4 lg:gap-8 lg:flex-1">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-success">R$ {attendant.totalValue.toFixed(2)}</p>
                      <p className="text-sm text-secondary-light">Faturamento Total</p>
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
                      <p className="text-2xl font-bold text-secondary-light">{attendant.completionRate.toFixed(0)}%</p>
                      <p className="text-sm text-secondary-light">Meta Mensal</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="hidden lg:block lg:w-32">
                    <Progress 
                      value={(attendant.totalValue / maxEarnings) * 100} 
                      className="h-3"
                    />
                    <p className="text-sm text-secondary-light text-center mt-1">
                      {((attendant.totalValue / maxEarnings) * 100).toFixed(0)}%
                    </p>
                  </div>

                  {/* Earnings Badge */}
                  <div className="text-right lg:hidden">
                    <div className="text-2xl font-bold text-success">
                      R$ {attendant.totalValue.toFixed(2)}
                    </div>
                    <div className="text-sm text-secondary-light">
                      Faturamento Total
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