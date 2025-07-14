import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, AlertCircle, DollarSign, Trophy, Target, Gift, BellRing, CheckCheck, Trash2 } from 'lucide-react';
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

// Get notification icon based on type
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'sale':
      return <DollarSign size={20} className="text-success" />;
    case 'achievement':
      return <Trophy size={20} className="text-warning" />;
    case 'goal':
      return <Target size={20} className="text-info" />;
    case 'system':
      return <BellRing size={20} className="text-secondary" />;
    default:
      return <Bell size={20} className="text-secondary" />;
  }
};

// Get notification priority color
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
};

export default function ProfessionalNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch unread notifications only
  const { data: unreadNotifications = [] } = useQuery({
    queryKey: ["/api/notifications/unread"],
    refetchInterval: 5000,
  });

  // Fetch all notifications when dropdown is open
  const { data: allNotifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: isOpen,
  });

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
      setIsOpen(false);
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
  const displayNotifications = isOpen ? allNotifications : [];

  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === 'high') return <AlertCircle className="h-4 w-4 text-red-500" />;
    return <Bell className="h-4 w-4 text-blue-500" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800';
      default: return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="relative h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center min-w-[20px]"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Notificações</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => markAllAsReadMutation.mutate()}
                    disabled={markAllAsReadMutation.isPending}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Marcar todas
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <ScrollArea className="max-h-96">
            {displayNotifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Nenhuma notificação
              </div>
            ) : (
              <div className="p-1">
                {displayNotifications.slice(0, 20).map((notification: Notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 m-1 rounded-md border cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      notification.isRead === 0 
                        ? getPriorityColor(notification.priority)
                        : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                    }`}
                    onClick={() => {
                      if (notification.isRead === 0) {
                        markAsReadMutation.mutate(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type, notification.priority)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {notification.title}
                          </p>
                          {notification.isRead === 0 && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {displayNotifications.length > 20 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
              <Button variant="ghost" size="sm" className="text-xs">
                Ver todas as notificações
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}