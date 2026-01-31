import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ValidateCodeResult {
  isValid: boolean;
  error?: string;
}

export function useTransactionValidation(businessId: string) {
  // Check if a transaction code has already been used
  const validateCode = async (code: string): Promise<ValidateCodeResult> => {
    if (!code || code.trim().length < 6) {
      return { isValid: false, error: 'Código de transação inválido' };
    }

    const cleanCode = code.trim().toUpperCase();

    const { data, error } = await supabase
      .from('used_transaction_codes')
      .select('id')
      .eq('business_id', businessId)
      .eq('transaction_code', cleanCode)
      .maybeSingle();

    if (error) {
      console.error('Error validating transaction code:', error);
      return { isValid: false, error: 'Erro ao validar código' };
    }

    if (data) {
      return { isValid: false, error: 'Este código de transação já foi utilizado' };
    }

    return { isValid: true };
  };

  // Register a transaction code as used
  const registerCode = useMutation({
    mutationFn: async ({ code, orderId }: { code: string; orderId?: string }) => {
      const cleanCode = code.trim().toUpperCase();

      const { data, error } = await supabase
        .from('used_transaction_codes')
        .insert({
          business_id: businessId,
          transaction_code: cleanCode,
          order_id: orderId,
        })
        .select()
        .single();

      if (error) {
        // Handle duplicate key error
        if (error.code === '23505') {
          throw new Error('Este código de transação já foi utilizado');
        }
        throw error;
      }

      return data;
    },
  });

  return {
    validateCode,
    registerCode,
  };
}

// Hook to get used transaction codes for admin view
export function useUsedTransactionCodes(businessId: string) {
  return useQuery({
    queryKey: ['used-transaction-codes', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('used_transaction_codes')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });
}
