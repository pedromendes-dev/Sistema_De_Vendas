import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Bell, X, Trash2, Clock, CheckCheck, DollarSign, Trophy, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
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

export default function SimpleNotificationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: unreadNotifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/notifications/unread'],
    refetchInterval: 30000,
  });

  const { data: allNotifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    enabled: isOpen,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => 
      apiRequest(`/api/notifications/${notificationId}/read`, { method: 'PUT' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread'] });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: number) => 
      apiRequest(`/api/notifications/${notificationId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread'] });
      toast({
        title: "Notificação removida",
        variant: "default",
      });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiRequest('/api/notifications/read-all', { method: 'PUT' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread'] });
      toast({
        title: "Todas as notificações foram marcadas como lidas",
        variant: "default",
      });
    },
  });

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = unreadNotifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Button */}
      <Button
        variant="ghost"
        size="sm"
        className="relative hover:bg-accent/50"
        onClick={() => {
          console.log('Notification button clicked! isOpen:', isOpen);
          console.log('Notifications count:', unreadCount);
          setIsOpen(!isOpen);
        }}
      >
        <Bell size={18} className={unreadCount > 0 ? 'text-blue-600' : 'text-gray-500'} />
        
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white border-0">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown Menu */}
      {isOpen && ReactDOM.createPortal(
        <div
          className="fixed w-96 max-w-[calc(100vw-2rem)] bg-white border-2 border-gray-300 rounded-lg shadow-2xl"
          style={{ 
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 999999999,
            display: 'block'
          }}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Notificações</h3>
                <p className="text-sm text-gray-600">
                  {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}` : 'Todas lidas'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markAllAsReadMutation.mutate()}
                  >
                    <CheckCheck size={14} className="mr-1" />
                    Marcar todas
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 p-0"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <ScrollArea className="max-h-[400px]">
            <div className="p-2">
              {allNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={32} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Nenhuma notificação</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {allNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        notification.isRead === 0 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => {
                        if (notification.isRead === 0) {
                          markAsReadMutation.mutate(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${
                            notification.type === 'sale' ? 'bg-green-100' :
                            notification.type === 'achievement' ? 'bg-purple-100' :
                            'bg-blue-100'
                          }`}>
                            {notification.type === 'sale' ? <DollarSign size={16} className="text-green-600" /> :
                             notification.type === 'achievement' ? <Trophy size={16} className="text-purple-600" /> :
                             <Target size={16} className="text-blue-600" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <Clock size={10} />
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                                locale: ptBR
                              })}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-6 h-6 p-0 opacity-0 hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotificationMutation.mutate(notification.id);
                          }}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* View All Link */}
          {allNotifications.length > 0 && (
            <div className="p-3 border-t border-gray-200">
              <Button 
                variant="ghost" 
                className="w-full text-sm"
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = '/notifications';
                }}
              >
                Ver todas as notificações
              </Button>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}