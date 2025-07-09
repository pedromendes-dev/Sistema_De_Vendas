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
    <Card className="bg-card border-border hover:border-success/50 transition-all duration-200 h-full">
      <CardHeader className="text-center p-4 sm:p-6">
        <div className="relative mx-auto mb-3 sm:mb-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden bg-secondary-dark border-2 border-success/20">
            {attendant.imageUrl ? (
              <img 
                src={attendant.imageUrl} 
                alt={attendant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-secondary-light" />
              </div>
            )}
          </div>
        </div>
        <CardTitle className="text-lg sm:text-xl font-bold text-primary-light">
          {attendant.name}
        </CardTitle>
        <div className="flex items-center justify-center gap-2 text-success">
          <DollarSign size={16} />
          <span className="text-lg sm:text-xl font-bold">
            R$ {parseFloat(attendant.earnings).toFixed(2)}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`sale-${attendant.id}`} className="text-primary-light text-sm">
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
              className="bg-secondary-dark border-gray-600 text-primary-light text-center text-lg sm:text-xl"
              disabled={isLoading}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-success hover:bg-success-dark text-white font-medium py-2 sm:py-3 text-sm sm:text-base"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Registrando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <TrendingUp size={16} />
                Registrar Venda
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}