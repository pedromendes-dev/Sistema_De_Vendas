import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, Trophy, Calendar, Clock, TrendingUp, Award, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import type { Goal, Attendant, Achievement } from "@shared/schema";

export default function GoalsPage() {
  const [isNewGoalDialogOpen, setIsNewGoalDialogOpen] = useState(false);
  const [selectedAttendant, setSelectedAttendant] = useState<string>("");
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    targetValue: "",
    goalType: "",
    startDate: "",
    endDate: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: goals, isLoading: loadingGoals } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const { data: attendants, isLoading: loadingAttendants } = useQuery<Attendant[]>({
    queryKey: ["/api/attendants"],
  });

  const { data: achievements, isLoading: loadingAchievements } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  const isLoading = loadingGoals || loadingAttendants || loadingAchievements;

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (goalData: any) => {
      const response = await apiRequest("POST", "/api/goals", {
        attendantId: parseInt(goalData.attendantId),
        title: goalData.title,
        description: goalData.description,
        targetValue: goalData.targetValue,
        goalType: goalData.goalType,
        startDate: new Date(goalData.startDate),
        endDate: new Date(goalData.endDate),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Meta criada com sucesso!",
        description: "A nova meta foi definida para o atendente.",
      });
      setNewGoal({
        title: "",
        description: "",
        targetValue: "",
        goalType: "",
        startDate: "",
        endDate: "",
      });
      setSelectedAttendant("");
      setIsNewGoalDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
    onError: () => {
      toast({
        title: "Erro ao criar meta",
        description: "Ocorreu um erro ao criar a meta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Deactivate goal mutation
  const deactivateGoalMutation = useMutation({
    mutationFn: async (goalId: number) => {
      const response = await apiRequest("PUT", `/api/goals/${goalId}/deactivate`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Meta finalizada!",
        description: "A meta foi marcada como finalizada.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
    onError: () => {
      toast({
        title: "Erro ao finalizar meta",
        description: "Ocorreu um erro ao finalizar a meta.",
        variant: "destructive",
      });
    },
  });

  const handleCreateGoal = () => {
    if (!selectedAttendant || !newGoal.title || !newGoal.targetValue || !newGoal.goalType || !newGoal.startDate || !newGoal.endDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    createGoalMutation.mutate({
      ...newGoal,
      attendantId: selectedAttendant,
    });
  };

  const getAttendantName = (attendantId: number) => {
    return attendants?.find(a => a.id === attendantId)?.name || "Desconhecido";
  };

  const getGoalTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      daily: "Diária",
      weekly: "Semanal",
      monthly: "Mensal",
      quarterly: "Trimestral",
      yearly: "Anual",
    };
    return types[type] || type;
  };

  const getGoalProgress = (goal: Goal) => {
    const current = parseFloat(goal.currentValue);
    const target = parseFloat(goal.targetValue);
    return target > 0 ? (current / target) * 100 : 0;
  };

  const getGoalStatus = (goal: Goal) => {
    const now = new Date();
    const endDate = new Date(goal.endDate);
    const progress = getGoalProgress(goal);
    
    if (!goal.isActive) return "Finalizada";
    if (now > endDate) return "Vencida";
    if (progress >= 100) return "Concluída";
    return "Em andamento";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluída": return "bg-success text-primary-light";
      case "Em andamento": return "bg-info text-primary-light";
      case "Vencida": return "bg-danger text-primary-light";
      case "Finalizada": return "bg-secondary-light text-primary-light";
      default: return "bg-muted-light text-primary-light";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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

      <main className="mobile-safe max-w-6xl py-4 sm:py-6 lg:py-8">
        {/* Goals Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <Target className="text-success" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-primary-light">Metas e Conquistas</h2>
              <p className="text-secondary-light">Defina e acompanhe as metas da sua equipe</p>
            </div>
          </div>
          
          <Dialog open={isNewGoalDialogOpen} onOpenChange={setIsNewGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-success text-primary-light hover:bg-success-dark">
                <Plus size={18} className="mr-2" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-primary-light max-w-md">
              <DialogHeader>
                <DialogTitle className="text-primary-light">Criar Nova Meta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="attendant" className="text-secondary-light">Atendente</Label>
                  <Select value={selectedAttendant} onValueChange={setSelectedAttendant}>
                    <SelectTrigger className="bg-input border-border text-primary-light">
                      <SelectValue placeholder="Selecione o atendente" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {attendants?.map(attendant => (
                        <SelectItem key={attendant.id} value={attendant.id.toString()}>
                          {attendant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="title" className="text-secondary-light">Título da Meta</Label>
                  <Input
                    id="title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                    placeholder="Ex: Vendas do mês"
                    className="bg-input border-border text-primary-light placeholder:text-muted-light"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-secondary-light">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                    placeholder="Descreva a meta..."
                    className="bg-input border-border text-primary-light placeholder:text-muted-light"
                  />
                </div>

                <div>
                  <Label htmlFor="targetValue" className="text-secondary-light">Valor da Meta (R$)</Label>
                  <Input
                    id="targetValue"
                    type="number"
                    step="0.01"
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal({...newGoal, targetValue: e.target.value})}
                    placeholder="0.00"
                    className="bg-input border-border text-primary-light placeholder:text-muted-light"
                  />
                </div>

                <div>
                  <Label htmlFor="goalType" className="text-secondary-light">Tipo de Meta</Label>
                  <Select value={newGoal.goalType} onValueChange={(value) => setNewGoal({...newGoal, goalType: value})}>
                    <SelectTrigger className="bg-input border-border text-primary-light">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="daily">Diária</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="text-secondary-light">Data de Início</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newGoal.startDate}
                      onChange={(e) => setNewGoal({...newGoal, startDate: e.target.value})}
                      className="bg-input border-border text-primary-light"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-secondary-light">Data de Fim</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newGoal.endDate}
                      onChange={(e) => setNewGoal({...newGoal, endDate: e.target.value})}
                      className="bg-input border-border text-primary-light"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleCreateGoal}
                  disabled={createGoalMutation.isPending}
                  className="w-full bg-success text-primary-light hover:bg-success-dark"
                >
                  {createGoalMutation.isPending ? "Criando..." : "Criar Meta"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Goals List */}
        <div className="space-y-4 mb-8">
          {goals?.map((goal) => {
            const progress = getGoalProgress(goal);
            const status = getGoalStatus(goal);
            
            return (
              <Card key={goal.id} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-primary-light">{goal.title}</h3>
                        <Badge className={getStatusColor(status)}>{status}</Badge>
                        <Badge variant="outline" className="text-info border-info">
                          {getGoalTypeLabel(goal.goalType)}
                        </Badge>
                      </div>
                      <p className="text-secondary-light mb-2">{goal.description}</p>
                      <div className="flex items-center gap-4 text-sm text-secondary-light">
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          {formatDate(goal.startDate)} - {formatDate(goal.endDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Target size={16} />
                          {getAttendantName(goal.attendantId)}
                        </div>
                      </div>
                    </div>
                    
                    {goal.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deactivateGoalMutation.mutate(goal.id)}
                        disabled={deactivateGoalMutation.isPending}
                        className="border-danger text-danger hover:bg-danger hover:text-primary-light"
                      >
                        <XCircle size={16} className="mr-1" />
                        Finalizar
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-light">Progresso</span>
                      <span className="text-primary-light font-semibold">
                        R$ {parseFloat(goal.currentValue).toFixed(2)} / R$ {parseFloat(goal.targetValue).toFixed(2)}
                      </span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <div className="text-right text-sm text-secondary-light">
                      {progress.toFixed(1)}% concluído
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Achievements */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="text-gold" size={24} />
            <h3 className="text-xl font-bold text-primary-light">Conquistas Recentes</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements?.slice(0, 6).map((achievement) => (
              <Card key={achievement.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: achievement.badgeColor }}
                    >
                      {achievement.icon === "trophy" && <Trophy size={20} />}
                      {achievement.icon === "target" && <Target size={20} />}
                      {achievement.icon === "award" && <Award size={20} />}
                      {achievement.icon === "check" && <CheckCircle size={20} />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-primary-light">{achievement.title}</h4>
                      <p className="text-sm text-secondary-light">{getAttendantName(achievement.attendantId)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-secondary-light mb-2">{achievement.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-light">
                      {formatDate(achievement.achievedAt)}
                    </span>
                    <div className="flex items-center gap-1 text-gold">
                      <TrendingUp size={14} />
                      <span className="text-sm font-semibold">+{achievement.pointsAwarded} pts</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}