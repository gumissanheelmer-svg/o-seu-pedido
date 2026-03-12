import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CustomerReview {
  id: string;
  business_id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  approved: boolean;
  created_at: string;
}

export function usePublicReviews(businessId: string) {
  return useQuery({
    queryKey: ['public-reviews', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_reviews')
        .select('*')
        .eq('business_id', businessId)
        .eq('approved', true)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return (data || []) as CustomerReview[];
    },
    enabled: !!businessId,
  });
}

export function usePopularProducts(businessId: string) {
  return useQuery({
    queryKey: ['popular-products', businessId],
    queryFn: async () => {
      // Get order items for this business's orders, grouped by product
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('business_id', businessId);
      
      if (ordersError) throw ordersError;
      if (!orders || orders.length === 0) return [];

      const orderIds = orders.map(o => o.id);
      
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .in('order_id', orderIds);
      
      if (itemsError) throw itemsError;
      
      // Aggregate by product_id
      const productCounts: Record<string, number> = {};
      (items || []).forEach(item => {
        productCounts[item.product_id] = (productCounts[item.product_id] || 0) + item.quantity;
      });

      // Sort by count descending, take top 6
      const topProductIds = Object.entries(productCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([id]) => id);

      if (topProductIds.length === 0) return [];

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*, category:categories(id, name)')
        .in('id', topProductIds)
        .eq('active', true);
      
      if (productsError) throw productsError;

      // Sort by popularity order
      return (products || []).sort((a, b) => {
        return topProductIds.indexOf(a.id) - topProductIds.indexOf(b.id);
      });
    },
    enabled: !!businessId,
  });
}
