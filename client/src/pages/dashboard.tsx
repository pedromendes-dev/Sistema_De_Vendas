import { useState } from "react";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import { DashboardAdvanced } from "@/components/DashboardAdvanced";
import PageLoader from "@/components/PageLoader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, Calendar, TrendingUp, DollarSign, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Sale, Attendant } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DashboardPage() {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Fetch data
  const { data: sales = [], isLoading: loadingSales } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const { data: attendants = [], isLoading: loadingAttendants } = useQuery<Attendant[]>({
    queryKey: ["/api/attendants"],
  });

  const isLoading = loadingSales || loadingAttendants;

  const handleExportCSV = async (type: 'sales' | 'attendants' | 'report') => {
    setIsExporting(true);
    
    try {
      let data: any[] = [];
      let filename = '';
      
      switch (type) {
        case 'sales':
          data = sales.map(sale => {
            const attendant = attendants.find(a => a.id === sale.attendantId);
            return {
              'Data': format(new Date(sale.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR }),
              'Atendente': attendant?.name || 'Desconhecido',
              'Valor': `R$ ${sale.value}`,
              'Cliente': sale.clientName || '-',
              'Telefone': sale.clientPhone || '-',
              'Email': sale.clientEmail || '-'
            };
          });
          filename = `vendas_${format(new Date(), "yyyy-MM-dd")}.csv`;
          break;
          
        case 'attendants':
          data = attendants.map(att => ({
            'Nome': att.name,
            'Faturamento': `R$ ${att.earnings}`,
            'Vendas': sales.filter(s => s.attendantId === att.id).length,
            'Ticket Médio': `R$ ${(parseFloat(att.earnings) / sales.filter(s => s.attendantId === att.id).length || 0).toFixed(2)}`
          }));
          filename = `atendentes_${format(new Date(), "yyyy-MM-dd")}.csv`;
          break;
          
        case 'report':
          const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.value), 0);
          const totalSales = sales.length;
          const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
          
          data = [{
            'Período': `01/${format(new Date(), "MM/yyyy")} - ${format(new Date(), "dd/MM/yyyy")}`,
            'Total de Vendas': totalSales,
            'Faturamento Total': `R$ ${totalRevenue.toFixed(2)}`,
            'Ticket Médio': `R$ ${averageTicket.toFixed(2)}`,
            'Atendentes Ativos': attendants.length
          }];
          
          // Add daily breakdown
          const dailyData = new Map<string, { count: number; value: number }>();
          sales.forEach(sale => {
            const date = format(new Date(sale.createdAt), "dd/MM/yyyy");
            const current = dailyData.get(date) || { count: 0, value: 0 };
            current.count++;
            current.value += parseFloat(sale.value);
            dailyData.set(date, current);
          });
          
          dailyData.forEach((data, date) => {
            data.push({
              'Data': date,
              'Vendas': data.count,
              'Faturamento': `R$ ${data.value.toFixed(2)}`
            } as any);
          });
          
          filename = `relatorio_${format(new Date(), "yyyy-MM-dd")}.csv`;
          break;
      }
      
      // Convert to CSV
      if (data.length > 0) {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => 
          Object.values(row).map(value => 
            typeof value === 'string' && value.includes(',') ? `"${value}"` : value
          ).join(',')
        );
        const csv = [headers, ...rows].join('\n');
        
        // Download file
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        
        toast({
          title: "Exportação concluída!",
          description: `Arquivo ${filename} baixado com sucesso.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <PageLoader message="Carregando dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary-dark to-secondary-dark/50">
      <Header />
      <Navigation />

      <main className="mobile-safe max-w-7xl py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary-light flex items-center gap-3">
              <TrendingUp className="text-success" size={36} />
              Dashboard de Vendas
            </h1>
            <p className="text-secondary-light mt-1">
              Acompanhe o desempenho da sua equipe em tempo real
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => handleExportCSV('sales')}
              disabled={isExporting}
              className="bg-info text-white hover:bg-info/90"
              size="sm"
            >
              <FileSpreadsheet size={16} className="mr-2" />
              Exportar Vendas
            </Button>
            <Button
              onClick={() => handleExportCSV('attendants')}
              disabled={isExporting}
              className="bg-success text-white hover:bg-success/90"
              size="sm"
            >
              <Download size={16} className="mr-2" />
              Exportar Atendentes
            </Button>
            <Button
              onClick={() => handleExportCSV('report')}
              disabled={isExporting}
              className="bg-warning text-white hover:bg-warning/90"
              size="sm"
            >
              <Calendar size={16} className="mr-2" />
              Relatório Completo
            </Button>
          </div>
        </div>

        {/* Dashboard Component */}
        <DashboardAdvanced />

        {/* Quick Actions */}
        <Card className="mt-6 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => window.location.href = '/'}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Registrar Venda
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => window.location.href = '/goals'}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Gerenciar Metas
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => window.location.href = '/attendants'}
              >
                <Users className="mr-2 h-4 w-4" />
                Cadastrar Atendente
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}