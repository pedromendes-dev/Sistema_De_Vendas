import React, { useState, useEffect, useMemo } from 'react';
import { Search, Settings, Maximize2, Minimize2, X, User, DollarSign, Target, Trophy, Volume2, VolumeX, Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useQuery } from '@tanstack/react-query';
import ProfessionalNotifications from './ProfessionalNotifications';
import type { Attendant, Sale, Goal, Achievement } from '@shared/schema';

export default function ModernHeader() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [compactView, setCompactView] = useState(false);

  // Fetch data for search
  const { data: attendants = [] } = useQuery<Attendant[]>({
    queryKey: ["/api/attendants"],
  });

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });



  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setSoundEnabled(settings.soundEnabled ?? true);
      setDarkMode(settings.darkMode ?? false);
      setAutoRefresh(settings.autoRefresh ?? true);
      setCompactView(settings.compactView ?? false);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    const settings = {
      soundEnabled,
      darkMode,
      autoRefresh,
      compactView
    };
    localStorage.setItem('app_settings', JSON.stringify(settings));
  };

  // Handle settings changes
  const handleSettingChange = (setting: string, value: boolean) => {
    switch (setting) {
      case 'soundEnabled':
        setSoundEnabled(value);
        break;
      case 'darkMode':
        setDarkMode(value);
        document.documentElement.classList.toggle('dark', value);
        break;
      case 'autoRefresh':
        setAutoRefresh(value);
        break;
      case 'compactView':
        setCompactView(value);
        break;
    }
  };

  // Save settings whenever they change
  useEffect(() => {
    saveSettings();
  }, [soundEnabled, darkMode, autoRefresh, compactView]);



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

  // Search functionality - memoized to prevent infinite re-renders
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return { attendants: [], sales: [], goals: [], achievements: [] };
    }

    const query = searchQuery.toLowerCase();
    
    const filteredAttendants = attendants.filter(attendant =>
      attendant.name.toLowerCase().includes(query)
    );

    const filteredSales = sales.filter(sale => {
      const attendant = attendants.find(a => a.id === sale.attendantId);
      return attendant?.name.toLowerCase().includes(query) || 
             sale.value.includes(query);
    });

    const filteredGoals = goals.filter(goal => {
      const attendant = attendants.find(a => a.id === goal.attendantId);
      return goal.title.toLowerCase().includes(query) ||
             attendant?.name.toLowerCase().includes(query);
    });

    const filteredAchievements = achievements.filter(achievement => {
      const attendant = attendants.find(a => a.id === achievement.attendantId);
      return achievement.title.toLowerCase().includes(query) ||
             achievement.description.toLowerCase().includes(query) ||
             attendant?.name.toLowerCase().includes(query);
    });

    return {
      attendants: filteredAttendants,
      sales: filteredSales,
      goals: filteredGoals,
      achievements: filteredAchievements
    };
  }, [searchQuery, attendants, sales, goals, achievements]);

  const hasResults = searchResults.attendants.length > 0 || 
                    searchResults.sales.length > 0 || 
                    searchResults.goals.length > 0 || 
                    searchResults.achievements.length > 0;

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowResults(false);
    setIsSearchOpen(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="relative">
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
                  placeholder="Buscar atendentes, vendas, metas..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 pr-10 bg-input/50 border-border/50 focus:border-primary/50 transition-colors"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-accent/50"
                  >
                    <X size={14} />
                  </Button>
                )}
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
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="md:hidden w-9 h-9 p-0 hover:bg-accent/50"
                >
                  <Search size={16} />
                </Button>

                <ProfessionalNotifications />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="w-9 h-9 p-0 hover:bg-accent/50"
                >
                  <Settings size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden px-4 pb-3 border-t border-border/30">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-light" />
              <Input
                placeholder="Buscar atendentes, vendas, metas..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-10 bg-input/50 border-border/50"
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-accent/50"
                >
                  <X size={14} />
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Search Results Dropdown */}
      {showResults && searchQuery.trim() && (
        <div className="absolute top-full left-0 right-0 z-50 mx-4 sm:mx-6 lg:mx-8">
          <Card className="bg-card/95 border-border backdrop-blur-lg shadow-2xl mt-2 max-h-96 overflow-y-auto">
            <CardContent className="p-4">
              {!hasResults ? (
                <div className="text-center py-8">
                  <Search size={48} className="mx-auto mb-4 text-muted-light opacity-50" />
                  <p className="text-secondary-light">Nenhum resultado encontrado para "{searchQuery}"</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Attendants Results */}
                  {searchResults.attendants.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-primary-light mb-2 flex items-center gap-2">
                        <User size={14} />
                        Atendentes ({searchResults.attendants.length})
                      </h3>
                      <div className="space-y-2">
                        {searchResults.attendants.slice(0, 3).map((attendant) => (
                          <div key={attendant.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/30 cursor-pointer">
                            <img 
                              src={attendant.imageUrl} 
                              alt={attendant.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-primary-light">{attendant.name}</p>
                              <p className="text-xs text-secondary-light">R$ {attendant.earnings} em vendas</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sales Results */}
                  {searchResults.sales.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-primary-light mb-2 flex items-center gap-2">
                        <DollarSign size={14} />
                        Vendas ({searchResults.sales.length})
                      </h3>
                      <div className="space-y-2">
                        {searchResults.sales.slice(0, 3).map((sale) => {
                          const attendant = attendants.find(a => a.id === sale.attendantId);
                          return (
                            <div key={sale.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/30 cursor-pointer">
                              <div>
                                <p className="text-sm font-medium text-primary-light">R$ {sale.value}</p>
                                <p className="text-xs text-secondary-light">{attendant?.name} - {formatDate(sale.createdAt)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Goals Results */}
                  {searchResults.goals.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-primary-light mb-2 flex items-center gap-2">
                        <Target size={14} />
                        Metas ({searchResults.goals.length})
                      </h3>
                      <div className="space-y-2">
                        {searchResults.goals.slice(0, 3).map((goal) => {
                          const attendant = attendants.find(a => a.id === goal.attendantId);
                          return (
                            <div key={goal.id} className="p-2 rounded-lg hover:bg-accent/30 cursor-pointer">
                              <p className="text-sm font-medium text-primary-light">{goal.title}</p>
                              <p className="text-xs text-secondary-light">{attendant?.name} - R$ {goal.currentValue}/R$ {goal.targetValue}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Achievements Results */}
                  {searchResults.achievements.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-primary-light mb-2 flex items-center gap-2">
                        <Trophy size={14} />
                        Conquistas ({searchResults.achievements.length})
                      </h3>
                      <div className="space-y-2">
                        {searchResults.achievements.slice(0, 3).map((achievement) => {
                          const attendant = attendants.find(a => a.id === achievement.attendantId);
                          return (
                            <div key={achievement.id} className="p-2 rounded-lg hover:bg-accent/30 cursor-pointer">
                              <p className="text-sm font-medium text-primary-light">{achievement.title}</p>
                              <p className="text-xs text-secondary-light">{attendant?.name} - {achievement.points} pontos</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings size={20} />
              Configurações do Sistema
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Sound Settings */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <div>
                  <p className="text-sm font-medium">Notificações Sonoras</p>
                  <p className="text-xs text-muted-foreground">Sons para novas vendas e conquistas</p>
                </div>
              </div>
              <Switch
                checked={soundEnabled}
                onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
              />
            </div>

            {/* Dark Mode Settings */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                <div>
                  <p className="text-sm font-medium">Modo Escuro</p>
                  <p className="text-xs text-muted-foreground">Tema escuro para o sistema</p>
                </div>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
              />
            </div>

            {/* Auto Refresh Settings */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor size={16} />
                <div>
                  <p className="text-sm font-medium">Atualização Automática</p>
                  <p className="text-xs text-muted-foreground">Atualiza dados a cada 5 segundos</p>
                </div>
              </div>
              <Switch
                checked={autoRefresh}
                onCheckedChange={(checked) => handleSettingChange('autoRefresh', checked)}
              />
            </div>

            {/* Compact View Settings */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Minimize2 size={16} />
                <div>
                  <p className="text-sm font-medium">Visualização Compacta</p>
                  <p className="text-xs text-muted-foreground">Interface mais densa</p>
                </div>
              </div>
              <Switch
                checked={compactView}
                onCheckedChange={(checked) => handleSettingChange('compactView', checked)}
              />
            </div>

            {/* System Info */}
            <div className="pt-4 border-t">
              <div className="text-xs text-muted-foreground space-y-1">
                <p>SalesControl Pro v2.0</p>
                <p>Sistema Gamificado de Vendas</p>
                <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}