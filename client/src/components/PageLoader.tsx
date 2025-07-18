import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import ModernHeader from '@/components/ModernHeader';
import Navigation from '@/components/Navigation';

interface PageLoaderProps {
  message?: string;
}

export default function PageLoader({ message = "Carregando..." }: PageLoaderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary-dark to-secondary-dark/50">
      <ModernHeader />
      <Navigation />
      <div className="flex items-center justify-center py-20">
        <Card className="bg-card border-border p-8 shadow-xl">
          <CardContent className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-lg text-secondary-light">{message}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}