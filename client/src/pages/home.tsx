import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { DollarSign } from "lucide-react";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import type { Attendant } from "@shared/schema";

export default function Home() {
  const [selectedAttendant, setSelectedAttendant] = useState<number | null>(null);
  const [saleValue, setSaleValue] = useState("");
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
        title: "Venda registrada com sucesso!",
        description: "A venda foi registrada e os ganhos foram atualizados.",
      });
      setSaleValue("");
      setSelectedAttendant(null);
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

  const handleRegisterSale = () => {
    if (!selectedAttendant) {
      toast({
        title: "Selecione um atendente",
        description: "Por favor, selecione um atendente antes de registrar a venda.",
        variant: "destructive",
      });
      return;
    }

    const value = parseFloat(saleValue);
    if (!value || value <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor válido para a venda.",
        variant: "destructive",
      });
      return;
    }

    createSaleMutation.mutate({
      attendantId: selectedAttendant,
      value: saleValue,
    });
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

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Sales Registration */}
        <Card className="mb-8 bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="text-success" size={24} />
              <h2 className="text-2xl font-bold text-primary-light">Registrar Nova Venda</h2>
            </div>
            <p className="text-secondary-light mb-6">Selecione quem está vendendo e registre a venda</p>
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor="saleValue" className="text-sm font-medium text-secondary-light mb-2">
                  Valor da Venda (R$)
                </Label>
                <Input
                  id="saleValue"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={saleValue}
                  onChange={(e) => setSaleValue(e.target.value)}
                  className="w-full bg-input border-border text-primary-light placeholder:text-muted-light"
                />
              </div>
              <Button 
                onClick={handleRegisterSale}
                disabled={createSaleMutation.isPending}
                className="bg-success text-primary-light hover:bg-success-dark disabled:opacity-50"
              >
                {createSaleMutation.isPending ? "Registrando..." : "Registrar Venda"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attendant Selection */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-primary-light mb-6">Selecione o Atendente</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attendants?.map((attendant) => (
                <div
                  key={attendant.id}
                  className={`bg-secondary-dark rounded-xl p-6 border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedAttendant === attendant.id
                      ? 'border-success bg-success/10'
                      : 'border-border hover:border-success/50'
                  }`}
                  onClick={() => setSelectedAttendant(attendant.id)}
                >
                  <div className="text-center">
                    <img 
                      src={attendant.imageUrl}
                      alt={attendant.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-border shadow-md"
                    />
                    <h4 className="text-lg font-semibold text-primary-light mb-2">{attendant.name}</h4>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      parseFloat(attendant.earnings) > 0
                        ? 'bg-success/20 text-success'
                        : 'bg-border text-muted-light'
                    }`}>
                      R$ {parseFloat(attendant.earnings).toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
