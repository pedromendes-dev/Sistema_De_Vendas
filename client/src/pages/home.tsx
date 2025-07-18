import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ModernHeader from "@/components/ModernHeader";
import Navigation from "@/components/Navigation";
import AttendantCard from "@/components/AttendantCard";
import DashboardStats from "@/components/DashboardStats";
import PageLoader from "@/components/PageLoader";
import { AdaptivePage, AdaptiveSection } from "@/components/AdaptiveContainer";
import { AdaptiveAttendantGrid } from "@/components/AdaptiveGrid";
import { useScreenAdapter } from "@/hooks/useScreenAdapter";
// import QuickStartGuide from '@/components/QuickStartGuide';
import type { Attendant } from "@shared/schema";
import { playSaleSound } from "@/utils/sound-effects";

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { metrics, classes, breakpoint } = useScreenAdapter();

  // Fetch attendants
  const { data: attendants, isLoading } = useQuery<Attendant[]>({
    queryKey: ["/api/attendants"],
  });

  // Create sale mutation
  const createSaleMutation = useMutation({
    mutationFn: async (data: { attendantId: number; value: string; clientName?: string; clientPhone?: string; clientEmail?: string }) => {
      const response = await apiRequest("POST", "/api/sales", data);
      return response.json();
    },
    onSuccess: () => {
      // Tocar som de caixa registradora
      playSaleSound();
      
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

  const handleSaleSubmit = (attendantId: number, value: string, clientData?: { name?: string; phone?: string; email?: string }) => {
    createSaleMutation.mutate({ 
      attendantId, 
      value, 
      clientName: clientData?.name,
      clientPhone: clientData?.phone,
      clientEmail: clientData?.email
    });
  };

  if (isLoading) {
    return <PageLoader message="Carregando atendentes..." />;
  }

  return (
    <AdaptivePage className="min-h-screen bg-gradient-to-br from-primary-dark via-primary-dark to-secondary-dark/50">
      <ModernHeader />
      <Navigation />

      <AdaptiveSection className="pb-20 sm:pb-8 pt-4 sm:pt-6">
        {/* Intelligent Mobile Header */}
        <div className={`${metrics.deviceType === 'mobile' ? 'block' : 'hidden'} mb-4 ${classes.spacing}`}>
          <h1 className={`${classes.text.replace('-sm', '-xl')} font-bold text-primary-light mb-1`}>Sistema de Vendas</h1>
          <p className={`${classes.text} text-secondary-light`}>Registre suas vendas rapidamente</p>
        </div>

        {/* Intelligent Dashboard Statistics */}
        <AdaptiveSection padding="small" className="mb-4 sm:mb-6">
          <DashboardStats />
        </AdaptiveSection>

        {/* Smart Quick Action for Touch Devices */}
        {metrics.touchSupport && metrics.deviceType === 'mobile' && (
          <AdaptiveSection padding="small" className="mb-4">
            <div className={`bg-gradient-to-r from-success/10 to-info/10 border border-success/20 ${classes.card}`}>
              <h3 className={`${classes.text.replace('-sm', '-lg')} font-semibold text-primary-light mb-2`}>🚀 Ação Rápida</h3>
              <p className={`${classes.text} text-secondary-light mb-3`}>Toque em um atendente abaixo para registrar uma venda</p>
              <div className={`flex items-center gap-2 ${classes.text.replace('-sm', '-xs')} text-success`}>
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span>{attendants?.length || 0} atendentes disponíveis</span>
              </div>
            </div>
          </AdaptiveSection>
        )}

        {/* Intelligent Sales Registration */}
        {!isLoading && (
          <AdaptiveSection className="mb-8">
            {/* Adaptive Desktop Header */}
            <div className={`${metrics.deviceType !== 'mobile' ? 'flex' : 'hidden'} items-center justify-between mb-6 ${classes.spacing}`}>
              <div>
                <h2 className={`${classes.text.replace('-sm', '-2xl')} font-bold text-primary-light mb-2`}>Registrar Vendas</h2>
                <p className={`${classes.text} text-secondary-light`}>Selecione um atendente para registrar uma nova venda</p>
              </div>
            </div>

            {/* Intelligent Adaptive Grid */}
            <AdaptiveAttendantGrid>
              {isLoading ? (
                Array.from({ length: metrics.deviceType === 'mobile' ? 2 : 6 }).map((_, i) => (
                  <Card key={i} className="bg-card border-border hover:border-primary/20 transition-all duration-300">
                    <CardContent className={classes.spacing}>
                      <div className="space-y-4 animate-pulse">
                        <div className={`w-20 h-20 bg-accent rounded-full mx-auto ${metrics.density === 'ultra' ? 'w-24 h-24' : ''}`} />
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
                    className={`transform transition-all duration-300 ${metrics.touchSupport ? 'active:scale-95' : 'hover:scale-105'}`}
                    style={{ 
                      animation: `fadeInUp 0.6s ease-out ${index * (metrics.deviceType === 'mobile' ? 0.2 : 0.1)}s both`
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
            </AdaptiveAttendantGrid>
          </AdaptiveSection>
        )}
      </AdaptiveSection>
    </AdaptivePage>
  );
}