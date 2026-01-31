import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ApprovalStatus, SubscriptionStatus } from '@/types/database';

export interface BusinessWithOwner {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  business_type: string;
  whatsapp_number: string;
  approval_status: ApprovalStatus;
  active: boolean;
  created_at: string;
  payment_required: boolean;
}

export interface Subscription {
  id: string;
  business_id: string;
  amount: number;
  currency: string;
  due_date: string;
  status: SubscriptionStatus;
  paid_at: string | null;
  created_at: string;
  business?: {
    name: string;
    slug: string;
  };
}

export function useSuperAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all businesses
  const { data: businesses, isLoading: isLoadingBusinesses } = useQuery({
    queryKey: ['superadmin-businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BusinessWithOwner[];
    },
  });

  // Fetch all subscriptions with business info
  const { data: subscriptions, isLoading: isLoadingSubscriptions } = useQuery({
    queryKey: ['superadmin-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          business:businesses(name, slug)
        `)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data as Subscription[];
    },
  });

  // Fetch all orders for metrics
  const { data: allOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['superadmin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, total_amount, status, payment_confirmed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Update business approval status
  const updateBusinessStatus = useMutation({
    mutationFn: async ({ 
      businessId, 
      approvalStatus, 
      active 
    }: { 
      businessId: string; 
      approvalStatus: ApprovalStatus; 
      active: boolean;
    }) => {
      const { error } = await supabase
        .from('businesses')
        .update({ 
          approval_status: approvalStatus, 
          active 
        })
        .eq('id', businessId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-businesses'] });
      toast({
        title: 'Sucesso',
        description: 'Status do negócio atualizado.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar status.',
        variant: 'destructive',
      });
    },
  });

  // Update subscription status
  const updateSubscription = useMutation({
    mutationFn: async ({ 
      subscriptionId, 
      status, 
      paidAt 
    }: { 
      subscriptionId: string; 
      status: SubscriptionStatus; 
      paidAt?: string | null;
    }) => {
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          status, 
          paid_at: paidAt 
        })
        .eq('id', subscriptionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-subscriptions'] });
      toast({
        title: 'Sucesso',
        description: 'Mensalidade atualizada.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar mensalidade.',
        variant: 'destructive',
      });
    },
  });

  // Create new subscription
  const createSubscription = useMutation({
    mutationFn: async ({ 
      businessId, 
      amount, 
      dueDate 
    }: { 
      businessId: string; 
      amount: number; 
      dueDate: string;
    }) => {
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          business_id: businessId,
          amount,
          due_date: dueDate,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-subscriptions'] });
      toast({
        title: 'Sucesso',
        description: 'Mensalidade criada.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar mensalidade.',
        variant: 'destructive',
      });
    },
  });

  // Calculate metrics
  const metrics = {
    totalBusinesses: businesses?.length || 0,
    pendingApproval: businesses?.filter(b => b.approval_status === 'pending').length || 0,
    approvedActive: businesses?.filter(b => b.approval_status === 'approved' && b.active).length || 0,
    blocked: businesses?.filter(b => b.approval_status === 'blocked').length || 0,
    totalOrders: allOrders?.length || 0,
    totalRevenue: allOrders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
    pendingSubscriptions: subscriptions?.filter(s => s.status === 'pending').length || 0,
    overdueSubscriptions: subscriptions?.filter(s => s.status === 'overdue').length || 0,
  };

  return {
    businesses,
    subscriptions,
    allOrders,
    metrics,
    isLoading: isLoadingBusinesses || isLoadingSubscriptions || isLoadingOrders,
    updateBusinessStatus,
    updateSubscription,
    createSubscription,
  };
}
