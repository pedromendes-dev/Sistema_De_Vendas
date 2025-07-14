import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ModernHeader from "@/components/ModernHeader";
import Navigation from "@/components/Navigation";
import AttendantCard from "@/components/AttendantCard";
import DashboardStats from "@/components/DashboardStats";
// import QuickStartGuide from '@/components/QuickStartGuide';
import type { Attendant } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch attendants
  const { data: attendants, isLoading } = useQuery<Attendant[]>({
    queryKey: ["/api/attendants"],
  });

  // Create sale mutation
  const createSaleMutation = useMutation({
    mutationFn: async (data: { attendantId: number; value: string }) => {
      const response = await apiRequest("POST", "/api/sales", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "🎉 Venda registrada!",
        description: "A venda foi registrada e os ganhos foram atualizados.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/attendants"] });
    },
    onError: () => {
      toast({
        title: "Erro ao registrar venda",
        description: "Ocorreu um erro ao registrar a venda. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSaleSubmit = (attendantId: number, value: string) => {
    createSaleMutation.mutate({ attendantId, value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary-dark to-secondary-dark/50 constrain-width">
      <ModernHeader />
      <Navigation />

      <main className="universal-container pb-20 sm:pb-8 pt-4 sm:pt-6 constrain-width">
        {/* Mobile Header */}
        <div className="sm:hidden mb-4 space-adaptive">
          <h1 className="text-fluid-xl font-bold text-primary-light mb-1">Sistema de Vendas</h1>
          <p className="text-fluid-sm text-secondary-light">Registre suas vendas rapidamente</p>
        </div>

        {/* Dashboard Statistics - Universal Responsive */}
        <div className="mb-4 sm:mb-6">
          <DashboardStats />
        </div>

        {/* Quick Action Section for Mobile */}
        <div className="sm:hidden mb-4 space-adaptive">
          <div className="bg-gradient-to-r from-success/10 to-info/10 border border-success/20 card-adaptive">
            <h3 className="text-fluid-lg font-semibold text-primary-light mb-2">🚀 Ação Rápida</h3>
            <p className="text-fluid-sm text-secondary-light mb-3">Toque em um atendente abaixo para registrar uma venda</p>
            <div className="flex items-center gap-2 text-fluid-xs text-success">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span>{attendants?.length || 0} atendentes disponíveis</span>
            </div>
          </div>
        </div>

        {/* Sales Registration */}
        {!isLoading && (
          <div className="mb-8">
            {/* Desktop Header */}
            <div className="hidden sm:flex items-center justify-between mb-6 space-adaptive">
              <div>
                <h2 className="text-fluid-2xl font-bold text-primary-light mb-2">Registrar Vendas</h2>
                <p className="text-fluid-base text-secondary-light">Selecione um atendente para registrar uma nova venda</p>
              </div>
            </div>

            {/* Universal Responsive Grid */}
            <div className="grid-adaptive constrain-width">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="bg-card border-border hover:border-primary/20 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="space-y-4 animate-pulse">
                        <div className="w-20 h-20 bg-accent rounded-full mx-auto" />
                        <div className="h-4 bg-accent rounded mx-auto w-3/4" />
                        <div className="h-3 bg-accent rounded mx-auto w-1/2" />
                        <div className="h-10 bg-accent rounded" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                attendants?.map((attendant: Attendant, index) => (
                  <div 
                    key={attendant.id} 
                    className="transform transition-all duration-300 hover:scale-105"
                    style={{ 
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <AttendantCard 
                      attendant={attendant} 
                      onSaleSubmit={handleSaleSubmit}
                      isLoading={createSaleMutation.isPending}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>


    </div>
  );
}