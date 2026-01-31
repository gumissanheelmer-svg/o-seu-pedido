import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Business } from '@/types/database';
import { useAuth } from './useAuth';

export function useBusiness() {
  const { user, businessId, isSuperAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Check if we have an active impersonate session
  const { data: impersonateSession } = useQuery({
    queryKey: ['impersonate-session', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('impersonate_sessions')
        .select('target_business_id')
        .eq('super_admin_id', user.id)
        .eq('active', true)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && isSuperAdmin,
  });

  // Use impersonated business ID if available, otherwise use auth business ID
  const effectiveBusinessId = impersonateSession?.target_business_id || businessId;

  const { data: business, isLoading, error, refetch } = useQuery({
    queryKey: ['business', effectiveBusinessId],
    queryFn: async () => {
      if (!effectiveBusinessId) return null;
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', effectiveBusinessId)
        .single();
      
      if (error) throw error;
      return data as Business;
    },
    enabled: !!effectiveBusinessId,
  });

  const updateBusiness = useMutation({
    mutationFn: async (updates: Partial<Business>) => {
      if (!effectiveBusinessId) throw new Error('No business ID');
      
      const { data, error } = await supabase
        .from('businesses')
        .update(updates)
        .eq('id', effectiveBusinessId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business', effectiveBusinessId] });
    },
  });

  return {
    business,
    isLoading,
    error,
    updateBusiness,
    refetch,
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
