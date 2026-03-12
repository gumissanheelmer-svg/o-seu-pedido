import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Category {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  active: boolean;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export function useCategories() {
  const { businessId } = useAuth();
  const queryClient = useQueryClient();

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('business_id', businessId)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Category[];
    },
    enabled: !!businessId,
  });

  const createCategory = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const { error } = await supabase.from('categories').insert({
        business_id: businessId,
        name: data.name,
        description: data.description || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', businessId] });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Category> }) => {
      const { error } = await supabase
        .from('categories')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', businessId] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', businessId] });
    },
  });

  return {
    categories,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}

export function usePublicCategories(businessId: string) {
  return useQuery({
    queryKey: ['public-categories', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('business_id', businessId)
        .eq('active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Category[];
    },
    enabled: !!businessId,
  });
}
