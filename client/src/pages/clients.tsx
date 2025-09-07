import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { User, Phone, Mail, MapPin, ShoppingBag, Calendar, Search, Users } from "lucide-react";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";

interface Client {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalSales: number;
  totalValue: number;
  firstPurchase: string;
  lastPurchase: string;
  attendants: string[];
}

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "value" | "sales">("name");

  // Fetch all sales to extract unique clients
  const { data: sales = [] } = useQuery<any[]>({ 
    queryKey: ['/api/sales'] 
  });

  const { data: attendants = [] } = useQuery<any[]>({ 
    queryKey: ['/api/attendants'] 
  });

  // Process sales to get unique clients
  const clients = useMemo(() => {
    const clientMap = new Map<string, Client>();

    sales.forEach(sale => {
      const key = sale.clientPhone || sale.clientName || 'unknown';
      if (!sale.clientName && !sale.clientPhone) return;

      const existing = clientMap.get(key);
      const attendant = attendants.find(a => a.id === sale.attendantId);
      const attendantName = attendant?.name || 'Desconhecido';

      if (existing) {
        existing.totalSales++;
        existing.totalValue += parseFloat(sale.value);
        existing.lastPurchase = sale.createdAt;
        if (!existing.attendants.includes(attendantName)) {
          existing.attendants.push(attendantName);
        }
        // Update with more complete data if available
        if (sale.clientEmail && !existing.email) existing.email = sale.clientEmail;
        if (sale.clientAddress && !existing.address) existing.address = sale.clientAddress;
      } else {
        clientMap.set(key, {
          name: sale.clientName || 'Nome não informado',
          phone: sale.clientPhone || '',
          email: sale.clientEmail || undefined,
          address: sale.clientAddress || undefined,
          totalSales: 1,
          totalValue: parseFloat(sale.value),
          firstPurchase: sale.createdAt,
          lastPurchase: sale.createdAt,
          attendants: [attendantName]
        });
      }
    });

    return Array.from(clientMap.values());
  }, [sales, attendants]);

  // Filter and sort clients
  const filteredClients = useMemo(() => {
    let filtered = clients.filter(client => {
      const search = searchTerm.toLowerCase();
      return client.name.toLowerCase().includes(search) ||
             client.phone.includes(search) ||
             (client.email && client.email.toLowerCase().includes(search));
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "value":
          return b.totalValue - a.totalValue;
        case "sales":
          return b.totalSales - a.totalSales;
        default:
          return 0;
      }
    });

    return filtered;
  }, [clients, searchTerm, sortBy]);

  const totalClients = filteredClients.length;
  const totalRevenue = filteredClients.reduce((sum, client) => sum + client.totalValue, 0);
  const totalSalesCount = filteredClients.reduce((sum, client) => sum + client.totalSales, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-light mb-2">Clientes</h1>
          <p className="text-secondary-light">Gerencie e visualize todos os clientes cadastrados</p>
        </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-600/20 to-blue-700/10 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-light">Total de Clientes</p>
                <p className="text-2xl font-bold text-primary-light">{totalClients}</p>
              </div>
              <Users className="text-blue-500" size={32} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-600/20 to-green-700/10 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-light">Faturamento Total</p>
                <p className="text-2xl font-bold text-primary-light">R$ {totalRevenue.toFixed(2)}</p>
              </div>
              <ShoppingBag className="text-green-500" size={32} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600/20 to-purple-700/10 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-light">Total de Vendas</p>
                <p className="text-2xl font-bold text-primary-light">{totalSalesCount}</p>
              </div>
              <ShoppingBag className="text-purple-500" size={32} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-secondary-dark border-border mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-secondary-light mb-2 block">
                Buscar Cliente
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-light" size={20} />
                <Input
                  id="search"
                  placeholder="Nome, telefone ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input border-border text-primary-light"
                />
              </div>
            </div>

            <div className="w-full md:w-auto">
              <Label htmlFor="sort" className="text-secondary-light mb-2 block">
                Ordenar por
              </Label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-primary-light"
              >
                <option value="name">Nome</option>
                <option value="value">Valor Total</option>
                <option value="sales">Número de Vendas</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client, index) => (
          <Card key={index} className="bg-secondary-dark border-border hover:border-primary/50 transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <User className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-light">{client.name}</h3>
                    <p className="text-sm text-secondary-light">Cliente desde {new Date(client.firstPurchase).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="text-muted-light" size={16} />
                    <span className="text-secondary-light">{client.phone}</span>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="text-muted-light" size={16} />
                    <span className="text-secondary-light">{client.email}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="text-muted-light" size={16} />
                    <span className="text-secondary-light">{client.address}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-accent/10 rounded-lg">
                  <p className="text-xs text-secondary-light mb-1">Total Gasto</p>
                  <p className="text-lg font-bold text-success">R$ {client.totalValue.toFixed(2)}</p>
                </div>
                <div className="text-center p-3 bg-accent/10 rounded-lg">
                  <p className="text-xs text-secondary-light mb-1">Compras</p>
                  <p className="text-lg font-bold text-info">{client.totalSales}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-secondary-light mb-2">Atendido por:</p>
                <div className="flex flex-wrap gap-1">
                  {client.attendants.map((attendant, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs bg-white text-gray-800 border-gray-300">
                      {attendant}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-light">
                  <span>Última compra:</span>
                  <span>{new Date(client.lastPurchase).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card className="bg-secondary-dark border-border">
          <CardContent className="p-12 text-center">
            <Users className="mx-auto text-muted-light mb-4" size={64} />
            <h3 className="text-xl font-semibold text-primary-light mb-2">
              {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </h3>
            <p className="text-secondary-light">
              {searchTerm 
                ? 'Tente buscar com outros termos' 
                : 'Os clientes aparecerão aqui quando fizerem suas primeiras compras'}
            </p>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}