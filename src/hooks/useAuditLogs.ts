import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Json } from '@/integrations/supabase/types';

export interface AuditLog {
  id: string;
  actor_user_id: string | null;
  business_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Json;
  ip_address: string | null;
  created_at: string;
}

export function useAuditLogs(businessId?: string) {
  const { isSuperAdmin } = useAuth();

  return useQuery({
    queryKey: ['audit-logs', businessId],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (businessId) {
        query = query.eq('business_id', businessId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AuditLog[];
    },
    enabled: isSuperAdmin,
  });
}

export function useCreateAuditLog() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      action: string;
      businessId?: string;
      entityType?: string;
      entityId?: string;
      metadata?: Json;
    }) => {
      const { error } = await supabase.from('audit_logs').insert([{
        actor_user_id: user?.id || null,
        business_id: data.businessId || null,
        action: data.action,
        entity_type: data.entityType || null,
        entity_id: data.entityId || null,
        metadata: data.metadata || {},
      }]);
      if (error) throw error;
    },
  });
}
