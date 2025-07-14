import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, User } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSaleSound } from "@/hooks/useSaleSound";
import { useToast } from "@/hooks/use-toast";
import type { Attendant } from "@shared/schema";

interface AttendantCardProps {
  attendant: Attendant;
  onSaleSubmit: (attendantId: number, value: string) => void;
  isLoading: boolean;
}

export default function AttendantCard({ 
  attendant, 
  onSaleSubmit, 
  isLoading = false 
}: AttendantCardProps) {
  const [saleValue, setSaleValue] = useState("");
  const { playSaleSound } = useSaleSound();
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
    playSaleSound(); // Tocar som de venda
    setSaleValue("");
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border hover:border-success/50 transition-all duration-300 shadow-lg hover:shadow-xl group backdrop-blur-sm h-full active:scale-95 touch-adaptive card-adaptive constrain-width">
      <CardContent className="space-adaptive text-center h-full flex flex-col">

        {/* Avatar Section - Universal Responsive */}
        <div className="relative mx-auto avatar-adaptive mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-success to-info rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
          <div className="relative w-full h-full rounded-full overflow-hidden shadow-lg ring-2 ring-success/20 group-hover:ring-success/40 transition-all duration-300 active:scale-95">
            {attendant.imageUrl ? (
              <img 
                src={attendant.imageUrl} 
                alt={attendant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-accent flex items-center justify-center">
                <User className="icon-adaptive text-secondary-light" />
              </div>
            )}
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-success to-info rounded-full border-2 border-card shadow-md animate-pulse"></div>
        </div>

        {/* Info Section - Universal Responsive */}
        <div className="mb-4">
          <h3 className="text-fluid-lg font-bold text-primary-light group-hover:text-success transition-colors duration-300 leading-tight mb-2">
            {attendant.name}
          </h3>
          <div className="bg-accent/30 card-adaptive border border-border/50">
            <p className="text-fluid-xs text-secondary-light mb-1">Faturamento</p>
            <p className="text-fluid-lg font-bold text-success flex items-center justify-center gap-1">
              <DollarSign className="icon-adaptive" />
              <span>R$ {Number(attendant.earnings || 0).toFixed(2)}</span>
            </p>
          </div>
        </div>

        {/* Sale Form - Universal Responsive */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-end space-y-3">
          <div className="space-y-2">
            <Label htmlFor={`sale-${attendant.id}`} className="text-secondary-light text-fluid-xs">
              Nova Venda
            </Label>
            <div className="relative">
              <DollarSign className="icon-adaptive absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-light" />
              <Input
                id={`sale-${attendant.id}`}
                type="number"
                step="0.01"
                min="0"
                value={saleValue}
                onChange={(e) => setSaleValue(e.target.value)}
                placeholder="0,00"
                className="input-adaptive pl-10 bg-input border-border text-primary-light text-center focus:ring-2 focus:ring-success/50 focus:border-success transition-all duration-200"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={!saleValue || isLoading}
            className="btn-adaptive w-full bg-gradient-to-r from-success to-info hover:from-success/90 hover:to-info/90 text-white font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 touch-adaptive"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span className="text-fluid-xs">Registrando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus className="icon-adaptive" />
                <span className="text-fluid-xs">Registrar Venda</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}