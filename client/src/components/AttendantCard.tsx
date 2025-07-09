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
    <Card className="bg-card border-border hover:border-success/50 transition-all duration-200 h-full w-full">
      <CardHeader className="text-center p-3 sm:p-4 lg:p-6">
        <div className="relative mx-auto mb-3 sm:mb-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden bg-secondary-dark border-2 border-success/20 mx-auto">
            {attendant.imageUrl ? (
              <img 
                src={attendant.imageUrl} 
                alt={attendant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-secondary-light" />
              </div>
            )}
          </div>
        </div>
        <CardTitle className="text-base sm:text-lg lg:text-xl font-bold text-primary-light truncate">
          {attendant.name}
        </CardTitle>
        <div className="flex items-center justify-center gap-1 sm:gap-2 text-success">
          <DollarSign size={14} className="sm:w-4 sm:h-4" />
          <span className="text-base sm:text-lg lg:text-xl font-bold">
            R$ {parseFloat(attendant.earnings).toFixed(2)}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`sale-${attendant.id}`} className="text-primary-light text-xs sm:text-sm">
              Valor da Venda
            </Label>
            <Input
              id={`sale-${attendant.id}`}
              type="number"
              step="0.01"
              min="0"
              value={saleValue}
              onChange={(e) => setSaleValue(e.target.value)}
              placeholder="0.00"
              className="bg-secondary-dark border-gray-600 text-primary-light text-center text-base sm:text-lg lg:text-xl h-10 sm:h-11 lg:h-12"
              disabled={isLoading}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-success hover:bg-success-dark text-white font-medium py-2 sm:py-3 text-xs sm:text-sm lg:text-base"
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