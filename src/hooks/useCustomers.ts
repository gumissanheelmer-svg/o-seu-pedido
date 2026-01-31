import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerWithOrders extends Customer {
  orders_count?: number;
  total_spent?: number;
}

export function useCustomers() {
  const { businessId } = useAuth();
  const queryClient = useQueryClient();

  const { data: customers, isLoading, error } = useQuery({
    queryKey: ['customers', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Customer[];
    },
    enabled: !!businessId,
  });

  const createOrGetCustomer = useMutation({
    mutationFn: async (data: { name: string; phone: string; email?: string }) => {
      // Try to find existing customer by phone
      const { data: existing } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', businessId)
        .eq('phone', data.phone)
        .maybeSingle();

      if (existing) {
        // Update name if different
        if (existing.name !== data.name) {
          await supabase
            .from('customers')
            .update({ name: data.name, email: data.email || existing.email })
            .eq('id', existing.id);
        }
        return existing as Customer;
      }

      // Create new customer
      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert({
          business_id: businessId,
          name: data.name,
          phone: data.phone,
          email: data.email || null,
        })
        .select()
        .single();

      if (error) throw error;
      return newCustomer as Customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', businessId] });
    },
  });

  const updateCustomer = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Customer> }) => {
      const { error } = await supabase
        .from('customers')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', businessId] });
    },
  });

  const deleteCustomer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', businessId] });
    },
  });

  return {
    customers,
    isLoading,
    error,
    createOrGetCustomer,
    updateCustomer,
    deleteCustomer,
  };
}

export function useCustomerOrders(customerId: string) {
  const { businessId } = useAuth();

  return useQuery({
    queryKey: ['customer-orders', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('business_id', businessId)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!customerId && !!businessId,
  });
}
