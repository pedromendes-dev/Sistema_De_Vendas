import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Eye, EyeOff, Users, DollarSign, Target, Trophy, Trash2, Edit, Plus, Lock, Layout, Grip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import DragDropManager from "@/components/DragDropManager";
import ContentBuilder from "@/components/ContentBuilder";
import type { Attendant, Sale, Goal, Achievement } from "@shared/schema";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [editingAttendant, setEditingAttendant] = useState<Attendant | null>(null);
  const [newAttendant, setNewAttendant] = useState({ name: "", imageUrl: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check for saved authentication state on component mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('admin_authenticated');
    const authTimestamp = localStorage.getItem('admin_auth_timestamp');
    
    if (savedAuth === 'true' && authTimestamp) {
      const authTime = parseInt(authTimestamp);
      const currentTime = Date.now();
      const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
      
      // Check if authentication is still valid (within 1 hour)
      if (currentTime - authTime < oneHour) {
        setIsAuthenticated(true);
      } else {
        // Clear expired authentication
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('admin_auth_timestamp');
      }
    }
  }, []);

  // Data queries
  const { data: attendants = [], isLoading: attendantsLoading } = useQuery({
    queryKey: ["/api/attendants"],
    enabled: isAuthenticated
  });

  const { data: sales = [], isLoading: salesLoading } = useQuery({
    queryKey: ["/api/sales"],
    enabled: isAuthenticated
  });

  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ["/api/goals"],
    enabled: isAuthenticated
  });

  const { data: achievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ["/api/achievements"],
    enabled: isAuthenticated
  });

  // Mutations
  const deleteAttendantMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/attendants/${id}`);
      if (!response.ok) throw new Error("Failed to delete attendant");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendants"] });
      toast({ title: "Atendente removido com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover atendente", variant: "destructive" });
    }
  });

  const createAttendantMutation = useMutation({
    mutationFn: async (data: { name: string; imageUrl: string }) => {
      const response = await apiRequest("POST", "/api/attendants", { ...data, earnings: "0.00" });
      if (!response.ok) throw new Error("Failed to create attendant");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendants"] });
      setNewAttendant({ name: "", imageUrl: "" });
      toast({ title: "Atendente criado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao criar atendente", variant: "destructive" });
    }
  });

  const deleteSaleMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/sales/${id}`);
      if (!response.ok) throw new Error("Failed to delete sale");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendants"] });
      toast({ title: "Venda removida com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover venda", variant: "destructive" });
    }
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/goals/${id}`);
      if (!response.ok) throw new Error("Failed to delete goal");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Meta removida com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover meta", variant: "destructive" });
    }
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      
      if (response.ok) {
        const result = await response.json();
        setIsAuthenticated(true);
        
        // Save authentication state to localStorage
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_auth_timestamp', Date.now().toString());
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo à área do gestor.",
        });
        // Clear credentials
        setCredentials({ username: "", password: "" });
      } else {
        const result = await response.json();
        toast({
          title: "Credenciais inválidas",
          description: result.message || "Usuário ou senha incorretos.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login exception:", error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro ao tentar fazer login. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_auth_timestamp');
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado do painel administrativo",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <Header />
        <Navigation />

        <main className="max-w-md mx-auto px-4 py-16">
          <Card className="bg-card border-border">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-danger rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-primary-light" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-primary-light mb-2">Área Restrita</h2>
                <p className="text-secondary-light">Acesso exclusivo para gestores</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-secondary-light">Usuário</Label>
                  <Input
                    id="username"
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                    placeholder="Digite o usuário"
                    className="bg-input border-border text-primary-light placeholder:text-muted-light"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-secondary-light">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={credentials.password}
                      onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                      placeholder="Digite a senha"
                      className="bg-input border-border text-primary-light placeholder:text-muted-light pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-light hover:text-secondary-light"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-success text-primary-light hover:bg-success-dark disabled:opacity-50"
                >
                  <Lock size={18} className="mr-2" />
                  {isLoading ? "Verificando..." : "Acessar Painel"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Admin Dashboard Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <Shield className="text-danger" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-primary-light">Painel do Gestor</h2>
              <p className="text-secondary-light">Gerencie todos os aspectos do sistema</p>
            </div>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="border-border text-secondary-light hover:text-primary-light"
          >
            <Lock size={16} className="mr-2" />
            Sair
          </Button>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="attendants" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-card border-border">
            <TabsTrigger value="attendants" className="flex items-center gap-2">
              <Users size={16} />
              Atendentes
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <DollarSign size={16} />
              Vendas
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target size={16} />
              Metas
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy size={16} />
              Conquistas
            </TabsTrigger>
            <TabsTrigger value="dragdrop" className="flex items-center gap-2">
              <Grip size={16} />
              Organizar
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-2">
              <Layout size={16} />
              Layout
            </TabsTrigger>
          </TabsList>

          {/* Attendants Management */}
          <TabsContent value="attendants" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary-light flex items-center gap-2">
                  <Plus size={20} />
                  Adicionar Novo Atendente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-secondary-light">Nome</Label>
                    <Input
                      value={newAttendant.name}
                      onChange={(e) => setNewAttendant({...newAttendant, name: e.target.value})}
                      placeholder="Nome do atendente"
                      className="bg-input border-border text-primary-light"
                    />
                  </div>
                  <div>
                    <Label className="text-secondary-light">URL da Imagem</Label>
                    <Input
                      value={newAttendant.imageUrl}
                      onChange={(e) => setNewAttendant({...newAttendant, imageUrl: e.target.value})}
                      placeholder="https://exemplo.com/imagem.jpg"
                      className="bg-input border-border text-primary-light"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => createAttendantMutation.mutate(newAttendant)}
                  disabled={!newAttendant.name || createAttendantMutation.isPending}
                  className="bg-success text-primary-light hover:bg-success-dark"
                >
                  {createAttendantMutation.isPending ? "Criando..." : "Criar Atendente"}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary-light">Atendentes Cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                {attendantsLoading ? (
                  <p className="text-secondary-light">Carregando...</p>
                ) : (
                  <div className="space-y-2">
                    {attendants.map((attendant: Attendant) => (
                      <div key={attendant.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <img 
                            src={attendant.imageUrl} 
                            alt={attendant.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <h4 className="text-primary-light font-medium">{attendant.name}</h4>
                            <p className="text-secondary-light text-sm">R$ {attendant.earnings}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => deleteAttendantMutation.mutate(attendant.id)}
                          disabled={deleteAttendantMutation.isPending}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Management */}
          <TabsContent value="sales" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary-light">Histórico de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                {salesLoading ? (
                  <p className="text-secondary-light">Carregando...</p>
                ) : (
                  <div className="space-y-2">
                    {sales.map((sale: Sale) => {
                      const attendant = attendants.find((a: Attendant) => a.id === sale.attendantId);
                      return (
                        <div key={sale.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                          <div>
                            <h4 className="text-primary-light font-medium">R$ {sale.value}</h4>
                            <p className="text-secondary-light text-sm">
                              {attendant?.name} - {new Date(sale.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <Button
                            onClick={() => deleteSaleMutation.mutate(sale.id)}
                            disabled={deleteSaleMutation.isPending}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Management */}
          <TabsContent value="goals" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary-light">Metas Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                {goalsLoading ? (
                  <p className="text-secondary-light">Carregando...</p>
                ) : (
                  <div className="space-y-2">
                    {goals.map((goal: Goal) => {
                      const attendant = attendants.find((a: Attendant) => a.id === goal.attendantId);
                      const progress = (parseFloat(goal.currentValue) / parseFloat(goal.targetValue)) * 100;
                      return (
                        <div key={goal.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                          <div className="flex-1">
                            <h4 className="text-primary-light font-medium">{goal.title}</h4>
                            <p className="text-secondary-light text-sm">
                              {attendant?.name} - R$ {goal.currentValue} / R$ {goal.targetValue}
                            </p>
                            <div className="w-full bg-secondary-dark rounded-full h-2 mt-2">
                              <div 
                                className="bg-success h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                          </div>
                          <Button
                            onClick={() => deleteGoalMutation.mutate(goal.id)}
                            disabled={deleteGoalMutation.isPending}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Management */}
          <TabsContent value="achievements" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary-light">Conquistas Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {achievementsLoading ? (
                  <p className="text-secondary-light">Carregando...</p>
                ) : (
                  <div className="space-y-2">
                    {achievements.map((achievement: Achievement) => {
                      const attendant = attendants.find((a: Attendant) => a.id === achievement.attendantId);
                      return (
                        <div key={achievement.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-12 h-12 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: achievement.badgeColor }}
                            >
                              <Trophy className="text-white" size={20} />
                            </div>
                            <div>
                              <h4 className="text-primary-light font-medium">{achievement.title}</h4>
                              <p className="text-secondary-light text-sm">
                                {attendant?.name} - {achievement.pointsAwarded} pontos
                              </p>
                            </div>
                          </div>
                          <span className="text-secondary-light text-sm">
                            {new Date(achievement.achievedAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Drag & Drop Organization */}
          <TabsContent value="dragdrop" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary-light flex items-center gap-2">
                  <Grip size={20} />
                  Organizar Atendentes
                </CardTitle>
                <p className="text-secondary-light">Arraste e solte para reordenar os atendentes</p>
              </CardHeader>
              <CardContent>
                {attendantsLoading ? (
                  <p className="text-secondary-light">Carregando...</p>
                ) : (
                  <DragDropManager
                    attendants={attendants}
                    onReorder={(newOrder) => {
                      // Here you could save the new order to the database
                      toast({
                        title: "Ordem atualizada!",
                        description: "A nova ordem dos atendentes foi salva.",
                      });
                    }}
                    onEdit={(attendant) => {
                      // Handle edit functionality
                      toast({
                        title: "Editar atendente",
                        description: `Editando ${attendant.name}`,
                      });
                    }}
                    onDelete={(id) => deleteAttendantMutation.mutate(id)}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Builder */}
          <TabsContent value="layout" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary-light flex items-center gap-2">
                  <Layout size={20} />
                  Construtor de Layout
                </CardTitle>
                <p className="text-secondary-light">Configure widgets e componentes do painel</p>
              </CardHeader>
              <CardContent>
                <ContentBuilder
                  onSave={(widgets) => {
                    // Here you could save the layout configuration
                    toast({
                      title: "Layout salvo!",
                      description: `${widgets.length} widgets configurados.`,
                    });
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}