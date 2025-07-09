import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Eye, EyeOff, Users, DollarSign, Target, Trophy, Trash2, Edit, Plus, Lock, Layout, Grip, UserPlus, UserX, UserCheck, Search, Filter, Grid, List, BarChart3, Calendar, TrendingUp, Award, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ModernHeader from "@/components/ModernHeader";
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
  const [newAdmin, setNewAdmin] = useState({ username: "", password: "", email: "", role: "admin" });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAttendantData, setEditAttendantData] = useState({ name: "", imageUrl: "" });
  const [attendantViewMode, setAttendantViewMode] = useState<'cards' | 'table' | 'detailed'>('cards');
  const [attendantSearchQuery, setAttendantSearchQuery] = useState('');
  const [attendantSortBy, setAttendantSortBy] = useState<'name' | 'earnings' | 'createdAt'>('name');
  const [attendantSortOrder, setAttendantSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedAttendant, setSelectedAttendant] = useState<Attendant | null>(null);
  const [showAttendantDetails, setShowAttendantDetails] = useState(false);
  
  // Goal management states
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState({
    attendantId: "",
    title: "",
    description: "",
    targetValue: "",
    type: "sales"
  });
  
  // Achievement management states
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [newAchievement, setNewAchievement] = useState({
    attendantId: "",
    title: "",
    description: "",
    pointsAwarded: "",
    badgeColor: "#10B981"
  });
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

  const { data: admins = [], isLoading: adminsLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated
  });

  // Handle edit attendant
  const handleEditAttendant = (attendant: Attendant) => {
    setEditingAttendant(attendant);
    setEditAttendantData({ name: attendant.name, imageUrl: attendant.imageUrl });
    setShowEditModal(true);
  };

  // Filter and sort attendants
  const filteredAndSortedAttendants = attendants
    .filter((attendant: Attendant) => 
      attendant.name.toLowerCase().includes(attendantSearchQuery.toLowerCase())
    )
    .sort((a: Attendant, b: Attendant) => {
      let comparison = 0;
      switch (attendantSortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'earnings':
          comparison = parseFloat(a.earnings) - parseFloat(b.earnings);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return attendantSortOrder === 'asc' ? comparison : -comparison;
    });

  // Get attendant statistics
  const getAttendantStats = (attendant: Attendant) => {
    const attendantSales = sales.filter((sale: Sale) => sale.attendantId === attendant.id);
    const attendantGoals = goals.filter((goal: Goal) => goal.attendantId === attendant.id);
    const attendantAchievements = achievements.filter((achievement: Achievement) => achievement.attendantId === attendant.id);
    
    return {
      totalSales: attendantSales.length,
      averageSale: attendantSales.length > 0 ? 
        attendantSales.reduce((sum, sale) => sum + parseFloat(sale.value), 0) / attendantSales.length : 0,
      activeGoals: attendantGoals.filter(goal => goal.isActive).length,
      completedGoals: attendantGoals.filter(goal => !goal.isActive).length,
      totalAchievements: attendantAchievements.length,
      totalPoints: attendantAchievements.reduce((sum, achievement) => sum + achievement.pointsAwarded, 0),
      lastSaleDate: attendantSales.length > 0 ? 
        Math.max(...attendantSales.map(sale => new Date(sale.createdAt).getTime())) : null
    };
  };

  // Handle attendant detail view
  const handleViewAttendantDetails = (attendant: Attendant) => {
    setSelectedAttendant(attendant);
    setShowAttendantDetails(true);
  };

  // Goal management handlers
  const handleCreateGoal = () => {
    setEditingGoal(null);
    setNewGoal({
      attendantId: "",
      title: "",
      description: "",
      targetValue: "",
      type: "sales"
    });
    setShowGoalModal(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setNewGoal({
      attendantId: goal.attendantId.toString(),
      title: goal.title,
      description: goal.description || "",
      targetValue: goal.targetValue,
      type: goal.type
    });
    setShowGoalModal(true);
  };

  // Achievement management handlers
  const handleCreateAchievement = () => {
    setEditingAchievement(null);
    setNewAchievement({
      attendantId: "",
      title: "",
      description: "",
      pointsAwarded: "",
      badgeColor: "#10B981"
    });
    setShowAchievementModal(true);
  };

  const handleEditAchievement = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setNewAchievement({
      attendantId: achievement.attendantId.toString(),
      title: achievement.title,
      description: achievement.description || "",
      pointsAwarded: achievement.pointsAwarded.toString(),
      badgeColor: achievement.badgeColor
    });
    setShowAchievementModal(true);
  };

  const handleUpdateAttendant = () => {
    if (editingAttendant) {
      updateAttendantMutation.mutate({ 
        id: editingAttendant.id, 
        data: editAttendantData 
      });
    }
  };

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

  const updateAttendantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; imageUrl: string } }) => {
      const response = await apiRequest("PUT", `/api/attendants/${id}`, data);
      if (!response.ok) throw new Error("Failed to update attendant");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendants"] });
      setShowEditModal(false);
      setEditingAttendant(null);
      setEditAttendantData({ name: "", imageUrl: "" });
      toast({ title: "Atendente atualizado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar atendente", variant: "destructive" });
    }
  });

  const createAdminMutation = useMutation({
    mutationFn: async (data: { username: string; password: string; email: string; role: string }) => {
      const currentUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
      const response = await apiRequest("POST", "/api/admin/users", { ...data, createdBy: currentUser.id });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create admin");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setNewAdmin({ username: "", password: "", email: "", role: "admin" });
      toast({ title: "Administrador criado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    }
  });

  const deleteAdminMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${id}`);
      if (!response.ok) throw new Error("Failed to delete admin");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Administrador removido com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover administrador", variant: "destructive" });
    }
  });

  const toggleAdminStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const endpoint = isActive ? "activate" : "deactivate";
      const response = await apiRequest("PUT", `/api/admin/users/${id}/${endpoint}`);
      if (!response.ok) throw new Error("Failed to update admin status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Status do administrador atualizado!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
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

  // Goal mutations
  const createGoalMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/goals", {
        ...data,
        attendantId: parseInt(data.attendantId),
        currentValue: "0.00"
      });
      if (!response.ok) throw new Error("Failed to create goal");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setShowGoalModal(false);
      setNewGoal({ attendantId: "", title: "", description: "", targetValue: "", type: "sales" });
      toast({ title: "Meta criada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao criar meta", variant: "destructive" });
    }
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/goals/${id}`, {
        ...data,
        attendantId: parseInt(data.attendantId)
      });
      if (!response.ok) throw new Error("Failed to update goal");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setShowGoalModal(false);
      setEditingGoal(null);
      toast({ title: "Meta atualizada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar meta", variant: "destructive" });
    }
  });

  // Achievement mutations
  const createAchievementMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/achievements", {
        ...data,
        attendantId: parseInt(data.attendantId),
        pointsAwarded: parseInt(data.pointsAwarded),
        achievedAt: new Date().toISOString()
      });
      if (!response.ok) throw new Error("Failed to create achievement");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      setShowAchievementModal(false);
      setNewAchievement({ attendantId: "", title: "", description: "", pointsAwarded: "", badgeColor: "#10B981" });
      toast({ title: "Conquista criada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao criar conquista", variant: "destructive" });
    }
  });

  const updateAchievementMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/achievements/${id}`, {
        ...data,
        attendantId: parseInt(data.attendantId),
        pointsAwarded: parseInt(data.pointsAwarded)
      });
      if (!response.ok) throw new Error("Failed to update achievement");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      setShowAchievementModal(false);
      setEditingAchievement(null);
      toast({ title: "Conquista atualizada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar conquista", variant: "destructive" });
    }
  });

  const deleteAchievementMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/achievements/${id}`);
      if (!response.ok) throw new Error("Failed to delete achievement");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      toast({ title: "Conquista removida com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover conquista", variant: "destructive" });
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
        localStorage.setItem('admin_user', JSON.stringify(result.user));
        
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
        <ModernHeader />
        <Navigation />

        <main className="flex items-center justify-center min-h-[60vh] px-4 py-8">
          <Card className="w-full max-w-md bg-card/90 border-border backdrop-blur-sm shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-danger to-danger/80 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="text-white" size={36} />
                </div>
                <h2 className="text-2xl font-bold text-primary-light mb-2">Área do Gestor</h2>
                <p className="text-secondary-light">Acesso restrito para administradores</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-secondary-light font-medium">Usuário</Label>
                  <Input
                    id="username"
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                    placeholder="Digite seu usuário"
                    className="bg-input border-border text-primary-light h-12 text-lg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-secondary-light font-medium">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={credentials.password}
                      onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                      placeholder="Digite sua senha"
                      className="bg-input border-border text-primary-light pr-12 h-12 text-lg"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-accent/50"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-danger to-danger/80 hover:from-danger/90 hover:to-danger/70 text-white font-semibold h-12 text-lg transition-all duration-300 transform hover:scale-105"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Entrando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Shield size={20} />
                      Entrar no Sistema
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary-dark to-secondary-dark/50">
      <ModernHeader />
      <Navigation />

      <main className="px-4 py-6 pb-20 sm:pb-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
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

        {/* Management Tabs - Unified Layout */}
        <Tabs defaultValue="attendants" className="space-y-6">
          <TabsList className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2 bg-transparent p-0">
            {[
              { value: 'attendants', icon: Users, label: 'Atendentes' },
              { value: 'sales', icon: DollarSign, label: 'Vendas' },
              { value: 'goals', icon: Target, label: 'Metas' },
              { value: 'achievements', icon: Trophy, label: 'Conquistas' },
              { value: 'admins', icon: Shield, label: 'Administradores' },
              { value: 'dragdrop', icon: Grip, label: 'Organizar' },
              { value: 'layout', icon: Layout, label: 'Layout' }
            ].map(({ value, icon: Icon, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 bg-card border border-border rounded-lg text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-success data-[state=active]:to-info data-[state=active]:text-white"
              >
                <Icon size={16} className="sm:hidden" />
                <Icon size={18} className="hidden sm:block" />
                <span className="leading-tight text-center sm:text-left">{label}</span>
              </TabsTrigger>
            ))}
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
                {newAttendant.imageUrl && (
                  <div className="flex items-center gap-4">
                    <img 
                      src={newAttendant.imageUrl} 
                      alt="Prévia" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-border"
                    />
                    <span className="text-sm text-secondary-light">Prévia da imagem</span>
                  </div>
                )}
                <Button 
                  onClick={() => createAttendantMutation.mutate(newAttendant)}
                  disabled={!newAttendant.name || !newAttendant.imageUrl || createAttendantMutation.isPending}
                  className="bg-success text-primary-light hover:bg-success-dark"
                >
                  {createAttendantMutation.isPending ? "Criando..." : "Criar Atendente"}
                </Button>
              </CardContent>
            </Card>

            {/* Search and View Controls */}
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-light" />
                      <Input
                        value={attendantSearchQuery}
                        onChange={(e) => setAttendantSearchQuery(e.target.value)}
                        placeholder="Buscar atendentes..."
                        className="pl-10 bg-input border-border text-primary-light min-w-[200px]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={attendantSortBy}
                        onChange={(e) => setAttendantSortBy(e.target.value as any)}
                        className="bg-input border-border text-primary-light px-3 py-2 rounded text-sm"
                      >
                        <option value="name">Nome</option>
                        <option value="earnings">Vendas</option>
                        <option value="createdAt">Data</option>
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAttendantSortOrder(attendantSortOrder === 'asc' ? 'desc' : 'asc')}
                        className="border-border"
                      >
                        <TrendingUp size={16} className={`transform ${attendantSortOrder === 'desc' ? 'rotate-180' : ''}`} />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={attendantViewMode === 'cards' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAttendantViewMode('cards')}
                      className="border-border"
                    >
                      <Grid size={16} />
                    </Button>
                    <Button
                      variant={attendantViewMode === 'table' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAttendantViewMode('table')}
                      className="border-border"
                    >
                      <List size={16} />
                    </Button>
                    <Button
                      variant={attendantViewMode === 'detailed' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAttendantViewMode('detailed')}
                      className="border-border"
                    >
                      <BarChart3 size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendants Display */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary-light flex items-center justify-between">
                  <span>Atendentes Cadastrados ({filteredAndSortedAttendants.length})</span>
                  {attendantSearchQuery && (
                    <span className="text-sm font-normal text-secondary-light">
                      Resultados para "{attendantSearchQuery}"
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {attendantsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-success mx-auto mb-4"></div>
                      <p className="text-secondary-light">Carregando atendentes...</p>
                    </div>
                  </div>
                ) : filteredAndSortedAttendants.length === 0 ? (
                  <div className="text-center py-12">
                    <Users size={48} className="mx-auto mb-4 text-muted-light opacity-50" />
                    <p className="text-secondary-light">
                      {attendantSearchQuery ? 'Nenhum atendente encontrado' : 'Nenhum atendente cadastrado'}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Cards View */}
                    {attendantViewMode === 'cards' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAndSortedAttendants.map((attendant: Attendant) => {
                          const stats = getAttendantStats(attendant);
                          return (
                            <div key={attendant.id} className="bg-input/30 border border-border rounded-lg p-4 hover:bg-input/50 transition-colors">
                              <div className="flex items-center gap-3 mb-3">
                                <img 
                                  src={attendant.imageUrl} 
                                  alt={attendant.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                  <h4 className="text-primary-light font-medium">{attendant.name}</h4>
                                  <p className="text-success font-semibold">R$ {attendant.earnings}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                <div className="bg-secondary-dark/30 rounded p-2 text-center">
                                  <div className="text-primary-light font-medium">{stats.totalSales}</div>
                                  <div className="text-secondary-light">Vendas</div>
                                </div>
                                <div className="bg-secondary-dark/30 rounded p-2 text-center">
                                  <div className="text-primary-light font-medium">{stats.totalAchievements}</div>
                                  <div className="text-secondary-light">Conquistas</div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleViewAttendantDetails(attendant)}
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 border-info text-info hover:bg-info hover:text-white"
                                >
                                  <Eye size={14} />
                                </Button>
                                <Button
                                  onClick={() => handleEditAttendant(attendant)}
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 border-warning text-warning hover:bg-warning hover:text-white"
                                >
                                  <Edit size={14} />
                                </Button>
                                <Button
                                  onClick={() => deleteAttendantMutation.mutate(attendant.id)}
                                  disabled={deleteAttendantMutation.isPending}
                                  variant="destructive"
                                  size="sm"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Table View */}
                    {attendantViewMode === 'table' && (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-3 px-2 text-secondary-light font-medium">Atendente</th>
                              <th className="text-left py-3 px-2 text-secondary-light font-medium">Vendas Totais</th>
                              <th className="text-left py-3 px-2 text-secondary-light font-medium">Nº Vendas</th>
                              <th className="text-left py-3 px-2 text-secondary-light font-medium">Conquistas</th>
                              <th className="text-left py-3 px-2 text-secondary-light font-medium">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAndSortedAttendants.map((attendant: Attendant) => {
                              const stats = getAttendantStats(attendant);
                              return (
                                <tr key={attendant.id} className="border-b border-border/50 hover:bg-input/20">
                                  <td className="py-3 px-2">
                                    <div className="flex items-center gap-3">
                                      <img 
                                        src={attendant.imageUrl} 
                                        alt={attendant.name}
                                        className="w-8 h-8 rounded-full object-cover"
                                      />
                                      <span className="text-primary-light font-medium">{attendant.name}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-2 text-success font-semibold">R$ {attendant.earnings}</td>
                                  <td className="py-3 px-2 text-primary-light">{stats.totalSales}</td>
                                  <td className="py-3 px-2 text-primary-light">{stats.totalAchievements}</td>
                                  <td className="py-3 px-2">
                                    <div className="flex gap-1">
                                      <Button
                                        onClick={() => handleViewAttendantDetails(attendant)}
                                        variant="outline"
                                        size="sm"
                                        className="border-info text-info hover:bg-info hover:text-white"
                                      >
                                        <Eye size={14} />
                                      </Button>
                                      <Button
                                        onClick={() => handleEditAttendant(attendant)}
                                        variant="outline"
                                        size="sm"
                                        className="border-warning text-warning hover:bg-warning hover:text-white"
                                      >
                                        <Edit size={14} />
                                      </Button>
                                      <Button
                                        onClick={() => deleteAttendantMutation.mutate(attendant.id)}
                                        disabled={deleteAttendantMutation.isPending}
                                        variant="destructive"
                                        size="sm"
                                      >
                                        <Trash2 size={14} />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Detailed View */}
                    {attendantViewMode === 'detailed' && (
                      <div className="space-y-4">
                        {filteredAndSortedAttendants.map((attendant: Attendant) => {
                          const stats = getAttendantStats(attendant);
                          return (
                            <div key={attendant.id} className="bg-input/30 border border-border rounded-lg p-6">
                              <div className="flex flex-col lg:flex-row gap-6">
                                <div className="flex items-center gap-4">
                                  <img 
                                    src={attendant.imageUrl} 
                                    alt={attendant.name}
                                    className="w-16 h-16 rounded-full object-cover"
                                  />
                                  <div>
                                    <h3 className="text-xl font-bold text-primary-light">{attendant.name}</h3>
                                    <p className="text-success text-lg font-semibold">R$ {attendant.earnings}</p>
                                    <p className="text-secondary-light text-sm">
                                      Cadastrado em {new Date(attendant.createdAt).toLocaleDateString('pt-BR')}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
                                  <div className="bg-secondary-dark/30 rounded p-3 text-center">
                                    <DollarSign size={20} className="mx-auto mb-1 text-success" />
                                    <div className="text-lg font-bold text-primary-light">{stats.totalSales}</div>
                                    <div className="text-xs text-secondary-light">Total Vendas</div>
                                  </div>
                                  <div className="bg-secondary-dark/30 rounded p-3 text-center">
                                    <TrendingUp size={20} className="mx-auto mb-1 text-info" />
                                    <div className="text-lg font-bold text-primary-light">R$ {stats.averageSale.toFixed(2)}</div>
                                    <div className="text-xs text-secondary-light">Média/Venda</div>
                                  </div>
                                  <div className="bg-secondary-dark/30 rounded p-3 text-center">
                                    <Target size={20} className="mx-auto mb-1 text-warning" />
                                    <div className="text-lg font-bold text-primary-light">{stats.activeGoals}</div>
                                    <div className="text-xs text-secondary-light">Metas Ativas</div>
                                  </div>
                                  <div className="bg-secondary-dark/30 rounded p-3 text-center">
                                    <Trophy size={20} className="mx-auto mb-1 text-danger" />
                                    <div className="text-lg font-bold text-primary-light">{stats.totalAchievements}</div>
                                    <div className="text-xs text-secondary-light">Conquistas</div>
                                  </div>
                                </div>
                                <div className="flex lg:flex-col gap-2">
                                  <Button
                                    onClick={() => handleViewAttendantDetails(attendant)}
                                    variant="outline"
                                    size="sm"
                                    className="border-info text-info hover:bg-info hover:text-white"
                                  >
                                    <Eye size={16} />
                                  </Button>
                                  <Button
                                    onClick={() => handleEditAttendant(attendant)}
                                    variant="outline"
                                    size="sm"
                                    className="border-warning text-warning hover:bg-warning hover:text-white"
                                  >
                                    <Edit size={16} />
                                  </Button>
                                  <Button
                                    onClick={() => deleteAttendantMutation.mutate(attendant.id)}
                                    disabled={deleteAttendantMutation.isPending}
                                    variant="destructive"
                                    size="sm"
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
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
                <CardTitle className="text-primary-light flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target size={20} />
                    Metas Ativas
                  </div>
                  <Button
                    onClick={handleCreateGoal}
                    className="bg-success text-white hover:bg-success-dark"
                  >
                    <Plus size={16} className="mr-2" />
                    Nova Meta
                  </Button>
                </CardTitle>
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
                              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                goal.isActive ? 'bg-success text-white' : 'bg-secondary-dark text-secondary-light'
                              }`}>
                                {goal.isActive ? 'Ativa' : 'Inativa'}
                              </span>
                            </p>
                            <div className="w-full bg-secondary-dark rounded-full h-2 mt-2">
                              <div 
                                className="bg-success h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                            <p className="text-xs text-secondary-light mt-1">
                              {progress.toFixed(1)}% concluído • {goal.description}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              onClick={() => handleEditGoal(goal)}
                              variant="outline"
                              size="sm"
                              className="border-info text-info hover:bg-info hover:text-white"
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              onClick={() => deleteGoalMutation.mutate(goal.id)}
                              disabled={deleteGoalMutation.isPending}
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
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
                <CardTitle className="text-primary-light flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy size={20} />
                    Conquistas Recentes
                  </div>
                  <Button
                    onClick={handleCreateAchievement}
                    className="bg-success text-white hover:bg-success-dark"
                  >
                    <Plus size={16} className="mr-2" />
                    Nova Conquista
                  </Button>
                </CardTitle>
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
                                {attendant?.name} • {achievement.pointsAwarded} pontos • 
                                {new Date(achievement.achievedAt).toLocaleDateString('pt-BR')}
                              </p>
                              <p className="text-xs text-secondary-light">{achievement.description}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleEditAchievement(achievement)}
                              variant="outline"
                              size="sm"
                              className="border-info text-info hover:bg-info hover:text-white"
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              onClick={() => deleteAchievementMutation.mutate(achievement.id)}
                              disabled={deleteAchievementMutation.isPending}
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admins Management */}
          <TabsContent value="admins" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary-light flex items-center gap-2">
                  <UserPlus size={20} />
                  Adicionar Novo Administrador
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-secondary-light">Nome de usuário</Label>
                    <Input
                      value={newAdmin.username}
                      onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                      placeholder="Nome de usuário"
                      className="bg-input border-border text-primary-light"
                    />
                  </div>
                  <div>
                    <Label className="text-secondary-light">Email</Label>
                    <Input
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                      placeholder="email@exemplo.com"
                      className="bg-input border-border text-primary-light"
                    />
                  </div>
                  <div>
                    <Label className="text-secondary-light">Senha</Label>
                    <Input
                      type="password"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                      placeholder="Senha do administrador"
                      className="bg-input border-border text-primary-light"
                    />
                  </div>
                  <div>
                    <Label className="text-secondary-light">Função</Label>
                    <select
                      value={newAdmin.role}
                      onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})}
                      className="bg-input border-border text-primary-light w-full p-2 rounded"
                    >
                      <option value="admin">Administrador</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                </div>
                <Button 
                  onClick={() => createAdminMutation.mutate(newAdmin)}
                  disabled={!newAdmin.username || !newAdmin.password || createAdminMutation.isPending}
                  className="bg-success text-primary-light hover:bg-success-dark"
                >
                  {createAdminMutation.isPending ? "Criando..." : "Criar Administrador"}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary-light">Administradores do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                {adminsLoading ? (
                  <p className="text-secondary-light">Carregando...</p>
                ) : (
                  <div className="space-y-2">
                    {admins.map((admin: any) => (
                      <div key={admin.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-danger rounded-full flex items-center justify-center">
                            <Shield className="text-white" size={20} />
                          </div>
                          <div>
                            <h4 className="text-primary-light font-medium">{admin.username}</h4>
                            <p className="text-secondary-light text-sm">
                              {admin.email} • {admin.role}
                              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                admin.isActive ? 'bg-success text-white' : 'bg-danger text-white'
                              }`}>
                                {admin.isActive ? 'Ativo' : 'Inativo'}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => toggleAdminStatusMutation.mutate({ 
                              id: admin.id, 
                              isActive: !admin.isActive 
                            })}
                            disabled={toggleAdminStatusMutation.isPending}
                            variant={admin.isActive ? "destructive" : "default"}
                            size="sm"
                          >
                            {admin.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                          </Button>
                          <Button
                            onClick={() => deleteAdminMutation.mutate(admin.id)}
                            disabled={deleteAdminMutation.isPending}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
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

      {/* Goal Modal */}
      <Dialog open={showGoalModal} onOpenChange={setShowGoalModal}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary-light">
              {editingGoal ? 'Editar Meta' : 'Nova Meta'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-secondary-light">Atendente</Label>
              <select
                value={newGoal.attendantId}
                onChange={(e) => setNewGoal({...newGoal, attendantId: e.target.value})}
                className="bg-input border-border text-primary-light w-full p-2 rounded"
              >
                <option value="">Selecione um atendente</option>
                {attendants.map((attendant: Attendant) => (
                  <option key={attendant.id} value={attendant.id}>{attendant.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-secondary-light">Título da Meta</Label>
              <Input
                value={newGoal.title}
                onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                placeholder="Ex: Meta Semanal de Vendas"
                className="bg-input border-border text-primary-light"
              />
            </div>
            <div>
              <Label className="text-secondary-light">Descrição</Label>
              <Input
                value={newGoal.description}
                onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                placeholder="Descrição da meta"
                className="bg-input border-border text-primary-light"
              />
            </div>
            <div>
              <Label className="text-secondary-light">Valor Alvo (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={newGoal.targetValue}
                onChange={(e) => setNewGoal({...newGoal, targetValue: e.target.value})}
                placeholder="1000.00"
                className="bg-input border-border text-primary-light"
              />
            </div>
            <div>
              <Label className="text-secondary-light">Tipo</Label>
              <select
                value={newGoal.type}
                onChange={(e) => setNewGoal({...newGoal, type: e.target.value})}
                className="bg-input border-border text-primary-light w-full p-2 rounded"
              >
                <option value="sales">Vendas</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (editingGoal) {
                    updateGoalMutation.mutate({ id: editingGoal.id, data: newGoal });
                  } else {
                    createGoalMutation.mutate(newGoal);
                  }
                }}
                disabled={!newGoal.attendantId || !newGoal.title || !newGoal.targetValue || 
                         createGoalMutation.isPending || updateGoalMutation.isPending}
                className="bg-success text-white hover:bg-success-dark flex-1"
              >
                {(createGoalMutation.isPending || updateGoalMutation.isPending) ? 
                  "Salvando..." : (editingGoal ? "Atualizar" : "Criar Meta")}
              </Button>
              <Button
                onClick={() => setShowGoalModal(false)}
                variant="outline"
                className="border-border text-secondary-light hover:bg-accent"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Achievement Modal */}
      <Dialog open={showAchievementModal} onOpenChange={setShowAchievementModal}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary-light">
              {editingAchievement ? 'Editar Conquista' : 'Nova Conquista'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-secondary-light">Atendente</Label>
              <select
                value={newAchievement.attendantId}
                onChange={(e) => setNewAchievement({...newAchievement, attendantId: e.target.value})}
                className="bg-input border-border text-primary-light w-full p-2 rounded"
              >
                <option value="">Selecione um atendente</option>
                {attendants.map((attendant: Attendant) => (
                  <option key={attendant.id} value={attendant.id}>{attendant.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-secondary-light">Título da Conquista</Label>
              <Input
                value={newAchievement.title}
                onChange={(e) => setNewAchievement({...newAchievement, title: e.target.value})}
                placeholder="Ex: Primeira Venda"
                className="bg-input border-border text-primary-light"
              />
            </div>
            <div>
              <Label className="text-secondary-light">Descrição</Label>
              <Input
                value={newAchievement.description}
                onChange={(e) => setNewAchievement({...newAchievement, description: e.target.value})}
                placeholder="Descrição da conquista"
                className="bg-input border-border text-primary-light"
              />
            </div>
            <div>
              <Label className="text-secondary-light">Pontos</Label>
              <Input
                type="number"
                value={newAchievement.pointsAwarded}
                onChange={(e) => setNewAchievement({...newAchievement, pointsAwarded: e.target.value})}
                placeholder="25"
                className="bg-input border-border text-primary-light"
              />
            </div>
            <div>
              <Label className="text-secondary-light">Cor da Medalha</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="color"
                  value={newAchievement.badgeColor}
                  onChange={(e) => setNewAchievement({...newAchievement, badgeColor: e.target.value})}
                  className="w-12 h-8 p-1 bg-input border-border"
                />
                <Input
                  value={newAchievement.badgeColor}
                  onChange={(e) => setNewAchievement({...newAchievement, badgeColor: e.target.value})}
                  placeholder="#10B981"
                  className="bg-input border-border text-primary-light flex-1"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (editingAchievement) {
                    updateAchievementMutation.mutate({ id: editingAchievement.id, data: newAchievement });
                  } else {
                    createAchievementMutation.mutate(newAchievement);
                  }
                }}
                disabled={!newAchievement.attendantId || !newAchievement.title || !newAchievement.pointsAwarded || 
                         createAchievementMutation.isPending || updateAchievementMutation.isPending}
                className="bg-success text-white hover:bg-success-dark flex-1"
              >
                {(createAchievementMutation.isPending || updateAchievementMutation.isPending) ? 
                  "Salvando..." : (editingAchievement ? "Atualizar" : "Criar Conquista")}
              </Button>
              <Button
                onClick={() => setShowAchievementModal(false)}
                variant="outline"
                className="border-border text-secondary-light hover:bg-accent"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Attendant Details Modal */}
      <Dialog open={showAttendantDetails} onOpenChange={setShowAttendantDetails}>
        <DialogContent className="bg-card border-border max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-primary-light flex items-center gap-3">
              {selectedAttendant && (
                <>
                  <img 
                    src={selectedAttendant.imageUrl} 
                    alt={selectedAttendant.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  Detalhes de {selectedAttendant.name}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedAttendant && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex items-center gap-4">
                  <img 
                    src={selectedAttendant.imageUrl} 
                    alt={selectedAttendant.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-success"
                  />
                  <div>
                    <h3 className="text-2xl font-bold text-primary-light">{selectedAttendant.name}</h3>
                    <p className="text-success text-xl font-semibold">R$ {selectedAttendant.earnings}</p>
                    <p className="text-secondary-light">
                      Membro desde {new Date(selectedAttendant.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(() => {
                  const stats = getAttendantStats(selectedAttendant);
                  return (
                    <>
                      <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
                        <DollarSign size={24} className="mx-auto mb-2 text-success" />
                        <div className="text-xl font-bold text-primary-light">{stats.totalSales}</div>
                        <div className="text-xs text-secondary-light">Total de Vendas</div>
                      </div>
                      <div className="bg-info/10 border border-info/20 rounded-lg p-4 text-center">
                        <TrendingUp size={24} className="mx-auto mb-2 text-info" />
                        <div className="text-xl font-bold text-primary-light">R$ {stats.averageSale.toFixed(2)}</div>
                        <div className="text-xs text-secondary-light">Média por Venda</div>
                      </div>
                      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 text-center">
                        <Target size={24} className="mx-auto mb-2 text-warning" />
                        <div className="text-xl font-bold text-primary-light">{stats.activeGoals}</div>
                        <div className="text-xs text-secondary-light">Metas Ativas</div>
                      </div>
                      <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 text-center">
                        <Trophy size={24} className="mx-auto mb-2 text-danger" />
                        <div className="text-xl font-bold text-primary-light">{stats.totalAchievements}</div>
                        <div className="text-xs text-secondary-light">Conquistas</div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Recent Sales */}
              <div>
                <h4 className="text-lg font-semibold text-primary-light mb-3 flex items-center gap-2">
                  <DollarSign size={20} />
                  Vendas Recentes
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {sales
                    .filter((sale: Sale) => sale.attendantId === selectedAttendant.id)
                    .slice(0, 5)
                    .map((sale: Sale) => (
                      <div key={sale.id} className="flex justify-between items-center p-3 bg-input/20 rounded border border-border">
                        <span className="text-primary-light font-medium">R$ {sale.value}</span>
                        <span className="text-secondary-light text-sm">
                          {new Date(sale.createdAt).toLocaleDateString('pt-BR')} às {' '}
                          {new Date(sale.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Active Goals */}
              <div>
                <h4 className="text-lg font-semibold text-primary-light mb-3 flex items-center gap-2">
                  <Target size={20} />
                  Metas Ativas
                </h4>
                <div className="space-y-3">
                  {goals
                    .filter((goal: Goal) => goal.attendantId === selectedAttendant.id && goal.isActive)
                    .map((goal: Goal) => {
                      const progress = (parseFloat(goal.currentValue) / parseFloat(goal.targetValue)) * 100;
                      return (
                        <div key={goal.id} className="p-4 bg-input/20 rounded border border-border">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-medium text-primary-light">{goal.title}</h5>
                            <span className="text-sm text-secondary-light">
                              R$ {goal.currentValue} / R$ {goal.targetValue}
                            </span>
                          </div>
                          <div className="w-full bg-secondary-dark rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-success to-info h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <div className="text-xs text-secondary-light mt-1">
                            {progress.toFixed(1)}% concluído
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Recent Achievements */}
              <div>
                <h4 className="text-lg font-semibold text-primary-light mb-3 flex items-center gap-2">
                  <Trophy size={20} />
                  Conquistas Recentes
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {achievements
                    .filter((achievement: Achievement) => achievement.attendantId === selectedAttendant.id)
                    .slice(0, 4)
                    .map((achievement: Achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3 p-3 bg-input/20 rounded border border-border">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: achievement.badgeColor }}
                        >
                          <Trophy size={16} />
                        </div>
                        <div className="flex-1">
                          <h6 className="font-medium text-primary-light text-sm">{achievement.title}</h6>
                          <p className="text-xs text-secondary-light">
                            {achievement.pointsAwarded} pontos • {new Date(achievement.achievedAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  onClick={() => {
                    setShowAttendantDetails(false);
                    handleEditAttendant(selectedAttendant);
                  }}
                  className="bg-info text-white hover:bg-info/80"
                >
                  <Edit size={16} className="mr-2" />
                  Editar Atendente
                </Button>
                <Button
                  onClick={() => setShowAttendantDetails(false)}
                  variant="outline"
                  className="border-border text-secondary-light hover:bg-accent"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Attendant Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-primary-light">Editar Atendente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-secondary-light">Nome</Label>
              <Input
                value={editAttendantData.name}
                onChange={(e) => setEditAttendantData({...editAttendantData, name: e.target.value})}
                placeholder="Nome do atendente"
                className="bg-input border-border text-primary-light"
              />
            </div>
            <div>
              <Label className="text-secondary-light">URL da Imagem</Label>
              <Input
                value={editAttendantData.imageUrl}
                onChange={(e) => setEditAttendantData({...editAttendantData, imageUrl: e.target.value})}
                placeholder="https://exemplo.com/imagem.jpg"
                className="bg-input border-border text-primary-light"
              />
            </div>
            {editAttendantData.imageUrl && (
              <div>
                <Label className="text-secondary-light">Prévia da Imagem</Label>
                <img 
                  src={editAttendantData.imageUrl} 
                  alt="Prévia"
                  className="w-20 h-20 rounded-full object-cover border-2 border-border"
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={handleUpdateAttendant}
                disabled={!editAttendantData.name || updateAttendantMutation.isPending}
                className="bg-success text-white hover:bg-success-dark"
              >
                {updateAttendantMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <Button
                onClick={() => setShowEditModal(false)}
                variant="outline"
                className="border-border text-secondary-light hover:bg-accent"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}