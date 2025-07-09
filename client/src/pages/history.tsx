import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, TrendingUp, BarChart3, DollarSign, Calendar, Filter, Plus } from "lucide-react";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import DemoWarning from "@/components/DemoWarning";
import type { Attendant, Sale } from "@shared/schema";

export default function HistoryPage() {
  const [selectedAttendant, setSelectedAttendant] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState("");

  // Fetch data
  const { data: attendants, isLoading: loadingAttendants } = useQuery<Attendant[]>({
    queryKey: ["/api/attendants"],
  });

  const { data: sales, isLoading: loadingSales } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const isLoading = loadingAttendants || loadingSales;

  // Calculate summary statistics
  const totalSales = sales?.length || 0;
  const totalValue = sales?.reduce((sum, sale) => sum + parseFloat(sale.value), 0) || 0;
  const averageTicket = totalSales > 0 ? totalValue / totalSales : 0;

  // Filter sales based on selected filters
  const filteredSales = sales?.filter(sale => {
    if (selectedAttendant !== "all" && sale.attendantId !== parseInt(selectedAttendant)) {
      return false;
    }
    // Additional filters can be added here
    return true;
  }) || [];

  // Get attendant name by ID
  const getAttendantName = (attendantId: number) => {
    return attendants?.find(a => a.id === attendantId)?.name || "Desconhecido";
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
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

      <main className="max-w-6xl mx-auto px-4 py-8">
        <DemoWarning />

        {/* History Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <History className="text-info" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-primary-light">Histórico de Vendas</h2>
              <p className="text-secondary-light">Acompanhe todas as vendas realizadas pela equipe</p>
            </div>
          </div>
          <Button className="bg-success text-primary-light hover:bg-success-dark">
            <Plus size={18} className="mr-2" />
            Exportar Dados
          </Button>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-success/10 border-success/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-success" size={24} />
                <div>
                  <p className="text-2xl font-bold text-success">R$ {totalValue.toFixed(2)}</p>
                  <p className="text-sm text-secondary-light">Total Vendido</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-info/10 border-info/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="text-info" size={24} />
                <div>
                  <p className="text-2xl font-bold text-info">{totalSales}</p>
                  <p className="text-sm text-secondary-light">Vendas Realizadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-warning/10 border-warning/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <DollarSign className="text-warning" size={24} />
                <div>
                  <p className="text-2xl font-bold text-warning">R$ {averageTicket.toFixed(2)}</p>
                  <p className="text-sm text-secondary-light">Ticket Médio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="text-secondary-light" size={20} />
              <h3 className="text-lg font-semibold text-primary-light">Filtros de Pesquisa</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-light mb-2 block">
                  Filtrar por Atendente
                </label>
                <Select value={selectedAttendant} onValueChange={setSelectedAttendant}>
                  <SelectTrigger className="bg-input border-border text-primary-light">
                    <SelectValue placeholder="Todos os atendentes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os atendentes</SelectItem>
                    {attendants?.map(attendant => (
                      <SelectItem key={attendant.id} value={attendant.id.toString()}>
                        {attendant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-secondary-light mb-2 block">
                  Filtrar por Mês
                </label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="bg-input border-border text-primary-light">
                    <SelectValue placeholder="Todos os meses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os meses</SelectItem>
                    <SelectItem value="01">Janeiro</SelectItem>
                    <SelectItem value="02">Fevereiro</SelectItem>
                    <SelectItem value="03">Março</SelectItem>
                    <SelectItem value="04">Abril</SelectItem>
                    <SelectItem value="05">Maio</SelectItem>
                    <SelectItem value="06">Junho</SelectItem>
                    <SelectItem value="07">Julho</SelectItem>
                    <SelectItem value="08">Agosto</SelectItem>
                    <SelectItem value="09">Setembro</SelectItem>
                    <SelectItem value="10">Outubro</SelectItem>
                    <SelectItem value="11">Novembro</SelectItem>
                    <SelectItem value="12">Dezembro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-secondary-light mb-2 block">
                  Buscar Cliente
                </label>
                <Input
                  placeholder="Nome do cliente..."
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  className="bg-input border-border text-primary-light placeholder:text-muted-light"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales History List */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-primary-light mb-4">Histórico de Vendas</h3>
            
            <div className="space-y-3">
              {filteredSales.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="text-muted-light mx-auto mb-3" size={48} />
                  <p className="text-secondary-light">Nenhuma venda encontrada</p>
                  <p className="text-muted-light text-sm">Ajuste os filtros ou registre novas vendas</p>
                </div>
              ) : (
                filteredSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-4 bg-secondary-dark rounded-lg border border-border hover:border-success/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                        <DollarSign className="text-success" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-primary-light">
                          {getAttendantName(sale.attendantId)}
                        </p>
                        <p className="text-sm text-secondary-light">
                          Atendente: {getAttendantName(sale.attendantId)}
                        </p>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-lg font-bold text-success">
                        R$ {parseFloat(sale.value).toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-sm text-muted-light">
                        {formatDate(sale.createdAt)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="border-border text-secondary-light hover:text-primary-light">
                        Ver Detalhes
                      </Button>
                      <Button variant="outline" size="sm" className="border-danger text-danger hover:bg-danger hover:text-primary-light">
                        Remover
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}