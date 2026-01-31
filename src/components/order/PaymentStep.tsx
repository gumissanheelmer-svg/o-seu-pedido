import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, AlertCircle, CheckCircle, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { OrderFormData, Business } from '@/types/database';
import { parsePaymentMessage, formatPaymentMethod } from '@/lib/payment-parser';
import { formatCurrency } from '@/lib/whatsapp';
import { useTransactionValidation } from '@/hooks/useTransactionValidation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PaymentStepProps {
  formData: OrderFormData;
  onUpdate: (data: Partial<OrderFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  business: Business;
}

export function PaymentStep({ formData, onUpdate, onNext, onBack, business }: PaymentStepProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isCodeValid, setIsCodeValid] = useState(false);
  
  const { validateCode } = useTransactionValidation(business.id);
  
  const signalAmount = business.signal_amount || 0;

  // Parse payment message when it changes
  useEffect(() => {
    if (!formData.paymentMessage) {
      setValidationError(null);
      setIsCodeValid(false);
      onUpdate({ transactionCode: '', amountPaid: 0, paymentMethod: null });
      return;
    }

    const parsed = parsePaymentMessage(formData.paymentMessage);
    
    if (!parsed) {
      setValidationError('Não foi possível extrair os dados da mensagem. Cole a mensagem de confirmação completa.');
      setIsCodeValid(false);
      return;
    }

    onUpdate({
      transactionCode: parsed.transactionCode,
      amountPaid: parsed.amount,
      paymentMethod: parsed.method,
    });

    // Validate amount
    if (signalAmount > 0 && parsed.amount < signalAmount) {
      setValidationError(`O valor pago (${formatCurrency(parsed.amount)}) é menor que o sinal mínimo (${formatCurrency(signalAmount)})`);
      setIsCodeValid(false);
      return;
    }

    setValidationError(null);
    setIsCodeValid(false); // Will be validated on button click
  }, [formData.paymentMessage, signalAmount, onUpdate]);

  const handleValidateAndContinue = async () => {
    if (!formData.transactionCode) {
      setValidationError('Código de transação não encontrado');
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const result = await validateCode(formData.transactionCode);
      
      if (!result.isValid) {
        setValidationError(result.error || 'Código inválido');
        setIsCodeValid(false);
        return;
      }

      setIsCodeValid(true);
      onNext();
    } catch (error) {
      setValidationError('Erro ao validar código');
    } finally {
      setIsValidating(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const hasPaymentInfo = formData.transactionCode && formData.amountPaid > 0;
  const amountIsValid = signalAmount <= 0 || formData.amountPaid >= signalAmount;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Pagamento</h2>
        <p className="text-muted-foreground mt-1">
          {signalAmount > 0 
            ? `Sinal mínimo: ${formatCurrency(signalAmount)}`
            : 'Faça o pagamento e cole a confirmação'
          }
        </p>
      </div>

      {/* Payment Methods */}
      <div className="space-y-4">
        {business.mpesa_number && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">M-Pesa</p>
                  <p className="text-lg font-bold text-foreground">{business.mpesa_number}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(business.mpesa_number!, 'Número')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {business.emola_number && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">e-Mola</p>
                  <p className="text-lg font-bold text-foreground">{business.emola_number}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(business.emola_number!, 'Número')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Confirmation */}
      <div className="space-y-2">
        <Label htmlFor="paymentMessage">
          Cole a mensagem de confirmação *
        </Label>
        <Textarea
          id="paymentMessage"
          value={formData.paymentMessage}
          onChange={(e) => onUpdate({ paymentMessage: e.target.value })}
          placeholder="Cole aqui a mensagem SMS de confirmação do M-Pesa ou e-Mola..."
          className="min-h-[120px] resize-none font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Após fazer o pagamento, copie a mensagem de confirmação e cole aqui
        </p>
      </div>

      {/* Extracted Info */}
      {hasPaymentInfo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'rounded-xl p-4 border',
            amountIsValid 
              ? 'bg-success/10 border-success/30' 
              : 'bg-warning/10 border-warning/30'
          )}
        >
          <div className="flex items-start gap-3">
            {amountIsValid ? (
              <CheckCircle className="w-5 h-5 text-success mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
            )}
            <div className="flex-1 space-y-1">
              <p className="font-medium text-foreground">Dados extraídos:</p>
              <div className="text-sm space-y-0.5 text-muted-foreground">
                <p>Método: {formatPaymentMethod(formData.paymentMethod)}</p>
                <p>Código: <span className="font-mono">{formData.transactionCode}</span></p>
                <p>Valor: {formatCurrency(formData.amountPaid)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Validation Error */}
      {validationError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border border-destructive/30 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
            <p className="text-sm text-destructive">{validationError}</p>
          </div>
        </motion.div>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-14"
          size="lg"
        >
          Voltar
        </Button>
        <Button
          onClick={handleValidateAndContinue}
          disabled={!hasPaymentInfo || !amountIsValid || isValidating}
          className="flex-1 h-14 text-lg"
          size="xl"
        >
          {isValidating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Validando...
            </>
          ) : (
            'Continuar'
          )}
        </Button>
      </div>
    </motion.div>
  );
}
