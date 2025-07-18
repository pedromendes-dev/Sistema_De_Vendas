import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, Trophy, DollarSign, Users, Target, Star, Gift, Zap, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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

interface NotificationCenterProps {
  className?: string;
}

export default function NotificationCenter({ className = "" }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'sales' | 'achievements'>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["/api/notifications"],
    refetchInterval: 15000,
  });

  const { data: unreadNotifications = [] } = useQuery({
    queryKey: ["/api/notifications/unread"],
    refetchInterval: 15000,
  });

  // Mark notification as read mutation
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

  // Mark all as read mutation
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
        title: "✅ Todas as notificações foram marcadas como lidas",
        description: "Seu painel está atualizado!",
      });
    }
  });

  // Delete notification mutation
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

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = priority === 'high' || priority === 'urgent' ? 'text-danger animate-pulse' : 
                     type === 'sale' ? 'text-success' :
                     type === 'achievement' ? 'text-warning' :
                     type === 'goal' ? 'text-info' : 'text-secondary-light';

    switch (type) {
      case 'sale':
        return <DollarSign size={20} className={iconClass} />;
      case 'achievement':
        return <Trophy size={20} className={iconClass} />;
      case 'goal':
        return <Target size={20} className={iconClass} />;
      case 'milestone':
        return <Star size={20} className={iconClass} />;
      case 'bonus':
        return <Gift size={20} className={iconClass} />;
      case 'streak':
        return <Zap size={20} className={iconClass} />;
      case 'team':
        return <Users size={20} className={iconClass} />;
      default:
        return <Bell size={20} className={iconClass} />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="text-xs animate-pulse bg-white text-red-700 border border-red-300">Urgente</Badge>;
      case 'high':
        return <Badge className="text-xs bg-white text-red-700 border border-red-300">Alta</Badge>;
      case 'medium':
        return <Badge className="text-xs bg-white text-yellow-700 border border-yellow-300">Média</Badge>;
      case 'low':
        return <Badge className="text-xs bg-white text-gray-700 border border-gray-300">Baixa</Badge>;
      default:
        return null;
    }
  };

  const filterNotifications = (notifications: Notification[]) => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => n.isRead === 0);
      case 'sales':
        return notifications.filter(n => n.type === 'sale');
      case 'achievements':
        return notifications.filter(n => ['achievement', 'goal', 'milestone'].includes(n.type));
      default:
        return notifications;
    }
  };

  const filteredNotifications = filterNotifications(notifications);
  const unreadCount = unreadNotifications.length;

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-card/50 transition-all duration-200"
      >
        <Bell size={20} className="text-secondary-light" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-bounce"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-96 max-w-[90vw]">
          <Card className="bg-card border-border shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-primary-light flex items-center gap-2">
                  <Bell size={20} />
                  Notificações
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {unreadCount} nova{unreadCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X size={16} />
                </Button>
              </div>

              {/* Filters */}
              <div className="flex gap-2 mt-3">
                {[
                  { key: 'all', label: 'Todas' },
                  { key: 'unread', label: 'Não lidas' },
                  { key: 'sales', label: 'Vendas' },
                  { key: 'achievements', label: 'Conquistas' }
                ].map(({ key, label }) => (
                  <Button
                    key={key}
                    variant={filter === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(key as any)}
                    className="text-xs h-7"
                  >
                    {label}
                  </Button>
                ))}
              </div>

              {/* Actions */}
              {unreadCount > 0 && (
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAllAsReadMutation.mutate()}
                    disabled={markAllAsReadMutation.isPending}
                    className="flex-1 h-8 text-xs"
                  >
                    <CheckCircle2 size={14} className="mr-1" />
                    {markAllAsReadMutation.isPending ? 'Marcando...' : 'Marcar todas como lidas'}
                  </Button>
                </div>
              )}
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-96">
                {isLoading ? (
                  <div className="p-4 text-center text-secondary-light">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-success mx-auto mb-2"></div>
                    Carregando notificações...
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center text-secondary-light">
                    <Bell size={48} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm">
                      {filter === 'all' ? 'Nenhuma notificação encontrada' : 
                       filter === 'unread' ? 'Todas as notificações foram lidas!' :
                       `Nenhuma notificação de ${filter === 'sales' ? 'vendas' : 'conquistas'} encontrada`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredNotifications.slice(0, 50).map((notification: Notification, index) => (
                      <div key={notification.id}>
                        <div 
                          className={`p-4 hover:bg-accent/50 transition-colors cursor-pointer relative group ${
                            notification.isRead === 0 ? 'bg-success/5 border-l-4 border-success' : ''
                          }`}
                          onClick={() => {
                            if (notification.isRead === 0) {
                              markAsReadMutation.mutate(notification.id);
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type, notification.priority)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className={`text-sm font-medium ${
                                  notification.isRead === 0 ? 'text-primary-light' : 'text-secondary-light'
                                } truncate`}>
                                  {notification.title}
                                </h4>
                                <div className="flex items-center gap-1">
                                  {getPriorityBadge(notification.priority)}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotificationMutation.mutate(notification.id);
                                    }}
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X size={12} />
                                  </Button>
                                </div>
                              </div>
                              
                              <p className="text-xs text-secondary-light mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-light">
                                  {formatDistanceToNow(new Date(notification.createdAt), { 
                                    addSuffix: true, 
                                    locale: ptBR 
                                  })}
                                </span>
                                {notification.isRead === 0 && (
                                  <div className="w-2 h-2 bg-success rounded-full"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        {index < filteredNotifications.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}