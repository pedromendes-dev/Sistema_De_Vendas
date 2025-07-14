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
    <Card className="bg-gradient-to-br from-card to-card/80 border-border hover:border-success/50 transition-all duration-300 shadow-lg hover:shadow-xl group backdrop-blur-sm h-full active:scale-95 touch-manipulation">
      <CardContent className="p-4 sm:p-6 text-center space-y-4 sm:space-y-6 h-full flex flex-col">

        {/* Avatar Section - Mobile Optimized */}
        <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
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
                <User className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-secondary-light" />
              </div>
            )}
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-success to-info rounded-full border-2 border-card shadow-md animate-pulse"></div>
        </div>

        {/* Info Section - Mobile Optimized */}
        <div className="space-y-2 sm:space-y-3">
          <h3 className="text-base sm:text-lg font-bold text-primary-light group-hover:text-success transition-colors duration-300 leading-tight">
            {attendant.name}
          </h3>
          <div className="bg-accent/30 rounded-lg p-2 sm:p-3 border border-border/50">
            <p className="text-xs sm:text-sm text-secondary-light mb-1">Faturamento</p>
            <p className="text-lg sm:text-xl font-bold text-success flex items-center justify-center gap-1">
              <DollarSign size={16} className="sm:hidden" />
              <DollarSign size={20} className="hidden sm:block" />
              <span className="text-sm sm:text-lg">R$ {Number(attendant.earnings || 0).toFixed(2)}</span>
            </p>
          </div>
        </div>

        {/* Sale Form - Mobile Optimized */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 flex-1 flex flex-col justify-end">
          <div className="space-y-2">
            <Label htmlFor={`sale-${attendant.id}`} className="text-secondary-light text-xs sm:text-sm">
              Nova Venda
            </Label>
            <div className="relative">
              <DollarSign size={16} className="sm:hidden absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-light" />
              <DollarSign size={18} className="hidden sm:block absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-light" />
              <Input
                id={`sale-${attendant.id}`}
                type="number"
                step="0.01"
                min="0"
                value={saleValue}
                onChange={(e) => setSaleValue(e.target.value)}
                placeholder="0,00"
                className="pl-10 bg-input border-border text-primary-light text-center text-base sm:text-lg focus:ring-2 focus:ring-success/50 focus:border-success transition-all duration-200 h-10 sm:h-11"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={!saleValue || isLoading}
            className="w-full bg-gradient-to-r from-success to-info hover:from-success/90 hover:to-info/90 text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 text-sm sm:text-base touch-manipulation"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                <span className="text-xs sm:text-sm">Registrando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus size={16} className="sm:hidden" />
                <Plus size={18} className="hidden sm:block" />
                <span className="text-xs sm:text-sm">Registrar Venda</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}