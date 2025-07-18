import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Eye, EyeOff, Users, DollarSign, Target, Trophy, Trash2, Edit, Plus, Lock, Layout, Grip, UserPlus, UserX, UserCheck, Search, Filter, Grid, List, BarChart3, Calendar, TrendingUp, Award, Star, Download, Upload, Copy, Share2, MessageCircle, Phone, Mail, FileText, Activity, Settings, Zap, Clock, Award as AwardIcon, Crown, RefreshCw, ArrowUp, ArrowDown, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ModernHeader from "@/components/ModernHeader";
import Navigation from "@/components/Navigation";
import SystemConfiguration from "@/components/SystemConfiguration";
import DashboardStats from "@/components/DashboardStats";
import DashboardWidgetCustomizer from "@/components/DashboardWidgetCustomizer";
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
  const [newAttendant, setNewAttendant] = useState({ 
    name: "", 
    imageUrl: "",
    email: "",
    phone: "",
    department: "",
    commission: "",
    startDate: "",
    status: "active"
  });
  const [newAdmin, setNewAdmin] = useState({ username: "", password: "", email: "", role: "admin" });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAttendantData, setEditAttendantData] = useState({ 
    name: "", 
    imageUrl: "", 
    email: "", 
    phone: "", 
    department: "", 
    commission: "", 
    startDate: "", 
    status: "active" 
  });
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

  // Sale management states
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [newSale, setNewSale] = useState({
    attendantId: "",
    value: ""
  });
  const [showSaleDetails, setShowSaleDetails] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Advanced admin functions
  const downloadImage = async (imageUrl: string, fileName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({
        title: "Download concluído!",
        description: 'Imagem de ' + fileName + ' baixada com sucesso.',
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar a imagem.",
        variant: "destructive",
      });
    }
  };

  const copyAttendantInfo = (attendant: Attendant) => {
    const info = `Nome: ${attendant.name}\nVendas: R$ ${attendant.earnings}\nCadastrado: ${new Date(attendant.createdAt).toLocaleDateString('pt-BR')}`;
    navigator.clipboard.writeText(info);
    toast({
      title: "Informações copiadas!",
      description: "Dados do atendente copiados para a área de transferência.",
    });
  };

  const shareAttendantReport = (attendant: Attendant) => {
    const stats = getAttendantStats(attendant);
    const report = `📊 RELATÓRIO - ${attendant.name}
💰 Total em Vendas: R$ ${attendant.earnings}
🎯 Número de Vendas: ${stats.totalSales}
🏆 Conquistas: ${stats.totalAchievements}
📅 Cadastrado em: ${new Date(attendant.createdAt).toLocaleDateString('pt-BR')}`;

    if (navigator.share) {
      navigator.share({
        title: `Relatório - ${attendant.name}`,
        text: report,
      });
    } else {
      navigator.clipboard.writeText(report);
      toast({
        title: "Relatório copiado!",
        description: "Relatório copiado para compartilhamento.",
      });
    }
  };

  const generateAttendantQR = (attendant: Attendant) => {
    const qrData = `${window.location.origin}?attendant=${attendant.id}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `${attendant.name}_QR.png`;
    link.click();

    toast({
      title: "QR Code gerado!",
      description: "QR Code do atendente baixado com sucesso.",
    });
  };

  const exportAttendantData = async (attendant: Attendant) => {
    const stats = getAttendantStats(attendant);
    const salesData = sales?.filter(sale => sale.attendantId === attendant.id) || [];

    const data = {
      attendant: {
        name: attendant.name,
        earnings: attendant.earnings,
        created: attendant.createdAt,
      },
      statistics: stats,
      sales: salesData.map(sale => ({
        value: sale.value,
        date: sale.createdAt,
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${attendant.name}_dados.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Dados exportados!",
      description: "Arquivo JSON com dados completos baixado.",
    });
  };

  const sendQuickMessage = (attendant: Attendant) => {
    const message = `Olá ${attendant.name}! Como estão as vendas hoje?`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const toggleAttendantStatus = async (attendantId: number) => {
    try {
      const attendant = attendants.find(a => a.id === attendantId);
      if (!attendant) return;

      await apiRequest("PUT", `/api/attendants/${attendantId}`, {
        status: attendant.status === 'active' ? 'inactive' : 'active'
      });

      queryClient.invalidateQueries({ queryKey: ["/api/attendants"] });
      toast({
        title: "Status atualizado!",
        description: attendant.name + ' está agora ' + (attendant.status === 'active' ? 'inativo' : 'ativo') + '.',
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível alterar o status do atendente.",
        variant: "destructive",
      });
    }
  };

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
    setEditAttendantData({ 
      name: attendant.name, 
      imageUrl: attendant.imageUrl,
      email: attendant.email || "",
      phone: attendant.phone || "",
      department: attendant.department || "",
      commission: attendant.commission || "",
      startDate: attendant.startDate || "",
      status: attendant.status || "active"
    });
    setShowEditModal(true);
  };

  const handleImageDownload = async (imageUrl: string, attendantName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${attendantName.replace(/\s+/g, '_')}_photo.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({ title: "Imagem baixada com sucesso!" });
    } catch (error) {
      toast({ title: "Erro ao baixar imagem", variant: "destructive" });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validação de tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({ 
          title: "Arquivo muito grande", 
          description: "O arquivo deve ter no máximo 5MB. Tente redimensionar a imagem.",
          variant: "destructive" 
        });
        return;
      }

      // Validação de tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({ 
          title: "Formato não suportado", 
          description: "Use apenas imagens nos formatos: JPG, PNG, GIF ou WebP.",
          variant: "destructive" 
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setEditAttendantData({...editAttendantData, imageUrl: result});
        toast({ 
          title: "Imagem carregada!", 
          description: "A imagem foi processada com sucesso." 
        });
      };
      reader.onerror = () => {
        toast({ 
          title: "Erro ao processar imagem", 
          description: "Não foi possível ler o arquivo. Tente novamente.",
          variant: "destructive" 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Sale management handlers
  const handleCreateSale = () => {
    setEditingSale(null);
    setNewSale({
      attendantId: "",
      value: ""
    });
    setShowSaleModal(true);
  };

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setNewSale({
      attendantId: sale.attendantId.toString(),
      value: sale.value
    });
    setShowSaleModal(true);
  };

  const handleViewSaleDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setShowSaleDetails(true);
  };

  const handleUpdateSale = () => {
    if (editingSale) {
      updateSaleMutation.mutate({ 
        id: editingSale.id, 
        data: {
          attendantId: parseInt(newSale.attendantId),
          value: newSale.value
        }
      });
    } else {
      createSaleMutation.mutate({
        attendantId: parseInt(newSale.attendantId),
        value: newSale.value
      });
    }
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
    mutationFn: async ({ id, data }: { id: number; data: { name: string; imageUrl: string; email?: string; phone?: string; department?: string; commission?: string; startDate?: string; status?: string } }) => {
      const response = await apiRequest("PUT", `/api/attendants/${id}`, data);
      if (!response.ok) throw new Error("Failed to update attendant");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendants"] });
      setShowEditModal(false);
      setEditingAttendant(null);
      setEditAttendantData({ 
        name: "", 
        imageUrl: "", 
        email: "", 
        phone: "", 
        department: "", 
        commission: "", 
        startDate: "", 
        status: "active" 
      });
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

  const createSaleMutation = useMutation({
    mutationFn: async (data: { attendantId: number; value: string }) => {
      const response = await apiRequest("POST", "/api/sales", data);
      if (!response.ok) throw new Error("Failed to create sale");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendants"] });
      setShowSaleModal(false);
      setNewSale({ attendantId: "", value: "" });
      toast({ title: "Venda criada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao criar venda", variant: "destructive" });
    }
  });

  const updateSaleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { attendantId: number; value: string } }) => {
      const response = await apiRequest("PUT", `/api/sales/${id}`, data);
      if (!response.ok) throw new Error("Failed to update sale");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendants"] });
      setShowSaleModal(false);
      setEditingSale(null);
      setNewSale({ attendantId: "", value: "" });
      toast({ title: "Venda atualizada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar venda", variant: "destructive" });
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

  const [activeTab, setActiveTab] = useState('attendants');

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

      <main className="container-universal pb-20 sm:pb-8 pt-4 sm:pt-6 constrain-width">
        {/* Admin Dashboard Header - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 constrain-width">
          <div className="flex items-center gap-3">
            <Shield className="text-danger icon-universal-xl" />
            <div>
              <h2 className="text-universal-2xl font-bold text-primary-light">Painel do Gestor</h2>
              <p className="text-universal-sm text-secondary-light">Gerencie todos os aspectos do sistema</p>
            </div>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="btn-universal-md border-border text-secondary-light hover:text-primary-light w-full sm:w-auto"
          >
            <Lock className="icon-universal-sm mr-2" />
            Sair
          </Button>
        </div>

        {/* Management Tabs - Universal Mobile System */}
        <Tabs defaultValue="attendants" className="space-y-4 constrain-all" value={activeTab} onValueChange={setActiveTab}>
          {/* Ultra-Responsive Mobile Tab Navigation */}
          <div className="mobile-tabs-wrapper constrain-all">
            <div className="bg-secondary-dark border border-border rounded-lg overflow-hidden constrain-all">
              <TabsList className="admin-tabs-grid bg-transparent h-auto constrain-all">
                {[
                  { value: 'attendants', icon: Users, label: 'Atendentes' },
                  { value: 'sales', icon: DollarSign, label: 'Vendas' },
                  { value: 'goals', icon: Target, label: 'Metas' },
                  { value: 'achievements', icon: Trophy, label: 'Conquistas' },
                  { value: 'admins', icon: Shield, label: 'Admins' },
                  { value: 'widgets', icon: Grip, label: 'Widgets' },
                  { value: 'layout', icon: Layout, label: 'Layout' },
                  { value: 'configs', icon: Settings, label: 'Config' }
                ].map(({ value, icon: Icon, label }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="flex flex-col items-center justify-center gap-1 space-universal-xs text-universal-xs text-secondary-light data-[state=active]:text-primary-light data-[state=active]:bg-primary-dark/30 transition-all border-0 bg-transparent rounded-md constrain-all"
                  >
                    <Icon className="icon-universal-sm flex-shrink-0" />
                    <span className="leading-tight text-center truncate w-full">{label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>



          {/* Attendants Management - Universal Mobile */}
          <TabsContent value="attendants" className="space-universal-md constrain-width">
            {/* Dashboard Stats - Universal Mobile */}
            <DashboardStats />
            {/* Add Attendant Button - Universal Mobile */}
            <div className="lg:hidden">
              <Dialog>
                <DialogTrigger asChild>
                  <Card className="bg-gradient-to-r from-success/10 to-info/10 border-success/30 hover:from-success/20 hover:to-info/20 cursor-pointer transition-all duration-300 card-universal constrain-width">
                    <CardContent className="space-universal-lg text-center">
                      <Plus className="mx-auto mb-3 text-success icon-universal-xl" />
                      <h3 className="text-universal-lg font-bold text-primary-light mb-2">Adicionar Novo Atendente</h3>
                      <p className="text-universal-sm text-secondary-light">Preencha as informações para criar um novo atendente</p>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="bg-card border-border text-primary-light card-universal mx-4 constrain-width">
                  <DialogHeader>
                    <DialogTitle className="text-universal-lg text-primary-light">Novo Atendente</DialogTitle>
                  </DialogHeader>
                  <div className="space-universal-md">
                    <div>
                      <Label className="text-universal-sm text-secondary-light">Nome *</Label>
                      <Input
                        value={newAttendant.name}
                        onChange={(e) => setNewAttendant({...newAttendant, name: e.target.value})}
                        placeholder="Nome do atendente"
                        className="input-universal bg-input border-border text-primary-light"
                      />
                    </div>
                    <div>
                      <Label className="text-universal-sm text-secondary-light">URL da Imagem *</Label>
                      <Input
                        value={newAttendant.imageUrl}
                        onChange={(e) => setNewAttendant({...newAttendant, imageUrl: e.target.value})}
                        placeholder="https://exemplo.com/foto.jpg"
                        className="input-universal bg-input border-border text-primary-light"
                      />
                    </div>
                    <Button 
                      onClick={() => createAttendantMutation.mutate(newAttendant)}
                      disabled={!newAttendant.name || !newAttendant.imageUrl || createAttendantMutation.isPending}
                      className="w-full bg-success text-white hover:bg-success-dark"
                    >
                      {createAttendantMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Criando...
                        </>
                      ) : (
                        <>
                          <Plus size={16} className="mr-2" />
                          Criar Atendente
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Formulário Completo para Desktop */}
            <Card className="bg-card border-border hidden lg:block">
              <CardHeader>
                <CardTitle className="text-primary-light flex items-center gap-2">
                  <Plus size={20} />
                  Adicionar Novo Atendente
                </CardTitle>
                <p className="text-secondary-light">Preencha as informações para criar um novo atendente</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-secondary-dark">
                    <TabsTrigger value="basic" className="text-secondary-light data-[state=active]:text-primary-light">
                      Básico
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="text-secondary-light data-[state=active]:text-primary-light">
                      Contato
                    </TabsTrigger>
                    <TabsTrigger value="image" className="text-secondary-light data-[state=active]:text-primary-light">
                      Imagem
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-secondary-light">Nome Completo *</Label>
                        <Input
                          value={newAttendant.name}
                          onChange={(e) => setNewAttendant({...newAttendant, name: e.target.value})}
                          placeholder="Nome completo do atendente"
                          className="bg-input border-border text-primary-light"
                        />
                      </div>
                      <div>
                        <Label className="text-secondary-light">Data de Início</Label>
                        <Input
                          type="date"
                          value={newAttendant.startDate}
                          onChange={(e) => setNewAttendant({...newAttendant, startDate: e.target.value})}
                          className="bg-input border-border text-primary-light"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-secondary-light">Departamento</Label>
                        <select
                          value={newAttendant.department}
                          onChange={(e) => setNewAttendant({...newAttendant, department: e.target.value})}
                          className="w-full bg-input border-border text-primary-light px-3 py-2 rounded"
                        >
                          <option value="">Selecione o departamento</option>
                          <option value="vendas">Vendas</option>
                          <option value="atendimento">Atendimento</option>
                          <option value="telemarketing">Telemarketing</option>
                          <option value="supervisao">Supervisão</option>
                          <option value="gerencia">Gerência</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-secondary-light">Status</Label>
                        <select
                          value={newAttendant.status}
                          onChange={(e) => setNewAttendant({...newAttendant, status: e.target.value})}
                          className="w-full bg-input border-border text-primary-light px-3 py-2 rounded"
                        >
                          <option value="active">Ativo</option>
                          <option value="training">Em Treinamento</option>
                          <option value="inactive">Inativo</option>
                        </select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="contact" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-secondary-light">E-mail</Label>
                        <Input
                          type="email"
                          value={newAttendant.email}
                          onChange={(e) => setNewAttendant({...newAttendant, email: e.target.value})}
                          placeholder="email@exemplo.com"
                          className="bg-input border-border text-primary-light"
                        />
                      </div>
                      <div>
                        <Label className="text-secondary-light">Telefone</Label>
                        <Input
                          value={newAttendant.phone}
                          onChange={(e) => setNewAttendant({...newAttendant, phone: e.target.value})}
                          placeholder="(11) 99999-9999"
                          className="bg-input border-border text-primary-light"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-secondary-light">Comissão (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={newAttendant.commission}
                        onChange={(e) => setNewAttendant({...newAttendant, commission: e.target.value})}
                        placeholder="5.5"
                        className="bg-input border-border text-primary-light"
                      />
                      <p className="text-xs text-secondary-light mt-1">
                        Percentual de comissão sobre as vendas
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="image" className="space-y-4 mt-4">
                    <div>
                      <Label className="text-secondary-light">Upload de Imagem</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                toast({ title: "Arquivo muito grande (máximo 5MB)", variant: "destructive" });
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const result = event.target?.result as string;
                                setNewAttendant({...newAttendant, imageUrl: result});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                          id="new-attendant-image-upload"
                        />
                        <Button
                          type="button"
                          onClick={() => document.getElementById('new-attendant-image-upload')?.click()}
                          variant="outline"
                          className="border-border text-secondary-light hover:bg-accent"
                        >
                          <Upload size={16} className="mr-2" />
                          Escolher Arquivo
                        </Button>
                        <span className="text-xs text-secondary-light">
                          Max: 5MB | JPG, PNG, GIF
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <Label className="text-secondary-light">URL da Imagem</Label>
                      <Input
                        value={newAttendant.imageUrl}
                        onChange={(e) => setNewAttendant({...newAttendant, imageUrl: e.target.value})}
                        placeholder="https://exemplo.com/imagem.jpg"
                        className="bg-input border-border text-primary-light"
                      />
                      <p className="text-xs text-secondary-light mt-1">
                        Ou cole aqui a URL de uma imagem existente
                      </p>
                    </div>

                    {newAttendant.imageUrl && (
                      <div className="p-4 bg-input/20 rounded-lg border border-border">
                        <Label className="text-secondary-light">Prévia da Imagem</Label>
                        <div className="flex items-center gap-4 mt-2">
                          <img 
                            src={newAttendant.imageUrl} 
                            alt="Prévia"
                            className="w-20 h-20 rounded-full object-cover border-2 border-border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <div className="flex-1">
                            <div className="text-sm text-success font-medium">
                              ✓ Imagem carregada com sucesso
                            </div>
                            <div className="text-xs text-secondary-light mt-1">
                              Esta imagem será usada no perfil do atendente
                            </div>
                            <Button
                              type="button"
                              onClick={() => setNewAttendant({...newAttendant, imageUrl: ""})}
                              variant="outline"
                              size="sm"
                              className="border-destructive text-destructive hover:bg-destructive hover:text-white mt-2"
                            >
                              <Trash2 size={14} className="mr-1" />
                              Remover Imagem
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button 
                    onClick={() => createAttendantMutation.mutate(newAttendant)}
                    disabled={!newAttendant.name || !newAttendant.imageUrl || createAttendantMutation.isPending}
                    className="bg-success text-white hover:bg-success-dark flex-1"
                  >
                    {createAttendantMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Criando...
                      </>
                    ) : (
                      <>
                        <Plus size={16} className="mr-2" />
                        Criar Atendente
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setNewAttendant({ 
                      name: "", 
                      imageUrl: "", 
                      email: "", 
                      phone: "", 
                      department: "", 
                      commission: "", 
                      startDate: "", 
                      status: "active" 
                    })}
                    variant="outline"
                    className="border-border text-secondary-light hover:bg-accent"
                  >
                    Limpar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Admin Tools */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary-light flex items-center gap-2">
                  <Settings size={20} />
                  Ferramentas Avançadas de Gestão
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Bulk Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={async () => {
                      const allData = filteredAndSortedAttendants.map(attendant => ({
                        name: attendant.name,
                        earnings: attendant.earnings,
                        sales: sales?.filter(sale => sale.attendantId === attendant.id).length || 0,
                        created: new Date(attendant.createdAt).toLocaleDateString('pt-BR')
                      }));

                      const csv = [
                        'Nome,Vendas Totais,Número de Vendas,Data Cadastro',
                        ...allData.map(d => `${d.name},${d.earnings},${d.sales},${d.created}`)
                      ].join('\n');

                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = 'relatorio_atendentes.csv';
                      link.click();
                      window.URL.revokeObjectURL(url);

                      toast({ title: "Relatório exportado!", description: "CSV com todos os atendentes baixado." });
                    }}
                    variant="outline"
                    className="border-success text-success hover:bg-success hover:text-white"
                  >
                    <FileText size={16} className="mr-2" />
                    Exportar Relatório CSV
                  </Button>

                  <Button
                    onClick={() => {
                      queryClient.invalidateQueries({ queryKey: ["/api/attendants"] });
                      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
                      toast({ title: "Dados atualizados!", description: "Informações sincronizadas com o servidor." });
                    }}
                    variant="outline"
                    className="border-info text-info hover:bg-info hover:text-white"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Sincronizar Dados
                  </Button>

                  <Button
                    onClick={() => {
                      const total = filteredAndSortedAttendants.length;
                      const active = filteredAndSortedAttendants.filter(a => a.status === 'active').length;
                      const totalSales = filteredAndSortedAttendants.reduce((sum, a) => sum + parseFloat(a.earnings), 0);

                      const summary = `📊 RESUMO GERAL
📈 Total de Atendentes: ${total}
✅ Ativos: ${active}
❌ Inativos: ${total - active}
💰 Vendas Totais: R$ ${totalSales.toFixed(2)}
📅 Gerado em: ${new Date().toLocaleString('pt-BR')}`;

                      navigator.clipboard.writeText(summary);
                      toast({ title: "Resumo copiado!", description: "Estatísticas gerais copiadas." });
                    }}
                    variant="outline"
                    className="border-warning text-warning hover:bg-warning hover:text-white"
                  >
                    <BarChart3 size={16} className="mr-2" />
                    Copiar Resumo Geral
                  </Button>

                  <Button
                    onClick={() => {
                      const message = `🎯 DESAFIO DO DIA!\n\nVamos bater nossa meta de vendas! 💪\n\n${filteredAndSortedAttendants.map(a => `• ${a.name}`).join('\n')}\n\nBom trabalho equipe! 🚀`;

                      if (navigator.share) {
                        navigator.share({ title: 'Motivação da Equipe', text: message });
                      } else {
                        navigator.clipboard.writeText(message);
                        toast({ title: "Mensagem motivacional copiada!", description: "Pronta para compartilhar com a equipe." });
                      }
                    }}
                    variant="outline"
                    className="border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white"
                  >
                    <Zap size={16} className="mr-2" />
                    Motivar Equipe
                  </Button>
                </div>
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
                        placeholder="Buscar atendentes por nome, vendas..."
                        className="pl-10 bg-input border-border text-primary-light min-w-[250px]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={attendantSortBy}
                        onChange={(e) => setAttendantSortBy(e.target.value as any)}
                        className="bg-input border-border text-primary-light px-3 py-2 rounded text-sm"
                      >
                        <option value="name">📝 Nome</option>
                        <option value="earnings">💰 Vendas</option>
                        <option value="createdAt">📅 Data Cadastro</option>
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAttendantSortOrder(attendantSortOrder === 'asc' ? 'desc' : 'asc')}
                        className="border-border"
                        title={`Ordenar ${attendantSortOrder === 'asc' ? 'decrescente' : 'crescente'}`}
                      >
                        {attendantSortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={attendantViewMode === 'cards' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAttendantViewMode('cards')}
                      className="border-border"
                      title="Visualização em Cards"
                    >
                      <Grid size={16} />
                    </Button>
                    <Button
                      variant={attendantViewMode === 'table' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAttendantViewMode('table')}
                      className="border-border"
                      title="Visualização em Tabela"
                    >
                      <List size={16} />
                    </Button>
                    <Button
                      variant={attendantViewMode === 'detailed' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAttendantViewMode('detailed')}
                      className="border-border"
                      title="Visualização Detalhada"
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
                              <div className="space-y-2">
                                {/* Primary Actions Row */}
                                <div className="flex gap-1">
                                  <Button
                                    onClick={() => handleViewAttendantDetails(attendant)}
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-info text-info hover:bg-info hover:text-white"
                                    title="Ver detalhes completos"
                                  >
                                    <Eye size={14} />
                                  </Button>
                                  <Button
                                    onClick={() => handleEditAttendant(attendant)}
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-warning text-warning hover:bg-warning hover:text-white"
                                    title="Editar atendente"
                                  >
                                    <Edit size={14} />
                                  </Button>
                                  <Button
                                    onClick={() => sendQuickMessage(attendant)}
                                    variant="outline"
                                    size="sm"
                                    className="border-success text-success hover:bg-success hover:text-white"
                                    title="Enviar mensagem WhatsApp"
                                  >
                                    <MessageCircle size={14} />
                                  </Button>
                                </div>

                                {/* Secondary Actions Row */}
                                <div className="flex gap-1">
                                  <Button
                                    onClick={() => copyAttendantInfo(attendant)}
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-secondary text-secondary-light hover:bg-secondary hover:text-white"
                                    title="Copiar informações"
                                  >
                                    <Copy size={12} />
                                  </Button>
                                  <Button
                                    onClick={() => shareAttendantReport(attendant)}
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-info text-info hover:bg-info hover:text-white"
                                    title="Compartilhar relatório"
                                  >
                                    <Share2 size={12} />
                                  </Button>
                                  <Button
                                    onClick={() => downloadImage(attendant.imageUrl, attendant.name + '_profile')}
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-secondary text-secondary-light hover:bg-secondary hover:text-white"
                                    title="Baixar imagem"
                                  >
                                    <Download size={12} />
                                  </Button>
                                  <Button
                                    onClick={() => exportAttendantData(attendant)}
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-warning text-warning hover:bg-warning hover:text-white"
                                    title="Exportar dados"
                                  >
                                    <FileText size={12} />
                                  </Button>
                                </div>

                                {/* Danger Zone */}
                                <div className="flex gap-1 pt-1 border-t border-border/30">
                                  <Button
                                    onClick={() => toggleAttendantStatus(attendant.id)}
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                                    title={(attendant.status === 'active' ? 'Desativar' : 'Ativar') + ' atendente'}
                                  >
                                    {attendant.status === 'active' ? <UserX size={12} /> : <UserCheck size={12} />}
                                  </Button>
                                  <Button
                                    onClick={() => deleteAttendantMutation.mutate(attendant.id)}
                                    disabled={deleteAttendantMutation.isPending}
                                    variant="destructive"
                                    size="sm"
                                    className="flex-1"
                                    title="Excluir atendente permanentemente"
                                  >
                                    <Trash2 size={12} />
                                  </Button>
                                </div>
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
                                    <div className="flex flex-wrap gap-1">
                                      <Button
                                        onClick={() => handleViewAttendantDetails(attendant)}
                                        variant="outline"
                                        size="sm"
                                        className="border-info text-info hover:bg-info hover:text-white"
                                        title="Ver detalhes"
                                      >
                                        <Eye size={12} />
                                      </Button>
                                      <Button
                                        onClick={() => handleEditAttendant(attendant)}
                                        variant="outline"
                                        size="sm"
                                        className="border-warning text-warning hover:bg-warning hover:text-white"
                                        title="Editar"
                                      >
                                        <Edit size={12} />
                                      </Button>
                                      <Button
                                        onClick={() => sendQuickMessage(attendant)}
                                        variant="outline"
                                        size="sm"
                                        className="border-success text-success hover:bg-success hover:text-white"
                                        title="WhatsApp"
                                      >
                                        <MessageCircle size={12} />
                                      </Button>
                                      <Button
                                        onClick={() => copyAttendantInfo(attendant)}
                                        variant="outline"
                                        size="sm"
                                        className="border-secondary text-secondary-light hover:bg-secondary hover:text-white"
                                        title="Copiar dados"
                                      >
                                        <Copy size={12} />
                                      </Button>
                                      <Button
                                        onClick={() => shareAttendantReport(attendant)}
                                        variant="outline"
                                        size="sm"
                                        className="border-info text-info hover:bg-info hover:text-white"
                                        title="Compartilhar"
                                      >
                                        <Share2 size={12} />
                                      </Button>
                                      <Button
                                        onClick={() => downloadImage(attendant.imageUrl, attendant.name + '_profile')}
                                        variant="outline"
                                        size="sm"
                                        className="border-secondary text-secondary-light hover:bg-secondary hover:text-white"
                                        title="Baixar imagem"
                                      >
                                        <Download size={12} />
                                      </Button>
                                      <Button
                                        onClick={() => exportAttendantData(attendant)}
                                        variant="outline"
                                        size="sm"
                                        className="border-warning text-warning hover:bg-warning hover:text-white"
                                        title="Exportar"
                                      >
                                        <FileText size={12} />
                                      </Button>
                                      <Button
                                        onClick={() => toggleAttendantStatus(attendant.id)}
                                        variant="outline"
                                        size="sm"
                                        className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                                        title={attendant.status === 'active' ? 'Desativar' : 'Ativar'}
                                      >
                                        {attendant.status === 'active' ? <UserX size={12} /> : <UserCheck size={12} />}
                                      </Button>
                                      <Button
                                        onClick={() => deleteAttendantMutation.mutate(attendant.id)}
                                        disabled={deleteAttendantMutation.isPending}
                                        variant="destructive"
                                        size="sm"
                                        title="Excluir"
                                      >
                                        <Trash2 size={12} />
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
                                  <div className="flex gap-1">
                                    <Button
                                      onClick={() => handleViewAttendantDetails(attendant)}
                                      variant="outline"
                                      size="sm"
                                      className="border-info text-info hover:bg-info hover:text-white"
                                      title="Ver detalhes completos"
                                    >
                                      <Eye size={14} />
                                    </Button>
                                    <Button
                                      onClick={() => handleEditAttendant(attendant)}
                                      variant="outline"
                                      size="sm"
                                      className="border-warning text-warning hover:bg-warning hover:text-white"
                                      title="Editar atendente"
                                    >
                                      <Edit size={14} />
                                    </Button>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      onClick={() => sendQuickMessage(attendant)}
                                      variant="outline"
                                      size="sm"
                                      className="border-success text-success hover:bg-success hover:text-white"
                                      title="Enviar mensagem"
                                    >
                                      <MessageCircle size={14} />
                                    </Button>
                                    <Button
                                      onClick={() => copyAttendantInfo(attendant)}
                                      variant="outline"
                                      size="sm"
                                      className="border-secondary text-secondary-light hover:bg-secondary hover:text-white"
                                      title="Copiar informações"
                                    >
                                      <Copy size={14} />
                                    </Button>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      onClick={() => shareAttendantReport(attendant)}
                                      variant="outline"
                                      size="sm"
                                      className="border-info text-info hover:bg-info hover:text-white"
                                      title="Compartilhar relatório"
                                    >
                                      <Share2 size={14} />
                                    </Button>
                                    <Button
                                      onClick={() => exportAttendantData(attendant)}
                                      variant="outline"
                                      size="sm"
                                      className="border-warning text-warning hover:bg-warning hover:text-white"
                                      title="Exportar dados"
                                    >
                                      <FileText size={14} />
                                    </Button>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      onClick={() => downloadImage(attendant.imageUrl, attendant.name + '_profile')}
                                      variant="outline"
                                      size="sm"
                                      className="border-secondary text-secondary-light hover:bg-secondary hover:text-white"
                                      title="Baixar imagem"
                                    >
                                      <Download size={14} />
                                    </Button>
                                    <Button
                                      onClick={() => generateAttendantQR(attendant)}
                                      variant="outline"
                                      size="sm"
                                      className="border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white"
                                      title="Gerar QR Code"
                                    >
                                      <Activity size={14} />
                                    </Button>
                                  </div>
                                  <div className="flex gap-1 pt-1 border-t border-border/20">
                                    <Button
                                      onClick={() => toggleAttendantStatus(attendant.id)}
                                      variant="outline"
                                      size="sm"
                                      className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                                      title={(attendant.status === 'active' ? 'Desativar' : 'Ativar') + ' atendente'}
                                    >
                                      {attendant.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
                                    </Button>
                                    <Button
                                      onClick={() => deleteAttendantMutation.mutate(attendant.id)}
                                      disabled={deleteAttendantMutation.isPending}
                                      variant="destructive"
                                      size="sm"
                                      title="Excluir permanentemente"
                                    >
                                      <Trash2 size={14} />
                                    </Button>
                                  </div>
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
                <CardTitle className="text-primary-light flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign size={20} />
                    Histórico de Vendas
                  </div>
                  <Button
                    onClick={handleCreateSale}
                    className="bg-success text-white hover:bg-success-dark"
                  >
                    <Plus size={16} className="mr-2" />
                    Nova Venda
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {salesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-success mx-auto mb-4"></div>
                      <p className="text-secondary-light">Carregando vendas...</p>
                    </div>
                  </div>
                ) : sales.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign size={48} className="mx-auto mb-4 text-muted-light opacity-50" />
                    <p className="text-secondary-light mb-4">Nenhuma venda registrada</p>
                    <Button
                      onClick={handleCreateSale}
                      className="bg-success text-white hover:bg-success-dark"
                    >
                      <Plus size={16} className="mr-2" />
                      Registrar Primeira Venda
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sales.map((sale: Sale) => {
                      const attendant = attendants.find((a: Attendant) => a.id === sale.attendantId);
                      return (
                        <div key={sale.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-input/20 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center">
                              <DollarSign className="text-success" size={20} />
                            </div>
                            <div>
                              <h4 className="text-primary-light font-semibold text-lg">R$ {sale.value}</h4>
                              <p className="text-secondary-light text-sm">
                                {attendant?.name} • {new Date(sale.createdAt).toLocaleDateString('pt-BR')} às {' '}
                                {new Date(sale.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleViewSaleDetails(sale)}
                              variant="outline"
                              size="sm"
                              className="border-info text-info hover:bg-info hover:text-white"
                            >
                              <Eye size={14} />
                            </Button>
                            <Button
                              onClick={() => handleEditSale(sale)}
                              variant="outline"
                              size="sm"
                              className="border-warning text-warning hover:bg-warning hover:text-white"
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              onClick={() => deleteSaleMutation.mutate(sale.id)}
                              disabled={deleteSaleMutation.isPending}
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
                              <span className={'ml-2 px-2 py-1 rounded text-xs ' + (goal.isActive ? 'bg-success text-white' : 'bg-secondary-dark text-secondary-light')}>
                                {goal.isActive ? 'Ativa' : 'Inativa'}
                              </span>
                            </p>
                            <div className="w-full bg-secondary-dark rounded-full h-2 mt-2">
                              <div 
                                className="bg-success h-2 rounded-full transition-all"
                                style={{ width: Math.min(progress, 100) + '%' }}
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
                              <span className={'ml-2 px-2 py-1 rounded text-xs ' + (admin.isActive ? 'bg-success text-white' : 'bg-danger text-white')}>
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
                  <div className="text-center py-8">
                    <p className="text-secondary-light">Funcionalidade de arrastar e soltar em desenvolvimento.</p>
                    <p className="text-sm text-secondary-light mt-2">Em breve você poderá reorganizar os atendentes arrastando.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dashboard Widget Customizer */}
          <TabsContent value="widgets" className="space-y-6">
            <DashboardWidgetCustomizer />
          </TabsContent>

          {/* Content Builder */}
          <TabsContent value="layout" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary-light flex items-center gap-2">
                  <Layout size={20} />
                  Personalização de Layout
                </CardTitle>
                <p className="text-secondary-light">Configure a aparência do sistema</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tema de Cores */}
                <div className="space-y-4">
                  <h4 className="text-primary-light font-semibold flex items-center gap-2">
                    <Activity size={16} />
                    Tema de Cores
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                      variant="outline" 
                      className="flex flex-col gap-2 p-4 h-auto border-2 hover:border-primary"
                    >
                      <div className="w-full h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
                      <span className="text-xs">Padrão</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex flex-col gap-2 p-4 h-auto border-2 hover:border-primary"
                    >
                      <div className="w-full h-8 bg-gradient-to-r from-green-600 to-teal-600 rounded"></div>
                      <span className="text-xs">Natureza</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex flex-col gap-2 p-4 h-auto border-2 hover:border-primary"
                    >
                      <div className="w-full h-8 bg-gradient-to-r from-red-600 to-orange-600 rounded"></div>
                      <span className="text-xs">Energia</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex flex-col gap-2 p-4 h-auto border-2 hover:border-primary"
                    >
                      <div className="w-full h-8 bg-gradient-to-r from-gray-600 to-slate-600 rounded"></div>
                      <span className="text-xs">Profissional</span>
                    </Button>
                  </div>
                </div>

                {/* Tamanho de Fonte */}
                <div className="space-y-4">
                  <h4 className="text-primary-light font-semibold flex items-center gap-2">
                    <FileText size={16} />
                    Tamanho do Texto
                  </h4>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm">Pequeno</Button>
                    <Button variant="outline" size="sm" className="border-primary">Normal</Button>
                    <Button variant="outline" size="sm">Grande</Button>
                    <Button variant="outline" size="sm">Extra Grande</Button>
                  </div>
                </div>

                {/* Modo de Exibição */}
                <div className="space-y-4">
                  <h4 className="text-primary-light font-semibold flex items-center gap-2">
                    <Grid size={16} />
                    Modo de Exibição Padrão
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border-2 border-border rounded-lg p-4 hover:border-primary cursor-pointer">
                      <Grid className="mb-2" size={24} />
                      <p className="text-sm font-medium">Grade de Cards</p>
                      <p className="text-xs text-secondary-light">Visualização em cards</p>
                    </div>
                    <div className="border-2 border-border rounded-lg p-4 hover:border-primary cursor-pointer">
                      <List className="mb-2" size={24} />
                      <p className="text-sm font-medium">Lista Detalhada</p>
                      <p className="text-xs text-secondary-light">Visualização em tabela</p>
                    </div>
                    <div className="border-2 border-border rounded-lg p-4 hover:border-primary cursor-pointer">
                      <BarChart3 className="mb-2" size={24} />
                      <p className="text-sm font-medium">Dashboard</p>
                      <p className="text-xs text-secondary-light">Foco em estatísticas</p>
                    </div>
                  </div>
                </div>

                {/* Animações */}
                <div className="space-y-4">
                  <h4 className="text-primary-light font-semibold flex items-center gap-2">
                    <Zap size={16} />
                    Animações e Efeitos
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between">
                      <span className="text-sm">Animações de transição</span>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm">Efeitos de hover</span>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm">Animações de entrada</span>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button className="bg-success text-white">
                    Salvar Configurações
                  </Button>
                  <Button variant="outline">
                    Restaurar Padrão
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Configuration */}
          <TabsContent value="configs" className="space-y-6">
            <SystemConfiguration />
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
                              style={{ width: Math.min(progress, 100) + '%' }}
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
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-primary-light flex items-center gap-2">
              <Edit size={20} />
              Editar Atendente
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Current Stats Display */}
            {editingAttendant && (
              <div className="bg-input/20 rounded-lg p-4 border border-border">
                <h3 className="text-sm font-medium text-secondary-light mb-3">Informações Atuais</h3>
                <div className="flex items-center gap-4 mb-3">
                  <img 
                    src={editingAttendant.imageUrl} 
                    alt={editingAttendant.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-border"
                  />
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-primary-light">{editingAttendant.name}</h4>
                    <p className="text-success font-bold text-xl">R$ {editingAttendant.earnings}</p>
                    <p className="text-secondary-light text-sm">
                      Cadastrado em {new Date(editingAttendant.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="text-center bg-secondary-dark/30 rounded p-2">
                    <div className="text-primary-light font-bold">
                      {sales.filter((sale: Sale) => sale.attendantId === editingAttendant.id).length}
                    </div>
                    <div className="text-xs text-secondary-light">Vendas</div>
                  </div>
                  <div className="text-center bg-secondary-dark/30 rounded p-2">
                    <div className="text-primary-light font-bold">
                      {goals.filter((goal: Goal) => goal.attendantId === editingAttendant.id && goal.isActive).length}
                    </div>
                    <div className="text-xs text-secondary-light">Metas Ativas</div>
                  </div>
                  <div className="text-center bg-secondary-dark/30 rounded p-2">
                    <div className="text-primary-light font-bold">
                      {achievements.filter((achievement: Achievement) => achievement.attendantId === editingAttendant.id).length}
                    </div>
                    <div className="text-xs text-secondary-light">Conquistas</div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Form with Tabs */}
            <div className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-secondary-dark">
                  <TabsTrigger value="basic" className="text-secondary-light data-[state=active]:text-primary-light">
                    Informações Básicas
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="text-secondary-light data-[state=active]:text-primary-light">
                    Contato & Cargo
                  </TabsTrigger>
                  <TabsTrigger value="image" className="text-secondary-light data-[state=active]:text-primary-light">
                    Imagem & Mídia
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div>
                    <Label className="text-secondary-light">Nome Completo</Label>
                    <Input
                      value={editAttendantData.name}
                      onChange={(e) => setEditAttendantData({...editAttendantData, name: e.target.value})}
                      placeholder="Nome completo do atendente"
                      className="bg-input border-border text-primary-light"
                    />
                  </div>
                  <div>
                    <Label className="text-secondary-light">Data de Início</Label>
                    <Input
                      type="date"
                      value={editAttendantData.startDate}
                      onChange={(e) => setEditAttendantData({...editAttendantData, startDate: e.target.value})}
                      className="bg-input border-border text-primary-light"
                    />
                  </div>
                  <div>
                    <Label className="text-secondary-light">Status</Label>
                    <select
                      value={editAttendantData.status}
                      onChange={(e) => setEditAttendantData({...editAttendantData, status: e.target.value})}
                      className="w-full bg-input border-border text-primary-light px-3 py-2 rounded"
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                      <option value="training">Em Treinamento</option>
                      <option value="vacation">Férias</option>
                    </select>
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4 mt-4">
                  <div>
                    <Label className="text-secondary-light">E-mail</Label>
                    <Input
                      type="email"
                      value={editAttendantData.email}
                      onChange={(e) => setEditAttendantData({...editAttendantData, email: e.target.value})}
                      placeholder="email@exemplo.com"
                      className="bg-input border-border text-primary-light"
                    />
                  </div>
                  <div>
                    <Label className="text-secondary-light">Telefone</Label>
                    <Input
                      value={editAttendantData.phone}
                      onChange={(e) => setEditAttendantData({...editAttendantData, phone: e.target.value})}
                      placeholder="(11) 99999-9999"
                      className="bg-input border-border text-primary-light"
                    />
                  </div>
                  <div>
                    <Label className="text-secondary-light">Departamento</Label>
                    <select
                      value={editAttendantData.department}
                      onChange={(e) => setEditAttendantData({...editAttendantData, department: e.target.value})}
                      className="w-full bg-input border-border text-primary-light px-3 py-2 rounded"
                    >
                      <option value="">Selecione o departamento</option>
                      <option value="vendas">Vendas</option>
                      <option value="atendimento">Atendimento</option>
                      <option value="telemarketing">Telemarketing</option>
                      <option value="supervisao">Supervisão</option>
                      <option value="gerencia">Gerência</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-secondary-light">Comissão (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={editAttendantData.commission}
                      onChange={(e) => setEditAttendantData({...editAttendantData, commission: e.target.value})}
                      placeholder="5.5"
                      className="bg-input border-border text-primary-light"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="image" className="space-y-4 mt-4">
                  <div>
                    <Label className="text-secondary-light">Upload de Imagem</Label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Button
                          type="button"
                          onClick={() => document.getElementById('image-upload')?.click()}
                          variant="outline"
                          className="border-border text-secondary-light hover:bg-accent"
                        >
                          <Upload size={16} className="mr-2" />
                          Escolher Arquivo
                        </Button>
                        <span className="text-xs text-secondary-light">
                          Max: 5MB | JPG, PNG, GIF, WebP
                        </span>
                      </div>

                      {/* Drag and Drop Area */}
                      <div 
                        className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-success/50 transition-colors cursor-pointer"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('border-success');
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-success');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-success');
                          const files = e.dataTransfer.files;
                          if (files.length > 0) {
                            const event = { target: { files } } as any;
                            handleImageUpload(event);
                          }
                        }}
                      >
                        <Upload size={24} className="mx-auto mb-2 text-secondary-light" />
                        <p className="text-sm text-secondary-light mb-1">
                          Arraste uma imagem aqui ou clique para selecionar
                        </p>
                        <p className="text-xs text-muted-light">
                          Formatos aceitos: JPG, PNG, GIF, WebP (máx. 5MB)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <Label className="text-secondary-light">URL da Imagem</Label>
                    <div className="flex gap-2">
                      <Input
                        value={editAttendantData.imageUrl}
                        onChange={(e) => setEditAttendantData({...editAttendantData, imageUrl: e.target.value})}
                        placeholder="https://exemplo.com/imagem.jpg"
                        className="bg-input border-border text-primary-light flex-1"
                      />
                      {editAttendantData.imageUrl && (
                        <Button
                          type="button"
                          onClick={() => handleImageDownload(editAttendantData.imageUrl, editAttendantData.name)}
                          variant="outline"
                          size="sm"
                          className="border-info text-info hover:bg-info hover:text-white"
                        >
                          <Download size={16} />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-secondary-light mt-1">
                      Ou cole aqui a URL de uma imagem existente
                    </p>
                  </div>

                  {editAttendantData.imageUrl && (
                    <div>
                      <Label className="text-secondary-light">Prévia da Imagem</Label>
                      <div className="flex items-center gap-4 mt-2 p-4 bg-input/20 rounded-lg border border-border">
                        <img 
                          src={editAttendantData.imageUrl} 
                          alt="Prévia"
                          className="w-20 h-20 rounded-full object-cover border-2 border-border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="flex-1">
                          <div className="text-sm text-success font-medium">
                            ✓ Imagem carregada com sucesso
                          </div>
                          <div className="text-xs text-secondary-light mt-1">
                            A imagem será usada no perfil do atendente
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button
                              type="button"
                              onClick={() => setEditAttendantData({...editAttendantData, imageUrl: ""})}
                              variant="outline"
                              size="sm"
                              className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                            >
                              <Trash2 size={14} className="mr-1" />
                              Remover
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                onClick={handleUpdateAttendant}
                disabled={!editAttendantData.name || updateAttendantMutation.isPending}
                className="bg-success text-white hover:bg-success-dark flex-1"
              >
                {updateAttendantMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Edit size={16} className="mr-2" />
                    Salvar Alterações
                  </>
                )}
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

      {/* Sale Details Modal */}
      <Dialog open={showSaleDetails} onOpenChange={setShowSaleDetails}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary-light flex items-center gap-2">
              <DollarSign size={20} />
              Detalhes da Venda
            </DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="bg-input/20 rounded-lg p-4 border border-border text-center">
                <div className="text-3xl font-bold text-success mb-2">R$ {selectedSale.value}</div>
                <div className="text-secondary-light text-sm">Valor da Venda</div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-secondary-light">Atendente:</span>
                  <span className="text-primary-light font-medium">
                    {attendants.find((a: Attendant) => a.id === selectedSale.attendantId)?.name || 'Desconhecido'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary-light">Data:</span>
                  <span className="text-primary-light">
                    {new Date(selectedSale.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary-light">Horário:</span>
                  <span className="text-primary-light">
                    {new Date(selectedSale.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary-light">ID da Venda:</span>
                  <span className="text-primary-light font-mono">#{selectedSale.id}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  onClick={() => {
                    setShowSaleDetails(false);
                    handleEditSale(selectedSale);
                  }}
                  className="bg-warning text-white hover:bg-warning/80 flex-1"
                >
                  <Edit size={16} className="mr-2" />
                  Editar
                </Button>
                <Button
                  onClick={() => setShowSaleDetails(false)}
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

      {/* Create/Edit Sale Modal */}
      <Dialog open={showSaleModal} onOpenChange={setShowSaleModal}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary-light flex items-center gap-2">
              <DollarSign size={20} />
              {editingSale ? 'Editar Venda' : 'Nova Venda'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-secondary-light">Atendente</Label>
              <select
                value={newSale.attendantId}
                onChange={(e) => setNewSale({...newSale, attendantId: e.target.value})}
                className="w-full bg-input border-border text-primary-light px-3 py-2 rounded"
              >
                <option value="">Selecione um atendente</option>
                {attendants.map((attendant: Attendant) => (
                  <option key={attendant.id} value={attendant.id}>
                    {attendant.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-secondary-light">Valor da Venda</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={newSale.value}
                onChange={(e) => setNewSale({...newSale, value: e.target.value})}
                placeholder="0.00"
                className="bg-input border-border text-primary-light"
              />
              <p className="text-xs text-secondary-light mt-1">
                Digite o valor da venda (exemplo: 150.50)
              </p>
            </div>

            {newSale.value && (
              <div className="bg-success/10 rounded-lg p-3 border border-success/30">
                <p className="text-success font-semibold">
                  Valor: R$ {parseFloat(newSale.value || '0').toFixed(2).replace('.', ',')}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                onClick={handleUpdateSale}
                disabled={!newSale.attendantId || !newSale.value || createSaleMutation.isPending || updateSaleMutation.isPending}
                className="bg-success text-white hover:bg-success-dark flex-1"
              >
                {(createSaleMutation.isPending || updateSaleMutation.isPending) ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <DollarSign size={16} className="mr-2" />
                    {editingSale ? 'Atualizar Venda' : 'Criar Venda'}
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowSaleModal(false)}
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