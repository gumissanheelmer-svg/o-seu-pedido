import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useCreateAuditLog } from './useAuditLogs';

export interface ImpersonateSession {
  id: string;
  super_admin_id: string;
  target_business_id: string;
  started_at: string;
  ended_at: string | null;
  active: boolean;
}

export function useImpersonate() {
  const { user, isSuperAdmin } = useAuth();
  const queryClient = useQueryClient();
  const createAuditLog = useCreateAuditLog();
  const [impersonatedBusinessId, setImpersonatedBusinessId] = useState<string | null>(null);

  // Get active impersonate session
  const { data: activeSession } = useQuery({
    queryKey: ['impersonate-session', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('impersonate_sessions')
        .select('*')
        .eq('super_admin_id', user.id)
        .eq('active', true)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setImpersonatedBusinessId(data.target_business_id);
      }
      
      return data as ImpersonateSession | null;
    },
    enabled: !!user?.id && isSuperAdmin,
  });

  const startImpersonate = useMutation({
    mutationFn: async (businessId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      // End any existing session
      await supabase
        .from('impersonate_sessions')
        .update({ active: false, ended_at: new Date().toISOString() })
        .eq('super_admin_id', user.id)
        .eq('active', true);

      // Start new session
      const { data, error } = await supabase
        .from('impersonate_sessions')
        .insert({
          super_admin_id: user.id,
          target_business_id: businessId,
        })
        .select()
        .single();

      if (error) throw error;

      // Create audit log
      await createAuditLog.mutateAsync({
        action: 'impersonate.start',
        businessId,
        entityType: 'business',
        entityId: businessId,
        metadata: { session_id: data.id },
      });

      return data;
    },
    onSuccess: (data) => {
      setImpersonatedBusinessId(data.target_business_id);
      queryClient.invalidateQueries({ queryKey: ['impersonate-session'] });
    },
  });

  const endImpersonate = useMutation({
    mutationFn: async () => {
      if (!user?.id || !activeSession) return;

      const { error } = await supabase
        .from('impersonate_sessions')
        .update({ active: false, ended_at: new Date().toISOString() })
        .eq('id', activeSession.id);

      if (error) throw error;

      // Create audit log
      await createAuditLog.mutateAsync({
        action: 'impersonate.end',
        businessId: activeSession.target_business_id,
        entityType: 'business',
        entityId: activeSession.target_business_id,
        metadata: { session_id: activeSession.id },
      });
    },
    onSuccess: () => {
      setImpersonatedBusinessId(null);
      queryClient.invalidateQueries({ queryKey: ['impersonate-session'] });
    },
  });

  const isImpersonating = !!impersonatedBusinessId;

  return {
    isImpersonating,
    impersonatedBusinessId,
    activeSession,
    startImpersonate,
    endImpersonate,
  };
}
