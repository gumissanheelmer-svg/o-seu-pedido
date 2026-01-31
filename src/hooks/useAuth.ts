import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { AppRole } from '@/types/database';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  role: AppRole | null;
  businessId: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    role: null,
    businessId: null,
  });

  const fetchUserRole = useCallback(async (userId: string, userEmail?: string) => {
    // First check if user already has a role
    const { data } = await supabase
      .from('user_roles')
      .select('role, business_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      setState((prev) => ({
        ...prev,
        role: data.role as AppRole,
        businessId: data.business_id,
        isLoading: false,
      }));
      return;
    }

    // If no role exists and user email is in super admin allowlist, assign super_admin role
    if (userEmail) {
      const { data: isSuperAdminEmail } = await supabase
        .rpc('is_super_admin_email', { _email: userEmail });

      if (isSuperAdminEmail) {
        // Create super_admin role for this user
        await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'super_admin', business_id: null });

        setState((prev) => ({
          ...prev,
          role: 'super_admin' as AppRole,
          businessId: null,
          isLoading: false,
        }));
        return;
      }
    }
    
    // No role found, mark as done loading
    setState((prev) => ({
      ...prev,
      isLoading: false,
    }));
  }, []);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Set user/session immediately but keep loading true until role is fetched
        setState((prev) => ({
          ...prev,
          user: session?.user ?? null,
          session,
        }));

        if (session?.user) {
          // Fetch role - this will set isLoading to false when done
          await fetchUserRole(session.user.id, session.user.email);
        } else {
          setState((prev) => ({
            ...prev,
            role: null,
            businessId: null,
            isLoading: false,
          }));
        }
      }
    );

    // Then get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setState((prev) => ({
        ...prev,
        user: session?.user ?? null,
        session,
      }));

      if (session?.user) {
        await fetchUserRole(session.user.id, session.user.email);
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserRole]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    isAdmin: state.role === 'admin',
    isSuperAdmin: state.role === 'super_admin',
  };
}
