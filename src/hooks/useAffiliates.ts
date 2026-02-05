 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useToast } from '@/hooks/use-toast';
 
 export interface Affiliate {
   id: string;
   name: string;
   phone: string;
   fixed_commission: number;
   active: boolean;
   created_at: string;
   updated_at: string;
 }
 
 export interface AffiliateSale {
   id: string;
   affiliate_id: string;
   business_id: string;
   sale_value: number;
   commission_value: number;
   platform_profit: number;
   created_at: string;
   affiliate?: Affiliate;
   business?: {
     name: string;
     slug: string;
   };
 }
 
 export interface AffiliateWithStats extends Affiliate {
   total_businesses: number;
   total_sales: number;
   total_commission: number;
   total_profit: number;
 }
 
 export function useAffiliates() {
   const { toast } = useToast();
   const queryClient = useQueryClient();
 
   // Fetch all affiliates
   const { data: affiliates, isLoading: isLoadingAffiliates } = useQuery({
     queryKey: ['affiliates'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('affiliates_orders')
         .select('*')
         .order('created_at', { ascending: false });
 
       if (error) throw error;
       return data as Affiliate[];
     },
   });
 
   // Fetch affiliate sales
   const { data: affiliateSales, isLoading: isLoadingSales } = useQuery({
     queryKey: ['affiliate-sales'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('affiliate_sales_orders')
         .select(`
           *,
           affiliate:affiliates_orders(name, phone),
           business:businesses(name, slug)
         `)
         .order('created_at', { ascending: false });
 
       if (error) throw error;
       return data as AffiliateSale[];
     },
   });
 
   // Fetch businesses with affiliate info
   const { data: businessesWithAffiliates } = useQuery({
     queryKey: ['businesses-with-affiliates'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('businesses')
         .select(`
           id,
           name,
           slug,
           affiliate_id,
           affiliate:affiliates_orders(name, phone)
         `)
         .order('created_at', { ascending: false });
 
       if (error) throw error;
       return data;
     },
   });
 
   // Create affiliate
   const createAffiliate = useMutation({
     mutationFn: async (data: { name: string; phone: string; fixed_commission: number }) => {
       const { error } = await supabase
         .from('affiliates_orders')
         .insert(data);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['affiliates'] });
       toast({
         title: 'Sucesso',
         description: 'Afiliado criado com sucesso.',
       });
     },
     onError: (error: any) => {
       toast({
         title: 'Erro',
         description: error.message || 'Erro ao criar afiliado.',
         variant: 'destructive',
       });
     },
   });
 
   // Update affiliate
   const updateAffiliate = useMutation({
     mutationFn: async ({ id, ...data }: { id: string; name?: string; phone?: string; fixed_commission?: number; active?: boolean }) => {
       const { error } = await supabase
         .from('affiliates_orders')
         .update(data)
         .eq('id', id);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['affiliates'] });
       toast({
         title: 'Sucesso',
         description: 'Afiliado atualizado.',
       });
     },
     onError: (error: any) => {
       toast({
         title: 'Erro',
         description: error.message || 'Erro ao atualizar afiliado.',
         variant: 'destructive',
       });
     },
   });
 
   // Delete affiliate
   const deleteAffiliate = useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase
         .from('affiliates_orders')
         .delete()
         .eq('id', id);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['affiliates'] });
       toast({
         title: 'Sucesso',
         description: 'Afiliado removido.',
       });
     },
     onError: (error: any) => {
       toast({
         title: 'Erro',
         description: error.message || 'Erro ao remover afiliado.',
         variant: 'destructive',
       });
     },
   });
 
   // Assign affiliate to business
   const assignAffilitateToBusiness = useMutation({
     mutationFn: async ({ businessId, affiliateId }: { businessId: string; affiliateId: string | null }) => {
       const { error } = await supabase
         .from('businesses')
         .update({ affiliate_id: affiliateId })
         .eq('id', businessId);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['businesses-with-affiliates'] });
       queryClient.invalidateQueries({ queryKey: ['superadmin-businesses'] });
       toast({
         title: 'Sucesso',
         description: 'Afiliado atribuído ao negócio.',
       });
     },
     onError: (error: any) => {
       toast({
         title: 'Erro',
         description: error.message || 'Erro ao atribuir afiliado.',
         variant: 'destructive',
       });
     },
   });
 
   // Record affiliate sale
   const recordAffiliateSale = useMutation({
     mutationFn: async (data: { affiliate_id: string; business_id: string; sale_value: number; commission_value: number }) => {
       const { error } = await supabase
         .from('affiliate_sales_orders')
         .insert(data);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['affiliate-sales'] });
       toast({
         title: 'Sucesso',
         description: 'Venda registada.',
       });
     },
     onError: (error: any) => {
       toast({
         title: 'Erro',
         description: error.message || 'Erro ao registar venda.',
         variant: 'destructive',
       });
     },
   });
 
   // Calculate metrics
   const metrics = {
     totalAffiliates: affiliates?.length || 0,
     activeAffiliates: affiliates?.filter(a => a.active).length || 0,
     totalSales: affiliateSales?.reduce((sum, s) => sum + s.sale_value, 0) || 0,
     totalCommissions: affiliateSales?.reduce((sum, s) => sum + s.commission_value, 0) || 0,
     totalPlatformProfit: affiliateSales?.reduce((sum, s) => sum + s.platform_profit, 0) || 0,
   };
 
   // Affiliates with stats
   const affiliatesWithStats: AffiliateWithStats[] = (affiliates || []).map(affiliate => {
     const sales = affiliateSales?.filter(s => s.affiliate_id === affiliate.id) || [];
     const businesses = businessesWithAffiliates?.filter(b => b.affiliate_id === affiliate.id) || [];
     
     return {
       ...affiliate,
       total_businesses: businesses.length,
       total_sales: sales.reduce((sum, s) => sum + s.sale_value, 0),
       total_commission: sales.reduce((sum, s) => sum + s.commission_value, 0),
       total_profit: sales.reduce((sum, s) => sum + s.platform_profit, 0),
     };
   });
 
   return {
     affiliates,
     affiliateSales,
     businessesWithAffiliates,
     affiliatesWithStats,
     metrics,
     isLoading: isLoadingAffiliates || isLoadingSales,
     createAffiliate,
     updateAffiliate,
     deleteAffiliate,
     assignAffilitateToBusiness,
     recordAffiliateSale,
   };
 }