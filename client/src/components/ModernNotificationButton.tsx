import React, { useState, useRef, useEffect } from 'react';
import { Bell, BellRing, Check, X, DollarSign, Trophy, Target, Gift, AlertCircle, CheckCheck, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  attendantId?: number;
  metadata?: string;
  isRead: number;
  priority: string;
  createdAt: string;
}

// Get notification icon and color based on type
const getNotificationStyle = (type: string) => {
  switch (type) {
    case 'sale':
      return {
        icon: <DollarSign size={18} />,
        bg: 'bg-gradient-to-r from-green-500/10 to-emerald-500/10',
        border: 'border-green-500/20',
        iconColor: 'text-green-600',
        accentColor: 'bg-green-500'
      };
    case 'achievement':
      return {
        icon: <Trophy size={18} />,
        bg: 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10',
        border: 'border-yellow-500/20',
        iconColor: 'text-yellow-600',
        accentColor: 'bg-yellow-500'
      };
    case 'goal':
      return {
        icon: <Target size={18} />,
        bg: 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10',
        border: 'border-blue-500/20',
        iconColor: 'text-blue-600',
        accentColor: 'bg-blue-500'
      };
    case 'system':
      return {
        icon: <BellRing size={18} />,
        bg: 'bg-gradient-to-r from-purple-500/10 to-violet-500/10',
        border: 'border-purple-500/20',
        iconColor: 'text-purple-600',
        accentColor: 'bg-purple-500'
      };
    default:
      return {
        icon: <Bell size={18} />,
        bg: 'bg-gradient-to-r from-gray-500/10 to-slate-500/10',
        border: 'border-gray-500/20',
        iconColor: 'text-gray-600',
        accentColor: 'bg-gray-500'
      };
  }
};

export default function ModernNotificationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [animateCount, setAnimateCount] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch unread notifications com otimização
  const { data: unreadNotifications = [] } = useQuery({
    queryKey: ["/api/notifications/unread"],
    refetchInterval: 30000, // Reduzido para 30 segundos
    staleTime: 15000, // Cache válido por 15 segundos
    refetchOnWindowFocus: true, // Atualiza ao focar na janela
  });

  // Fetch all notifications when dropdown is open
  const { data: allNotifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: isOpen,
  });

  // Animate count when it changes
  useEffect(() => {
    if (unreadNotifications.length > 0) {
      setAnimateCount(true);
      const timer = setTimeout(() => setAnimateCount(false), 600);
      return () => clearTimeout(timer);
    }
  }, [unreadNotifications.length]);

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/notifications/${id}/read`);
      if (!response.ok) throw new Error("Failed to mark as read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread"] });
    }
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", "/api/notifications/read-all");
      if (!response.ok) throw new Error("Failed to mark all as read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread"] });
      toast({
        title: "Todas as notificações foram marcadas como lidas",
        description: "Todas as notificações foram organizadas.",
      });
    }
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/notifications/${id}`);
      if (!response.ok) throw new Error("Failed to delete notification");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread"] });
    }
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const unreadCount = unreadNotifications.length;
  const displayNotifications = allNotifications;

  return (
    <div className="relative" ref={dropdownRef} style={{ position: 'relative', zIndex: 9999 }}>
      {/* Modern Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        className={`relative w-10 h-10 p-0 rounded-full transition-all duration-300 ${
          unreadCount > 0 
            ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-500/20' 
            : 'hover:bg-accent/50 border border-transparent hover:border-border/50'
        }`}
        onClick={() => {
          console.log('Notification button clicked! Current state:', isOpen);
          console.log('Unread notifications:', unreadNotifications);
          console.log('All notifications:', allNotifications);
          setIsOpen(!isOpen);
        }}
      >
        <div className="relative">
          <Bell 
            size={18} 
            className={`transition-all duration-300 ${
              unreadCount > 0 ? 'text-blue-600 animate-pulse' : 'text-secondary-light'
            }`} 
          />
          
          {/* Animated Notification Count */}
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2">
              <Badge 
                className={`h-5 min-w-[20px] px-1 text-[10px] font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg transition-all duration-300 ${
                  animateCount ? 'scale-125 animate-bounce' : 'scale-100'
                }`}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            </div>
          )}
          
          {/* Pulse Ring Animation */}
          {unreadCount > 0 && (
            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
          )}
        </div>
      </Button>

      {/* Modern Dropdown */}
      {isOpen && (
        <div 
          className="fixed right-4 top-20 w-80 sm:w-96 max-w-[90vw] bg-card border border-border rounded-xl shadow-2xl z-[99999]" 
          style={{ 
            position: 'fixed',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-accent/30 to-accent/10 border-b border-border/50"
               style={{ background: 'linear-gradient(to right, #f0f0f0, #e0e0e0)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bell size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-primary-light">Notificações</h3>
                  <p className="text-xs text-secondary-light">
                    {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}` : 'Todas as notificações lidas'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs bg-success/10 hover:bg-success/20 text-success border border-success/20"
                    onClick={() => markAllAsReadMutation.mutate()}
                    disabled={markAllAsReadMutation.isPending}
                  >
                    <CheckCheck size={14} className="mr-1" />
                    Marcar todas
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <ScrollArea className="max-h-[400px]">
            {displayNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-accent/20 rounded-full flex items-center justify-center">
                  <Bell size={24} className="text-secondary-light opacity-50" />
                </div>
                <h4 className="text-sm font-medium text-primary-light mb-1">Nenhuma notificação</h4>
                <p className="text-xs text-secondary-light">
                  As notificações de vendas e conquistas aparecerão aqui
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {displayNotifications.slice(0, 20).map((notification: Notification) => {
                  const style = getNotificationStyle(notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer group hover:scale-[1.02] hover:shadow-lg ${
                        notification.isRead === 0 
                          ? `${style.bg} ${style.border} shadow-sm` 
                          : 'bg-accent/20 border-border/30 hover:bg-accent/30'
                      }`}
                      onClick={() => {
                        if (notification.isRead === 0) {
                          markAsReadMutation.mutate(notification.id);
                        }
                      }}
                    >
                      {/* Unread Indicator */}
                      {notification.isRead === 0 && (
                        <div className={`absolute top-2 right-2 w-2 h-2 ${style.accentColor} rounded-full animate-pulse`}></div>
                      )}
                      
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`p-2 rounded-lg ${style.bg} ${style.iconColor} flex-shrink-0`}>
                          {style.icon}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-semibold text-primary-light leading-tight">
                              {notification.title}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotificationMutation.mutate(notification.id);
                              }}
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                          
                          <p className="text-xs text-secondary-light leading-relaxed mb-3">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-light">
                            <Clock size={10} />
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
          
          {/* Footer */}
          {displayNotifications.length > 0 && (
            <div className="p-3 bg-accent/10 border-t border-border/30 text-center">
              <p className="text-xs text-secondary-light">
                Mostrando {Math.min(displayNotifications.length, 20)} de {displayNotifications.length} notificações
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}