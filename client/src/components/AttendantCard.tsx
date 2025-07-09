import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, User, TrendingUp, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Attendant } from "@shared/schema";

interface AttendantCardProps {
  attendant: Attendant;
  onSaleSubmit: (attendantId: number, value: string) => void;
  isLoading: boolean;
}

export default function AttendantCard({ attendant, onSaleSubmit, isLoading }: AttendantCardProps) {
  const [saleValue, setSaleValue] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!saleValue || parseFloat(saleValue) <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor válido",
        variant: "destructive",
      });
      return;
    }

    onSaleSubmit(attendant.id, saleValue);
    setSaleValue("");
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border hover:border-success/50 transition-all duration-500 shadow-lg hover:shadow-2xl group backdrop-blur-sm h-full">
      <CardContent className="p-6 text-center space-y-6 h-full flex flex-col">
        
        {/* Avatar Section */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-gradient-to-r from-success to-info rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
          <div className="relative w-full h-full rounded-full overflow-hidden shadow-xl ring-4 ring-success/20 group-hover:ring-success/60 transition-all duration-500 group-hover:scale-110">
            {attendant.imageUrl ? (
              <img 
                src={attendant.imageUrl} 
                alt={attendant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-accent flex items-center justify-center">
                <User className="w-10 h-10 text-secondary-light" />
              </div>
            )}
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-success to-info rounded-full border-3 border-card shadow-lg animate-pulse"></div>
        </div>
        
        {/* Info Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-primary-light group-hover:text-success transition-colors duration-300">
            {attendant.name}
          </h3>
          <div className="bg-accent/30 rounded-lg p-3 border border-border/50">
            <p className="text-sm text-secondary-light mb-1">Faturamento Total</p>
            <p className="text-xl font-bold text-success flex items-center justify-center gap-1">
              <DollarSign size={20} />
              R$ {Number(attendant.earnings || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Sale Form */}
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col justify-end">
          <div className="space-y-2">
            <Label htmlFor={`sale-${attendant.id}`} className="text-secondary-light text-sm">
              Nova Venda
            </Label>
            <div className="relative">
              <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-light" />
              <Input
                id={`sale-${attendant.id}`}
                type="number"
                step="0.01"
                min="0"
                value={saleValue}
                onChange={(e) => setSaleValue(e.target.value)}
                placeholder="0,00"
                className="pl-10 bg-input border-border text-primary-light text-center text-lg focus:ring-2 focus:ring-success/50 focus:border-success transition-all duration-200"
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={!saleValue || isLoading}
            className="w-full bg-gradient-to-r from-success to-info hover:from-success/90 hover:to-info/90 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Registrando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus size={18} />
                Registrar Venda
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}