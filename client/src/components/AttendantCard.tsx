import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, User, TrendingUp } from "lucide-react";
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
    <Card className="mobile-native-card hover:border-success/50 transition-all duration-200 h-full w-full mobile-flutter-scale mobile-lazy-load">
      <CardHeader className="text-center p-responsive mobile-touch-optimized mobile-native-text">
        <div className="relative mx-auto mb-3 sm:mb-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden bg-secondary-dark border-2 border-success/20 mx-auto mobile-gpu-accelerated">
            {attendant.imageUrl ? (
              <img 
                src={attendant.imageUrl} 
                alt={attendant.name}
                className="w-full h-full object-cover mobile-gpu-accelerated"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-secondary-light" />
              </div>
            )}
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-card animate-pulse"></div>
        </div>
        <CardTitle className="text-responsive-xl font-bold text-primary-light truncate mobile-text-optimized">
          {attendant.name}
        </CardTitle>
        <div className="flex items-center justify-center gap-1 sm:gap-2 text-success">
          <DollarSign size={14} className="sm:w-4 sm:h-4" />
          <span className="text-responsive-xl font-bold mobile-text-optimized">
            R$ {parseFloat(attendant.earnings).toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-center gap-2 mt-2 text-xs text-secondary-light">
          <div className="w-2 h-2 bg-success rounded-full"></div>
          <span>Online</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-responsive mobile-touch-optimized">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`sale-${attendant.id}`} className="text-primary-light text-xs sm:text-sm mobile-text-optimized">
              Valor da Venda
            </Label>
            <div className="relative">
              <Input
                id={`sale-${attendant.id}`}
                type="number"
                step="0.01"
                min="0"
                value={saleValue}
                onChange={(e) => setSaleValue(e.target.value)}
                placeholder="0.00"
                className="
                  bg-secondary-dark 
                  border-gray-600 
                  text-primary-light 
                  text-center 
                  text-responsive-xl 
                  input-responsive
                  mobile-native-input
                  mobile-native-text
                  pl-8
                  focus:ring-2 
                  focus:ring-success/50 
                  focus:border-success
                  transition-all
                  duration-200
                "
                disabled={isLoading}
                autoComplete="off"
                inputMode="decimal"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-success font-semibold">
                R$
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="
              w-full 
              bg-success 
              hover:bg-success-dark 
              text-white 
              font-semibold 
              button-responsive
              mobile-native-button
              mobile-haptic-feedback
              mobile-native-text
              shadow-lg
              hover:shadow-xl
              active:shadow-md
              transition-all
              duration-200
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="text-xs sm:text-sm">Registrando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Registrar Venda</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}