import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { useToast } from '@/hooks/use-toast';

export interface Expense {
  id: string;
  business_id: string;
  description: string;
  amount: number;
  category: string;
  expense_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ExpenseInsert = {
  description: string;
  amount: number;
  category: string;
  expense_date: string;
  notes?: string | null;
};

export const EXPENSE_CATEGORIES = [
  { value: 'ingredientes', label: 'Ingredientes' },
  { value: 'embalagens', label: 'Embalagens' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'aluguel', label: 'Aluguel' },
  { value: 'salarios', label: 'Salários' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'equipamentos', label: 'Equipamentos' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'outros', label: 'Outros' },
];

export function useExpenses() {
  const { business } = useBusiness();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const businessId = business?.id;

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('business_id', businessId)
        .order('expense_date', { ascending: false });
      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!businessId,
  });

  const addExpense = useMutation({
    mutationFn: async (expense: ExpenseInsert) => {
      if (!businessId) throw new Error('Negócio não encontrado');
      const { error } = await supabase
        .from('expenses')
        .insert({ ...expense, business_id: businessId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', businessId] });
      toast({ title: 'Despesa registada com sucesso' });
    },
    onError: (err: any) => {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', businessId] });
      toast({ title: 'Despesa removida' });
    },
    onError: (err: any) => {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    },
  });

  // Computed metrics
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.expense_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalMonth = monthExpenses.reduce((s, e) => s + e.amount, 0);

  const byCategory = EXPENSE_CATEGORIES.map(cat => ({
    ...cat,
    total: monthExpenses.filter(e => e.category === cat.value).reduce((s, e) => s + e.amount, 0),
  })).filter(c => c.total > 0);

  return {
    expenses,
    isLoading,
    addExpense,
    deleteExpense,
    totalMonth,
    byCategory,
    monthExpenses,
  };
}
