import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Edit, Trash2, TrendingUp, BarChart3, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import type { Attendant, Sale } from "@shared/schema";

export default function Attendants() {
  const [isNewAttendantDialogOpen, setIsNewAttendantDialogOpen] = useState(false);
  const [newAttendantName, setNewAttendantName] = useState("");
  const [newAttendantImage, setNewAttendantImage] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAttendant, setEditingAttendant] = useState<Attendant | null>(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState("");
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

  // Calculate statistics for each attendant
  const attendantsWithStats = attendants?.map(attendant => {
    const attendantSales = sales?.filter(sale => sale.attendantId === attendant.id) || [];
    const totalSales = attendantSales.length;
    const totalValue = parseFloat(attendant.earnings);
    const averageTicket = totalSales > 0 ? totalValue / totalSales : 0;
    const thisMonthTarget = 100; // Simplified target
    const targetCompletion = Math.min((totalValue / thisMonthTarget) * 100, 100);
    
    return {
      ...attendant,
      totalSales,
      totalValue,
      averageTicket,
      thisMonthTarget,
      targetCompletion,
    };
  }) || [];

  // Create attendant mutation
  const createAttendantMutation = useMutation({
    mutationFn: async (data: { name: string; imageUrl: string }) => {
      const response = await apiRequest("POST", "/api/attendants", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Atendente criado com sucesso!",
        description: "O novo atendente foi adicionado à equipe.",
      });
      setNewAttendantName("");
      setNewAttendantImage("");
      setIsNewAttendantDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/attendants"] });
    },
    onError: () => {
      toast({
        title: "Erro ao criar atendente",
        description: "Ocorreu um erro ao criar o atendente. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleCreateAttendant = () => {
    if (!newAttendantName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira o nome do atendente.",
        variant: "destructive",
      });
      return;
    }

    if (!newAttendantImage.trim()) {
      toast({
        title: "Imagem obrigatória",
        description: "Por favor, insira a URL da imagem do atendente.",
        variant: "destructive",
      });
      return;
    }

    createAttendantMutation.mutate({
      name: newAttendantName,
      imageUrl: newAttendantImage,
    });
  };

  // Edit attendant mutation
  const editAttendantMutation = useMutation({
    mutationFn: async (data: { id: number; name: string; imageUrl: string }) => {
      const response = await apiRequest("PUT", `/api/attendants/${data.id}`, {
        name: data.name,
        imageUrl: data.imageUrl,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Atendente atualizado!",
        description: "Os dados do atendente foram atualizados com sucesso.",
      });
      setIsEditDialogOpen(false);
      setEditingAttendant(null);
      setEditName("");
      setEditImage("");
      queryClient.invalidateQueries({ queryKey: ["/api/attendants"] });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar o atendente.",
        variant: "destructive",
      });
    },
  });

  // Delete attendant mutation
  const deleteAttendantMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/attendants/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Atendente removido!",
        description: "O atendente foi removido com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/attendants"] });
    },
    onError: () => {
      toast({
        title: "Erro ao remover",
        description: "Ocorreu um erro ao remover o atendente.",
        variant: "destructive",
      });
    },
  });

  const handleEditAttendant = (attendant: Attendant) => {
    setEditingAttendant(attendant);
    setEditName(attendant.name);
    setEditImage(attendant.imageUrl);
    setIsEditDialogOpen(true);
  };

  const handleUpdateAttendant = () => {
    if (!editName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira o nome do atendente.",
        variant: "destructive",
      });
      return;
    }

    if (!editImage.trim()) {
      toast({
        title: "Imagem obrigatória",
        description: "Por favor, insira a URL da imagem do atendente.",
        variant: "destructive",
      });
      return;
    }

    if (!editingAttendant) return;

    editAttendantMutation.mutate({
      id: editingAttendant.id,
      name: editName,
      imageUrl: editImage,
    });
  };

  const handleDeleteAttendant = (id: number) => {
    if (window.confirm("Tem certeza que deseja remover este atendente?")) {
      deleteAttendantMutation.mutate(id);
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
        {/* Attendants Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <Users className="text-info" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-primary-light">Gerenciar Atendentes</h2>
              <p className="text-secondary-light">Cadastre e gerencie sua equipe de vendas</p>
            </div>
          </div>
          
          <Dialog open={isNewAttendantDialogOpen} onOpenChange={setIsNewAttendantDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-success text-primary-light hover:bg-success-dark">
                <Plus size={18} className="mr-2" />
                Novo Atendente
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-primary-light">
              <DialogHeader>
                <DialogTitle className="text-primary-light">Adicionar Novo Atendente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-secondary-light">Nome</Label>
                  <Input
                    id="name"
                    value={newAttendantName}
                    onChange={(e) => setNewAttendantName(e.target.value)}
                    placeholder="Nome do atendente"
                    className="bg-input border-border text-primary-light placeholder:text-muted-light"
                  />
                </div>
                <div>
                  <Label htmlFor="imageUrl" className="text-secondary-light">URL da Imagem</Label>
                  <Input
                    id="imageUrl"
                    value={newAttendantImage}
                    onChange={(e) => setNewAttendantImage(e.target.value)}
                    placeholder="https://..."
                    className="bg-input border-border text-primary-light placeholder:text-muted-light"
                  />
                </div>
                <Button 
                  onClick={handleCreateAttendant}
                  disabled={createAttendantMutation.isPending}
                  className="w-full bg-success text-primary-light hover:bg-success-dark"
                >
                  {createAttendantMutation.isPending ? "Criando..." : "Criar Atendente"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Attendants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attendantsWithStats.map((attendant) => (
            <Card key={attendant.id} className="bg-card border-border">
              <CardContent className="p-6">
                {/* Attendant Header */}
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src={attendant.imageUrl}
                    alt={attendant.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-border"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-primary-light">{attendant.name}</h3>
                    <p className="text-sm text-secondary-light">Total R$ {attendant.totalValue.toFixed(2)}</p>
                  </div>
                </div>

                {/* Statistics */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-light">Vendas</span>
                    <span className="font-medium text-primary-light">{attendant.totalSales}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-light">Faturamento</span>
                    <span className="font-medium text-success">R$ {attendant.totalValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-light">Ticket Médio</span>
                    <span className="font-medium text-warning">R$ {attendant.averageTicket.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-light">Meta Mensal</span>
                    <span className="font-medium text-info">R$ {attendant.thisMonthTarget.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-light">Progresso Mensal</span>
                    <span className="font-medium text-secondary-light">{attendant.targetCompletion.toFixed(0)}%</span>
                  </div>
                </div>

                {/* Performance Icons */}
                <div className="flex gap-3 mb-4">
                  <div className="flex items-center gap-1 text-success">
                    <TrendingUp size={16} />
                    <span className="text-xs">Vendas</span>
                  </div>
                  <div className="flex items-center gap-1 text-info">
                    <BarChart3 size={16} />
                    <span className="text-xs">Desempenho</span>
                  </div>
                  <div className="flex items-center gap-1 text-warning">
                    <Target size={16} />
                    <span className="text-xs">Meta</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-border text-secondary-light hover:text-primary-light hover:border-success"
                    onClick={() => handleEditAttendant(attendant)}
                  >
                    <Edit size={14} className="mr-1" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-danger text-danger hover:bg-danger hover:text-primary-light"
                    onClick={() => handleDeleteAttendant(attendant.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Edit Attendant Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card border-border text-primary-light">
          <DialogHeader>
            <DialogTitle className="text-primary-light">Editar Atendente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editName" className="text-secondary-light">Nome</Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nome do atendente"
                className="bg-input border-border text-primary-light placeholder:text-muted-light"
              />
            </div>
            <div>
              <Label htmlFor="editImageUrl" className="text-secondary-light">URL da Imagem</Label>
              <Input
                id="editImageUrl"
                value={editImage}
                onChange={(e) => setEditImage(e.target.value)}
                placeholder="https://..."
                className="bg-input border-border text-primary-light placeholder:text-muted-light"
              />
            </div>
            {editImage && (
              <div className="flex justify-center">
                <img 
                  src={editImage} 
                  alt="Preview" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-border"
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1 border-border text-secondary-light"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleUpdateAttendant}
                disabled={editAttendantMutation.isPending}
                className="flex-1 bg-success text-primary-light hover:bg-success-dark"
              >
                {editAttendantMutation.isPending ? "Atualizando..." : "Atualizar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}