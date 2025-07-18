import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, User } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSaleSound } from "@/hooks/useSaleSound";
import { useToast } from "@/hooks/use-toast";
import { useComponentAdapter } from "@/hooks/useScreenAdapter";
import type { Attendant } from "@shared/schema";

interface AttendantCardProps {
  attendant: Attendant;
  onSaleSubmit: (attendantId: number, value: string, clientData?: { name?: string; phone?: string; email?: string }) => void;
  isLoading: boolean;
}

export default function AttendantCard({ 
  attendant, 
  onSaleSubmit, 
  isLoading = false 
}: AttendantCardProps) {
  const [saleValue, setSaleValue] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const { playSaleSound } = useSaleSound();
  const { toast } = useToast();
  const { classes, isMobile, isTouch, metrics } = useComponentAdapter('card');

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

    // Validar campos obrigatórios
    if (!clientName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o nome do cliente",
        variant: "destructive",
      });
      return;
    }

    if (!clientPhone.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o número do cliente",
        variant: "destructive",
      });
      return;
    }

    const clientData = {
      name: clientName.trim(),
      phone: clientPhone.trim(),
      email: clientEmail.trim() || undefined,
    };

    onSaleSubmit(attendant.id, saleValue, clientData);
    playSaleSound(); // Tocar som de venda
    setSaleValue("");
    setClientName("");
    setClientPhone("");
    setClientEmail("");
  };

  // Intelligent styling based on device type and screen metrics
  const cardClasses = `
    ${classes} 
    bg-gradient-to-br from-card to-card/80 
    border-border hover:border-success/50 
    transition-all duration-300 
    shadow-lg hover:shadow-xl 
    group backdrop-blur-sm h-full
    ${isTouch ? 'active:scale-95' : 'hover:scale-105'}
    ${isMobile ? 'constrain-all' : ''}
  `.trim();

  const avatarSize = metrics.deviceType === 'mobile' 
    ? metrics.width <= 320 ? 'w-16 h-16' : 'w-20 h-20'
    : metrics.deviceType === 'tablet' ? 'w-24 h-24'
    : 'w-28 h-28';

  return (
    <Card className={cardClasses}>
      <CardContent className={`text-center h-full flex flex-col ${isMobile ? 'p-3' : 'p-6'}`}>
        {/* Intelligent Avatar Section */}
        <div className={`relative mx-auto ${avatarSize} mb-4`}>
          <div className="absolute inset-0 bg-gradient-to-r from-success to-info rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
          <div className={`relative w-full h-full rounded-full overflow-hidden shadow-lg ring-2 ring-success/20 group-hover:ring-success/40 transition-all duration-300 ${isTouch ? 'active:scale-95' : ''}`}>
            {attendant.imageUrl ? (
              <img 
                src={attendant.imageUrl} 
                alt={attendant.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-accent flex items-center justify-center">
                <User size={metrics.deviceType === 'mobile' ? 16 : 24} className="text-secondary-light" />
              </div>
            )}
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-success to-info rounded-full border-2 border-card shadow-md animate-pulse"></div>
        </div>

        {/* Intelligent Info Section */}
        <div className="mb-4">
          <h3 className={`font-bold text-primary-light group-hover:text-success transition-colors duration-300 leading-tight mb-2 ${metrics.deviceType === 'mobile' ? 'text-sm' : 'text-lg'}`}>
            {attendant.name}
          </h3>
          <div className={`bg-accent/30 rounded-lg border border-border/50 ${isMobile ? 'p-2' : 'p-3'}`}>
            <p className={`text-secondary-light mb-1 ${metrics.deviceType === 'mobile' ? 'text-xs' : 'text-sm'}`}>Faturamento</p>
            <p className={`font-bold text-success flex items-center justify-center gap-1 ${metrics.deviceType === 'mobile' ? 'text-sm' : 'text-lg'}`}>
              <DollarSign size={metrics.deviceType === 'mobile' ? 14 : 18} />
              <span>R$ {Number(attendant.earnings || 0).toFixed(2)}</span>
            </p>
          </div>
        </div>

        {/* Intelligent Sale Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-end space-y-3">
          <div className="space-y-2">
            <Label htmlFor={`sale-${attendant.id}`} className={`text-secondary-light ${metrics.deviceType === 'mobile' ? 'text-xs' : 'text-sm'}`}>
              Nova Venda
            </Label>
            <div className="relative">
              <DollarSign size={metrics.deviceType === 'mobile' ? 14 : 16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-light" />
              <Input
                id={`sale-${attendant.id}`}
                type="number"
                step="0.01"
                min="0"
                value={saleValue}
                onChange={(e) => setSaleValue(e.target.value)}
                placeholder="0,00"
                className={`pl-10 bg-input border-border text-primary-light text-center focus:ring-2 focus:ring-success/50 focus:border-success transition-all duration-200 ${
                  metrics.deviceType === 'mobile' ? 'h-10 text-sm' : 'h-12 text-base'
                }`}
                inputMode="decimal"
              />
            </div>
          </div>

          {/* Client Fields - Always Visible */}
          <div className="space-y-2 p-3 bg-accent/10 rounded-lg border border-border/30">
            <div className="space-y-2">
              <Label className={`text-secondary-light ${metrics.deviceType === 'mobile' ? 'text-xs' : 'text-sm'}`}>
                Nome do Cliente *
              </Label>
              <Input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nome completo"
                required
                className={`bg-input border-border text-primary-light focus:ring-2 focus:ring-success/50 focus:border-success transition-all duration-200 ${
                  metrics.deviceType === 'mobile' ? 'h-8 text-sm' : 'h-10 text-base'
                }`}
              />
            </div>
            <div className="space-y-2">
              <Label className={`text-secondary-light ${metrics.deviceType === 'mobile' ? 'text-xs' : 'text-sm'}`}>
                Telefone *
              </Label>
              <Input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                required
                className={`bg-input border-border text-primary-light focus:ring-2 focus:ring-success/50 focus:border-success transition-all duration-200 ${
                  metrics.deviceType === 'mobile' ? 'h-8 text-sm' : 'h-10 text-base'
                }`}
              />
            </div>
            <div className="space-y-2">
              <Label className={`text-secondary-light ${metrics.deviceType === 'mobile' ? 'text-xs' : 'text-sm'}`}>
                Email (opcional)
              </Label>
              <Input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="cliente@email.com"
                className={`bg-input border-border text-primary-light focus:ring-2 focus:ring-success/50 focus:border-success transition-all duration-200 ${
                  metrics.deviceType === 'mobile' ? 'h-8 text-sm' : 'h-10 text-base'
                }`}
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