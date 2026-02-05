import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ApprovalStatus, SubscriptionStatus, SubscriptionPlan } from '@/types/database';

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
  plan: SubscriptionPlan;
  start_date: string | null;
  next_billing_date: string | null;
  affiliate_id: string | null;
  internal_notes: string | null;
  business?: {
    name: string;
    slug: string;
  };
  affiliate?: {
    name: string;
    phone: string;
  } | null;
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
          business:businesses(name, slug),
          affiliate:affiliates_orders(name, phone)
        `)
        .order('next_billing_date', { ascending: true });

      if (error) throw error;
      return data as Subscription[];
    },
  });

  // Count paid subscriptions
  const paidSubscriptionsCount = subscriptions?.filter(s => s.status === 'active').length || 0;

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
      paidAt,
      plan,
      amount,
      nextBillingDate,
      affiliateId,
      internalNotes,
    }: { 
      subscriptionId: string; 
      status?: SubscriptionStatus; 
      paidAt?: string | null;
      plan?: SubscriptionPlan;
      amount?: number;
      nextBillingDate?: string;
      affiliateId?: string | null;
      internalNotes?: string | null;
    }) => {
      const updateData: Record<string, unknown> = {};
      if (status !== undefined) updateData.status = status;
      if (paidAt !== undefined) updateData.paid_at = paidAt;
      if (plan !== undefined) updateData.plan = plan;
      if (amount !== undefined) updateData.amount = amount;
      if (nextBillingDate !== undefined) updateData.next_billing_date = nextBillingDate;
      if (affiliateId !== undefined) updateData.affiliate_id = affiliateId;
      if (internalNotes !== undefined) updateData.internal_notes = internalNotes;

      const { error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', subscriptionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-subscriptions'] });
      toast({
        title: 'Sucesso',
        description: 'Assinatura atualizada.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar assinatura.',
        variant: 'destructive',
      });
    },
  });

  // Create new subscription
  const createSubscription = useMutation({
    mutationFn: async ({ 
      businessId, 
      amount, 
      dueDate,
      plan,
      affiliateId,
      internalNotes,
    }: { 
      businessId: string; 
      amount: number; 
      dueDate: string;
      plan?: SubscriptionPlan;
      affiliateId?: string | null;
      internalNotes?: string | null;
    }) => {
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          business_id: businessId,
          amount,
          due_date: dueDate,
          next_billing_date: dueDate,
          plan: plan || 'starter',
          affiliate_id: affiliateId,
          internal_notes: internalNotes,
          start_date: new Date().toISOString().split('T')[0],
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-subscriptions'] });
      toast({
        title: 'Sucesso',
        description: 'Assinatura criada.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar assinatura.',
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
    pendingSubscriptions: subscriptions?.filter(s => s.status === 'pending').length || 0,
    overdueSubscriptions: subscriptions?.filter(s => s.status === 'overdue').length || 0,
    paidSubscriptions: paidSubscriptionsCount,
    activeSubscriptions: subscriptions?.filter(s => s.status === 'active').length || 0,
    totalRevenue: subscriptions?.filter(s => s.status === 'active').reduce((sum, s) => sum + s.amount, 0) || 0,
    overdueRevenue: subscriptions?.filter(s => s.status === 'overdue').reduce((sum, s) => sum + s.amount, 0) || 0,
  };

  return {
    businesses,
    subscriptions,
    metrics,
    isLoading: isLoadingBusinesses || isLoadingSubscriptions,
    updateBusinessStatus,
    updateSubscription,
    createSubscription,
  };
}
