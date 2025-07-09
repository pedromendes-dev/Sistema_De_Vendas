import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AlertTriangle, DollarSign } from "lucide-react";
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

  const getCurrentDate = () => {
    const now = new Date();
    const days = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    
    return `${dayName}, ${day} de ${month} de ${year}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-lg text-neutral-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">💰 Sistema de Vendas</h1>
              <p className="text-lg text-neutral-600 font-medium">Painel Gamificado de Controle de Vendas</p>
            </div>
            <Button 
              className="bg-primary text-white hover:bg-blue-600"
              onClick={() => toast({
                title: "Funcionalidade em desenvolvimento",
                description: "A conexão com Supabase será implementada em breve.",
              })}
            >
              Connect to Supabase
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Date Display */}
        <div className="mb-6">
          <p className="text-lg text-neutral-700 font-medium">{getCurrentDate()}</p>
        </div>

        {/* Demo Warning Banner */}
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-8 flex items-start gap-3">
          <AlertTriangle className="text-warning text-xl mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-neutral-800 mb-1">Modo Demonstração</h3>
            <p className="text-neutral-700">Para usar todas as funcionalidades, configure o Supabase clicando em "Connect to Supabase" no canto superior direito.</p>
          </div>
        </div>

        {/* Sales Registration */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="text-success" size={24} />
              <h2 className="text-2xl font-bold text-neutral-800">Registrar Nova Venda</h2>
            </div>
            <p className="text-neutral-600 mb-6">Selecione quem está vendendo e registre a venda</p>
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor="saleValue" className="text-sm font-medium text-neutral-700 mb-2">
                  Valor da Venda (R$)
                </Label>
                <Input
                  id="saleValue"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={saleValue}
                  onChange={(e) => setSaleValue(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button 
                onClick={handleRegisterSale}
                disabled={createSaleMutation.isPending}
                className="bg-success text-white hover:bg-green-600 disabled:opacity-50"
              >
                {createSaleMutation.isPending ? "Registrando..." : "Registrar Venda"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attendant Selection */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-neutral-800 mb-6">Selecione o Atendente</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attendants?.map((attendant) => (
                <div
                  key={attendant.id}
                  className={`bg-neutral-50 rounded-xl p-6 border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedAttendant === attendant.id
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent hover:border-primary'
                  }`}
                  onClick={() => setSelectedAttendant(attendant.id)}
                >
                  <div className="text-center">
                    <img 
                      src={attendant.imageUrl}
                      alt={attendant.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-md"
                    />
                    <h4 className="text-lg font-semibold text-neutral-800 mb-2">{attendant.name}</h4>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      parseFloat(attendant.earnings) > 0
                        ? 'bg-success/10 text-success'
                        : 'bg-neutral-200 text-neutral-600'
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
