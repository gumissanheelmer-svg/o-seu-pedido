import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useQueryClient } from '@tanstack/react-query';

export interface OrderNotification {
  id: string;
  clientName: string;
  createdAt: string;
  seen: boolean;
}

export function useRealtimeOrders() {
  const { businessId } = useAuth();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!businessId) return;

    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `business_id=eq.${businessId}`,
        },
        (payload) => {
          const newOrder = payload.new as any;
          const notification: OrderNotification = {
            id: newOrder.id,
            clientName: newOrder.client_name,
            createdAt: newOrder.created_at,
            seen: false,
          };
          setNotifications((prev) => [notification, ...prev].slice(0, 20));
          setUnreadCount((prev) => prev + 1);
          queryClient.invalidateQueries({ queryKey: ['orders', businessId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId, queryClient]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markAllRead, clearNotifications };
}
