import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

// Componente para garantir que as páginas sempre renderizem corretamente
export default function PageWrapper({ children, className = '' }: PageWrapperProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Pequeno delay para garantir que todos os componentes estejam prontos
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-primary-dark via-primary-dark to-secondary-dark/50 ${className}`}>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="bg-card border-border p-8">
            <CardContent className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-secondary-light">Carregando...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-primary-dark via-primary-dark to-secondary-dark/50 ${className}`}>
      {children}
    </div>
  );
}