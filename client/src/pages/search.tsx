import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Users, 
  ShoppingCart, 
  Target, 
  Trophy,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  ChevronLeft,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Clock
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface SearchFilters {
  query: string;
  type: 'all' | 'attendants' | 'sales' | 'clients' | 'goals' | 'achievements';
  dateFrom?: string;
  dateTo?: string;
  attendantId?: string;
  minValue?: string;
  maxValue?: string;
}

export default function SearchPage() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: 'all'
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);

  // Get attendants for filter
  const { data: attendants = [] } = useQuery({
    queryKey: ['/api/attendants'],
  });

  const handleSearch = async () => {
    if (!filters.query && filters.type === 'all') {
      toast({
        title: "Digite algo para buscar",
        description: "Por favor, insira um termo de busca",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (filters.query) params.append('q', filters.query);
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.attendantId) params.append('attendantId', filters.attendantId);
      if (filters.minValue) params.append('minValue', filters.minValue);
      if (filters.maxValue) params.append('maxValue', filters.maxValue);

      const response = await apiRequest(`/api/search?${params.toString()}`);
      setSearchResults(response);
      
      if (response.totalResults === 0) {
        toast({
          title: "Nenhum resultado encontrado",
          description: "Tente ajustar os filtros de busca",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na busca",
        description: "Não foi possível realizar a busca",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const exportResults = () => {
    if (!searchResults) return;

    const data = [];
    
    // Add all results to CSV
    if (searchResults.attendants?.length > 0) {
      data.push(['ATENDENTES']);
      data.push(['Nome', 'Ganhos Totais', 'Vendas']);
      searchResults.attendants.forEach((a: any) => {
        data.push([a.name, formatCurrency(a.earnings), a.salesCount || 0]);
      });
      data.push([]);
    }

    if (searchResults.sales?.length > 0) {
      data.push(['VENDAS']);
      data.push(['Data', 'Atendente', 'Valor', 'Cliente', 'Telefone', 'Email', 'Endereço']);
      searchResults.sales.forEach((s: any) => {
        data.push([
          format(new Date(s.createdAt), 'dd/MM/yyyy HH:mm'),
          s.attendant?.name || 'N/A',
          formatCurrency(s.value),
          s.clientName || 'N/A',
          s.clientPhone || 'N/A',
          s.clientEmail || 'N/A',
          s.clientAddress || 'N/A'
        ]);
      });
      data.push([]);
    }

    if (searchResults.goals?.length > 0) {
      data.push(['METAS']);
      data.push(['Título', 'Atendente', 'Alvo', 'Progresso', 'Prazo']);
      searchResults.goals.forEach((g: any) => {
        data.push([
          g.title,
          g.attendant?.name || 'N/A',
          formatCurrency(g.targetValue),
          `${g.progress.toFixed(1)}%`,
          format(new Date(g.deadline), 'dd/MM/yyyy')
        ]);
      });
    }

    // Convert to CSV
    const csv = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `busca_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.csv`;
    link.click();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Busca Avançada</h1>
            <p className="text-muted-foreground mt-1">
              Encontre qualquer informação no sistema
            </p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Busca</CardTitle>
          <CardDescription>
            Configure os filtros para encontrar exatamente o que procura
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Search */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Digite o que deseja buscar..."
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="text-lg"
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={isSearching}
              size="lg"
            >
              {isSearching ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Buscar
            </Button>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Busca</label>
              <Select
                value={filters.type}
                onValueChange={(value: any) => setFilters({ ...filters, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="attendants">Atendentes</SelectItem>
                  <SelectItem value="sales">Vendas</SelectItem>
                  <SelectItem value="clients">Clientes</SelectItem>
                  <SelectItem value="goals">Metas</SelectItem>
                  <SelectItem value="achievements">Conquistas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">Data Inicial</label>
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Data Final</label>
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>

            {/* Attendant Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Atendente</label>
              <Select
                value={filters.attendantId || ''}
                onValueChange={(value) => setFilters({ ...filters, attendantId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {attendants.map((attendant: any) => (
                    <SelectItem key={attendant.id} value={attendant.id.toString()}>
                      {attendant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Value Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">Valor Mínimo</label>
              <Input
                type="number"
                placeholder="0.00"
                value={filters.minValue || ''}
                onChange={(e) => setFilters({ ...filters, minValue: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Valor Máximo</label>
              <Input
                type="number"
                placeholder="999999.99"
                value={filters.maxValue || ''}
                onChange={(e) => setFilters({ ...filters, maxValue: e.target.value })}
              />
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setFilters({ query: '', type: 'all' });
                setSearchResults(null);
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Resultados da Busca</CardTitle>
              <CardDescription>
                {searchResults.totalResults} resultado{searchResults.totalResults !== 1 ? 's' : ''} encontrado{searchResults.totalResults !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            {searchResults.totalResults > 0 && (
              <Button onClick={exportResults} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="grid grid-cols-5 w-full mb-6">
                <TabsTrigger value="all">
                  Todos ({searchResults.totalResults})
                </TabsTrigger>
                <TabsTrigger value="attendants">
                  Atendentes ({searchResults.attendants?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="sales">
                  Vendas ({searchResults.sales?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="goals">
                  Metas ({searchResults.goals?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="achievements">
                  Conquistas ({searchResults.achievements?.length || 0})
                </TabsTrigger>
              </TabsList>

              {/* All Results */}
              <TabsContent value="all" className="space-y-6">
                {/* Attendants */}
                {searchResults.attendants?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Atendentes
                    </h3>
                    <div className="grid gap-3">
                      {searchResults.attendants.slice(0, 5).map((attendant: any) => (
                        <Card key={attendant.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{attendant.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatCurrency(attendant.earnings)} em ganhos • {attendant.salesCount || 0} vendas
                                </p>
                              </div>
                              <Link href={`/ranking`}>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sales */}
                {searchResults.sales?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Vendas
                    </h3>
                    <div className="grid gap-3">
                      {searchResults.sales.slice(0, 5).map((sale: any) => (
                        <Card key={sale.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <p className="font-medium">{formatCurrency(sale.value)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {sale.attendant?.name || 'N/A'} • {format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm')}
                                </p>
                                {sale.clientName && (
                                  <p className="text-sm">
                                    Cliente: {sale.clientName}
                                    {sale.clientPhone && ` • ${sale.clientPhone}`}
                                  </p>
                                )}
                              </div>
                              <Link href="/sales">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Goals */}
                {searchResults.goals?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Metas
                    </h3>
                    <div className="grid gap-3">
                      {searchResults.goals.slice(0, 5).map((goal: any) => (
                        <Card key={goal.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{goal.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {goal.attendant?.name || 'N/A'} • {goal.progress.toFixed(1)}% concluído
                                </p>
                              </div>
                              <Link href="/goals">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Attendants Tab */}
              <TabsContent value="attendants">
                {searchResults.attendants?.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.attendants.map((attendant: any) => (
                      <Card key={attendant.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {attendant.imageUrl && (
                                <img
                                  src={attendant.imageUrl}
                                  alt={attendant.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              )}
                              <div>
                                <p className="font-medium text-lg">{attendant.name}</p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    {formatCurrency(attendant.earnings)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <ShoppingCart className="h-3 w-3" />
                                    {attendant.salesCount || 0} vendas
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Link href={`/ranking`}>
                              <Button variant="outline">
                                Ver Detalhes
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum atendente encontrado
                  </p>
                )}
              </TabsContent>

              {/* Sales Tab */}
              <TabsContent value="sales">
                {searchResults.sales?.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.sales.map((sale: any) => (
                      <Card key={sale.id}>
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-2xl font-bold">{formatCurrency(sale.value)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(sale.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                </p>
                              </div>
                              <Badge>{sale.attendant?.name || 'N/A'}</Badge>
                            </div>
                            
                            {/* Client Info */}
                            {(sale.clientName || sale.clientPhone || sale.clientEmail || sale.clientAddress) && (
                              <div className="pt-3 border-t space-y-2">
                                <p className="text-sm font-medium">Informações do Cliente:</p>
                                {sale.clientName && (
                                  <p className="text-sm flex items-center gap-2">
                                    <Users className="h-3 w-3" />
                                    {sale.clientName}
                                  </p>
                                )}
                                {sale.clientPhone && (
                                  <p className="text-sm flex items-center gap-2">
                                    <Phone className="h-3 w-3" />
                                    {sale.clientPhone}
                                  </p>
                                )}
                                {sale.clientEmail && (
                                  <p className="text-sm flex items-center gap-2">
                                    <Mail className="h-3 w-3" />
                                    {sale.clientEmail}
                                  </p>
                                )}
                                {sale.clientAddress && (
                                  <p className="text-sm flex items-center gap-2">
                                    <MapPin className="h-3 w-3" />
                                    {sale.clientAddress}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma venda encontrada
                  </p>
                )}
              </TabsContent>

              {/* Goals Tab */}
              <TabsContent value="goals">
                {searchResults.goals?.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.goals.map((goal: any) => (
                      <Card key={goal.id}>
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-lg">{goal.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {goal.attendant?.name || 'N/A'}
                                </p>
                              </div>
                              <Badge variant={goal.progress >= 100 ? 'default' : 'outline'}>
                                {goal.progress.toFixed(1)}%
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progresso</span>
                                <span>{formatCurrency(goal.currentValue)} / {formatCurrency(goal.targetValue)}</span>
                              </div>
                              <div className="w-full bg-secondary rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${Math.min(goal.progress, 100)}%` }}
                                />
                              </div>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Prazo: {format(new Date(goal.deadline), 'dd/MM/yyyy')}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma meta encontrada
                  </p>
                )}
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements">
                {searchResults.achievements?.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.achievements.map((achievement: any) => (
                      <Card key={achievement.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Trophy className="h-8 w-8 text-yellow-500" />
                              <div>
                                <p className="font-medium">{achievement.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {achievement.attendant?.name || 'N/A'} • {achievement.points} pontos
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(achievement.unlockedAt), 'dd/MM/yyyy')}
                                </p>
                              </div>
                            </div>
                            <Badge style={{ backgroundColor: achievement.badgeColor, color: 'white' }}>
                              {achievement.category}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma conquista encontrada
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}