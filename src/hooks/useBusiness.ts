import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Business } from '@/types/database';
import { useAuth } from './useAuth';

export function useBusiness() {
  const { user, businessId } = useAuth();
  const queryClient = useQueryClient();

  const { data: business, isLoading, error } = useQuery({
    queryKey: ['business', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();
      
      if (error) throw error;
      return data as Business;
    },
    enabled: !!businessId,
  });

  const updateBusiness = useMutation({
    mutationFn: async (updates: Partial<Business>) => {
      if (!businessId) throw new Error('No business ID');
      
      const { data, error } = await supabase
        .from('businesses')
        .update(updates)
        .eq('id', businessId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business', businessId] });
    },
  });

  return {
    business,
    isLoading,
    error,
    updateBusiness,
  };
}

export function usePublicBusiness(slug: string) {
  return useQuery({
    queryKey: ['public-business', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('slug', slug)
        .eq('approval_status', 'approved')
        .eq('active', true)
        .single();
      
      if (error) throw error;
      return data as Business;
    },
    enabled: !!slug,
  });
}
