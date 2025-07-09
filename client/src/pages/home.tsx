import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import AttendantCard from "@/components/AttendantCard";
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
    <div className="min-h-screen bg-primary-dark mobile-container">
      <Header />
      <Navigation />

      <main className="mobile-safe max-w-6xl py-4 sm:py-6 lg:py-8">
        <div className="grid-mobile-center w-full">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-card border-border w-full max-w-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-700 rounded-full mx-auto animate-pulse" />
                    <div className="h-4 bg-gray-700 rounded animate-pulse" />
                    <div className="h-3 bg-gray-700 rounded animate-pulse w-3/4 mx-auto" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            attendants?.map((attendant: Attendant) => (
              <div key={attendant.id} className="w-full max-w-sm">
                <AttendantCard 
                  attendant={attendant} 
                  onSaleSubmit={handleSaleSubmit}
                  isLoading={createSaleMutation.isPending}
                />
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}