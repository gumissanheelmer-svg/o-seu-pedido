import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/database';
import { useAuth } from './useAuth';

export interface ProductOption {
  id: string;
  product_id: string;
  name: string;
  type: 'select' | 'radio' | 'checkbox' | 'text';
  required: boolean;
  sort_order: number;
  created_at: string;
  values?: ProductOptionValue[];
}

export interface ProductOptionValue {
  id: string;
  option_id: string;
  value: string;
  price_adjustment: number;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface ProductWithOptions extends Omit<Product, 'category' | 'category_id' | 'prep_hours' | 'image_urls' | 'video_urls' | 'main_image_url'> {
  category_id?: string | null;
  prep_hours?: number;
  options?: ProductOption[];
  category?: { id: string; name: string } | null;
  // Media fields - made optional for backward compatibility
  image_urls?: string[] | null;
  video_urls?: string[] | null;
  main_image_url?: string | null;
}

export function useProducts() {
  const { businessId } = useAuth();
  const queryClient = useQueryClient();

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name)
        `)
        .eq('business_id', businessId)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as ProductWithOptions[];
    },
    enabled: !!businessId,
  });

  const createProduct = useMutation({
    mutationFn: async (data: { name: string; price: number; description?: string; category_id?: string; image_url?: string; active?: boolean; prep_hours?: number }) => {
      const { error } = await supabase.from('products').insert({
        business_id: businessId!,
        name: data.name,
        price: data.price,
        description: data.description || null,
        category_id: data.category_id || null,
        image_url: data.image_url || null,
        active: data.active ?? true,
        prep_hours: data.prep_hours || 24,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', businessId] });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
      const { error } = await supabase
        .from('products')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', businessId] });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', businessId] });
    },
  });

  return {
    products,
    isLoading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

export function useProductOptions(productId: string) {
  const queryClient = useQueryClient();

  const { data: options, isLoading } = useQuery({
    queryKey: ['product-options', productId],
    queryFn: async () => {
      const { data: optionsData, error: optionsError } = await supabase
        .from('product_options')
        .select('*')
        .eq('product_id', productId)
        .order('sort_order', { ascending: true });
      
      if (optionsError) throw optionsError;

      // Fetch values for each option
      const optionsWithValues = await Promise.all(
        (optionsData || []).map(async (option) => {
          const { data: values } = await supabase
            .from('product_option_values')
            .select('*')
            .eq('option_id', option.id)
            .eq('active', true)
            .order('sort_order', { ascending: true });
          
          return { ...option, values: values || [] } as ProductOption;
        })
      );

      return optionsWithValues;
    },
    enabled: !!productId,
  });

  const createOption = useMutation({
    mutationFn: async (data: { name: string; type: string; required: boolean }) => {
      const { data: option, error } = await supabase
        .from('product_options')
        .insert({
          product_id: productId,
          name: data.name,
          type: data.type,
          required: data.required,
        })
        .select()
        .single();
      if (error) throw error;
      return option;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-options', productId] });
    },
  });

  const deleteOption = useMutation({
    mutationFn: async (optionId: string) => {
      const { error } = await supabase
        .from('product_options')
        .delete()
        .eq('id', optionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-options', productId] });
    },
  });

  const createOptionValue = useMutation({
    mutationFn: async ({ optionId, data }: { optionId: string; data: { value: string; price_adjustment: number } }) => {
      const { error } = await supabase
        .from('product_option_values')
        .insert({
          option_id: optionId,
          value: data.value,
          price_adjustment: data.price_adjustment,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-options', productId] });
    },
  });

  const deleteOptionValue = useMutation({
    mutationFn: async (valueId: string) => {
      const { error } = await supabase
        .from('product_option_values')
        .delete()
        .eq('id', valueId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-options', productId] });
    },
  });

  return {
    options,
    isLoading,
    createOption,
    deleteOption,
    createOptionValue,
    deleteOptionValue,
  };
}

export function usePublicProducts(businessId: string) {
  return useQuery({
    queryKey: ['public-products', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name)
        `)
        .eq('business_id', businessId)
        .eq('active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;

      // Fetch options for each product
      const productsWithOptions = await Promise.all(
        (data || []).map(async (product) => {
          const { data: optionsData } = await supabase
            .from('product_options')
            .select('*')
            .eq('product_id', product.id)
            .order('sort_order', { ascending: true });

          const optionsWithValues = await Promise.all(
            (optionsData || []).map(async (option) => {
              const { data: values } = await supabase
                .from('product_option_values')
                .select('*')
                .eq('option_id', option.id)
                .eq('active', true)
                .order('sort_order', { ascending: true });
              
              return { ...option, values: values || [] };
            })
          );

          return { ...product, options: optionsWithValues } as ProductWithOptions;
        })
      );

      return productsWithOptions;
    },
    enabled: !!businessId,
  });
}
