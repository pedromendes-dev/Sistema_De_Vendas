import React, { useState, useEffect } from 'react';
import { Search, Settings, Moon, Sun, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NotificationCenter from './NotificationCenter';

export default function ModernHeader() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getCurrentDate = () => {
    const now = new Date();
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
  };

  const getTimeString = () => {
    return currentTime.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <header className="bg-gradient-to-r from-card via-card to-accent/10 border-b border-border/50 backdrop-blur-lg">
      <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* Left Section - Logo & Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-success to-info rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-white">$</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl lg:text-2xl font-bold text-primary-light">
                  SalesControl Pro
                </h1>
                <p className="text-xs text-secondary-light">
                  Sistema Gamificado de Vendas
                </p>
              </div>
            </div>
          </div>

          {/* Center Section - Search (Hidden on small screens) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-light" />
              <Input
                placeholder="Buscar atendentes, vendas..."
                className="pl-10 bg-input/50 border-border/50 focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          {/* Right Section - Time, Actions & Notifications */}
          <div className="flex items-center space-x-3">
            
            {/* Time Display */}
            <div className="hidden lg:block text-right">
              <div className="text-sm font-bold text-primary-light">
                {getTimeString()}
              </div>
              <div className="text-xs text-secondary-light">
                {getCurrentDate()}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="hidden sm:flex w-9 h-9 p-0 hover:bg-accent/50"
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="md:hidden w-9 h-9 p-0 hover:bg-accent/50"
              >
                <Search size={16} />
              </Button>

              <NotificationCenter />

              <Button
                variant="ghost"
                size="sm"
                className="w-9 h-9 p-0 hover:bg-accent/50"
              >
                <Settings size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-light" />
          <Input
            placeholder="Buscar..."
            className="pl-10 bg-input/50 border-border/50"
          />
        </div>
      </div>
    </header>
  );
}