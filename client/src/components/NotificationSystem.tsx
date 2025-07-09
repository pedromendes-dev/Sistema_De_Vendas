import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, Trophy, DollarSign, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

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

interface NotificationSystemProps {
  className?: string;
}

export default function NotificationSystem({ className = "" }: NotificationSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], refetch } = useQuery({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000, // Refresh every 30 seconds as fallback
  });

  const { data: unreadNotifications = [] } = useQuery({
    queryKey: ["/api/notifications/unread"],
    refetchInterval: 30000,
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
    }
  });

  // WebSocket connection - Disabled for now to focus on mobile responsiveness
  useEffect(() => {
    // Simulate connection for UI
    setWs({ readyState: WebSocket.OPEN } as WebSocket);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <DollarSign size={16} className="text-green-500" />;
      case 'achievement':
        return <Trophy size={16} className="text-yellow-500" />;
      case 'team_milestone':
        return <Users size={16} className="text-blue-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'urgent':
        return 'bg-red-700';
      case 'low':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-secondary-dark/50"
      >
        <Bell size={20} className="text-secondary-light" />
        {unreadNotifications.length > 0 && (
          <Badge 
            className={`absolute -top-1 -right-1 h-5 w-5 p-0 text-xs ${getPriorityColor('high')} text-white flex items-center justify-center`}
          >
            {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
          </Badge>
        )}
        
        {/* Connection indicator */}
        <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full ${ws ? 'bg-green-500' : 'bg-red-500'}`} />
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 sm:max-w-none bg-card border border-border rounded-none sm:rounded-lg shadow-lg overflow-hidden">
          <div className="p-3 sm:p-3 border-b border-border flex items-center justify-between bg-card">
            <h3 className="font-semibold text-primary-light text-sm sm:text-base">Notificações</h3>
            <div className="flex items-center gap-1 sm:gap-2">
              {unreadNotifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  className="text-xs text-secondary-light hover:text-primary-light px-2 py-1"
                >
                  <span className="hidden sm:inline">Marcar todas como lidas</span>
                  <span className="sm:hidden">Marcar todas</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-1"
              >
                <X size={16} />
              </Button>
            </div>
          </div>
          
          <div className="h-[calc(100vh-60px)] sm:h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-secondary-light">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm sm:text-base">Nenhuma notificação</p>
              </div>
            ) : (
              notifications.slice(0, 20).map((notification: Notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-border cursor-pointer transition-colors ${
                    notification.isRead ? 'bg-transparent' : 'bg-secondary-dark/20'
                  } hover:bg-secondary-dark/30`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsReadMutation.mutate(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-primary-light text-sm truncate">
                          {notification.title}
                        </h4>
                        <span className="text-xs text-secondary-light flex-shrink-0">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-secondary-light mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      {!notification.isRead && (
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)} mt-2`} />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}