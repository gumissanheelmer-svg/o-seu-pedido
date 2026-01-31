import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderStatus } from '@/types/database';
import { useAuth } from './useAuth';

export function useOrders() {
  const { businessId } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Order[];
    },
    enabled: !!businessId,
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', businessId] });
    },
  });

  const confirmPayment = useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ payment_confirmed: true })
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', businessId] });
    },
  });

  // Get orders grouped by status
  const pendingOrders = orders?.filter(o => o.status === 'pending') || [];
  const confirmedOrders = orders?.filter(o => o.status === 'confirmed') || [];
  const preparingOrders = orders?.filter(o => o.status === 'preparing') || [];
  const readyOrders = orders?.filter(o => o.status === 'ready') || [];
  const deliveredOrders = orders?.filter(o => o.status === 'delivered') || [];
  const cancelledOrders = orders?.filter(o => o.status === 'cancelled') || [];

  // Stats
  const todayOrders = orders?.filter(o => {
    const orderDate = new Date(o.delivery_date);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }) || [];

  const weekOrders = orders?.filter(o => {
    const orderDate = new Date(o.delivery_date);
    const now = new Date();
    const weekAgo = new Date(now.setDate(now.getDate() - 7));
    return orderDate >= weekAgo;
  }) || [];

  return {
    orders,
    isLoading,
    error,
    updateOrderStatus,
    confirmPayment,
    // Grouped orders
    pendingOrders,
    confirmedOrders,
    preparingOrders,
    readyOrders,
    deliveredOrders,
    cancelledOrders,
    // Stats
    todayOrders,
    weekOrders,
  };
}

interface CreateOrderParams {
  businessId: string;
  clientName: string;
  clientPhone: string;
  deliveryDate: string;
  deliveryTime?: string;
  deliveryAddress?: string;
  notes?: string;
  orderDescription: string;
  quantity: number;
  orderType: string;
  paymentMethod?: string;
  transactionCode?: string;
  amountPaid?: number;
  paymentConfirmed?: boolean;
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (params: CreateOrderParams) => {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          business_id: params.businessId,
          client_name: params.clientName,
          client_phone: params.clientPhone,
          delivery_date: params.deliveryDate,
          delivery_time: params.deliveryTime,
          delivery_address: params.deliveryAddress,
          notes: params.notes,
          order_description: params.orderDescription,
          quantity: params.quantity,
          order_type: params.orderType,
          payment_method: params.paymentMethod,
          transaction_code: params.transactionCode,
          amount_paid: params.amountPaid || 0,
          payment_confirmed: params.paymentConfirmed || false,
          status: 'pending',
          total_amount: params.amountPaid || 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Order;
    },
  });
}
