import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { History, TrendingUp, BarChart3, DollarSign, Calendar, Filter, Plus, User, Phone, Mail, MapPin, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import type { Attendant, Sale } from "@shared/schema";

export default function HistoryPage() {
  const [selectedAttendant, setSelectedAttendant] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Delete sale mutation
  const deleteSaleMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/sales/${id}`, { method: "DELETE" });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Venda removida!",
        description: "A venda foi removida com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendants"] });
    },
    onError: () => {
      toast({
        title: "Erro ao remover venda",
        description: "Ocorreu um erro ao remover a venda.",
        variant: "destructive",
      });
    },
  });

  // Handle view details
  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailsModalOpen(true);
  };

  // Handle delete sale
  const handleDeleteSale = (id: number) => {
    if (window.confirm("Tem certeza que deseja remover esta venda?")) {
      deleteSaleMutation.mutate(id);
    }
  };

  // Format detailed date
  const formatDetailedDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <Header />
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <Card className="bg-card border-border p-8">
            <CardContent className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="text-secondary-light">Carregando histórico de vendas...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      <Header />
      <Navigation />

      <main className="mobile-safe max-w-6xl py-4 sm:py-6 lg:py-8">
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
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                        <DollarSign className="text-success" size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-primary-light">
                          {sale.clientName || 'Cliente não informado'}
                        </p>
                        <p className="text-sm text-secondary-light">
                          Atendente: {getAttendantName(sale.attendantId)}
                        </p>
                        {sale.clientPhone && (
                          <p className="text-xs text-muted-light">
                            📱 {sale.clientPhone}
                          </p>
                        )}
                        {sale.clientEmail && (
                          <p className="text-xs text-muted-light">
                            ✉️ {sale.clientEmail}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-center px-4">
                      <p className="text-lg font-bold text-success">
                        R$ {parseFloat(sale.value).toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-sm text-muted-light">
                        {formatDate(sale.createdAt)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-border text-secondary-light hover:text-primary-light hover:border-info"
                        onClick={() => handleViewDetails(sale)}
                      >
                        <Eye size={14} className="mr-1" />
                        Ver Detalhes
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-danger text-danger hover:bg-danger hover:text-primary-light"
                        onClick={() => handleDeleteSale(sale.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Sale Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="bg-card border-border text-primary-light max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary-light flex items-center gap-2">
              <Eye className="text-info" size={24} />
              Detalhes da Venda
            </DialogTitle>
          </DialogHeader>
          
          {selectedSale && (
            <div className="space-y-6">
              {/* Sale Information */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-secondary-dark border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="text-success" size={20} />
                      <h3 className="font-semibold text-primary-light">Valor da Venda</h3>
                    </div>
                    <p className="text-2xl font-bold text-success">
                      R$ {parseFloat(selectedSale.value).toFixed(2).replace('.', ',')}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-secondary-dark border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="text-info" size={20} />
                      <h3 className="font-semibold text-primary-light">Data e Hora</h3>
                    </div>
                    <p className="text-sm text-secondary-light">
                      {formatDetailedDate(selectedSale.createdAt)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Attendant Information */}
              <Card className="bg-secondary-dark border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="text-warning" size={20} />
                    <h3 className="font-semibold text-primary-light">Informações do Atendente</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center">
                      <User className="text-warning" size={24} />
                    </div>
                    <div>
                      <p className="font-medium text-primary-light">
                        {getAttendantName(selectedSale.attendantId)}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        ID: {selectedSale.attendantId}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Client Information */}
              {(selectedSale.clientName || selectedSale.clientPhone || selectedSale.clientEmail) && (
                <Card className="bg-secondary-dark border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="text-info" size={20} />
                      <h3 className="font-semibold text-primary-light">Informações do Cliente</h3>
                    </div>
                    <div className="space-y-3">
                      {selectedSale.clientName && (
                        <div className="flex items-center gap-2">
                          <User className="text-secondary-light" size={16} />
                          <span className="text-sm text-secondary-light">Nome:</span>
                          <span className="text-primary-light">{selectedSale.clientName}</span>
                        </div>
                      )}
                      {selectedSale.clientPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="text-secondary-light" size={16} />
                          <span className="text-sm text-secondary-light">Telefone:</span>
                          <span className="text-primary-light">{selectedSale.clientPhone}</span>
                        </div>
                      )}
                      {selectedSale.clientEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="text-secondary-light" size={16} />
                          <span className="text-sm text-secondary-light">Email:</span>
                          <span className="text-primary-light">{selectedSale.clientEmail}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sale ID */}
              <Card className="bg-secondary-dark border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-secondary-light">ID da Venda</p>
                      <p className="text-lg font-mono text-primary-light">#{selectedSale.id}</p>
                    </div>
                    <Badge variant="outline" className="bg-white text-green-700 border border-green-300">
                      Venda Concluída
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="flex-1 border-border text-secondary-light hover:text-primary-light"
                >
                  Fechar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDeleteSale(selectedSale.id)}
                  className="border-danger text-danger hover:bg-danger hover:text-primary-light"
                >
                  <Trash2 size={16} className="mr-2" />
                  Remover Venda
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}