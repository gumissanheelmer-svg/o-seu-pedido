import { motion } from 'framer-motion';
import { Send, Package, Truck, Calendar, Clock, MapPin, User, Phone, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrderFormData, Business, orderTypeLabels } from '@/types/database';
import { generateOrderMessage, generateWhatsAppLink, formatCurrency } from '@/lib/whatsapp';
import { formatPaymentMethod } from '@/lib/payment-parser';

interface ConfirmationStepProps {
  formData: OrderFormData;
  onBack: () => void;
  business: Business;
}

export function ConfirmationStep({ formData, onBack, business }: ConfirmationStepProps) {
  const formattedDate = new Date(formData.deliveryDate).toLocaleDateString('pt-MZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleSendWhatsApp = () => {
    const message = generateOrderMessage({
      businessName: business.name,
      clientName: formData.clientName,
      orderDescription: formData.orderDescription,
      quantity: formData.quantity,
      orderType: orderTypeLabels[formData.orderType] || formData.orderType,
      deliveryDate: formData.deliveryDate,
      deliveryTime: formData.deliveryTime || undefined,
      deliveryAddress: formData.deliveryAddress || undefined,
      notes: formData.notes || undefined,
      paymentMethod: formData.paymentMethod,
      transactionCode: formData.transactionCode || undefined,
      amountPaid: formData.amountPaid || undefined,
    });

    const whatsappLink = generateWhatsAppLink(business.whatsapp_number, message);
    window.open(whatsappLink, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Confirme sua Encomenda</h2>
        <p className="text-muted-foreground mt-1">Revise os dados antes de enviar</p>
      </div>

      {/* Order Summary */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Product Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Package className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Encomenda</h3>
          </div>
          <div className="space-y-2 pl-11 text-sm">
            <p className="text-foreground">
              <span className="text-muted-foreground">Tipo:</span> {orderTypeLabels[formData.orderType] || formData.orderType}
            </p>
            <p className="text-foreground">
              <span className="text-muted-foreground">Descrição:</span> {formData.orderDescription}
            </p>
            <p className="text-foreground">
              <span className="text-muted-foreground">Quantidade:</span> {formData.quantity}
            </p>
          </div>
        </div>

        {/* Client Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Cliente</h3>
          </div>
          <div className="space-y-2 pl-11 text-sm">
            <p className="text-foreground flex items-center gap-2">
              <User className="w-3 h-3 text-muted-foreground" />
              {formData.clientName}
            </p>
            <p className="text-foreground flex items-center gap-2">
              <Phone className="w-3 h-3 text-muted-foreground" />
              {formData.clientPhone}
            </p>
          </div>
        </div>

        {/* Delivery Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Truck className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Entrega</h3>
          </div>
          <div className="space-y-2 pl-11 text-sm">
            <p className="text-foreground flex items-center gap-2">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              {formattedDate}
            </p>
            {formData.deliveryTime && (
              <p className="text-foreground flex items-center gap-2">
                <Clock className="w-3 h-3 text-muted-foreground" />
                {formData.deliveryTime}
              </p>
            )}
            {formData.deliveryAddress && (
              <p className="text-foreground flex items-center gap-2">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                {formData.deliveryAddress}
              </p>
            )}
          </div>
        </div>

        {/* Payment Section (if applicable) */}
        {formData.paymentMethod && formData.transactionCode && (
          <div className="p-4 bg-success/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-success" />
              </div>
              <h3 className="font-semibold text-foreground">Pagamento</h3>
            </div>
            <div className="space-y-2 pl-11 text-sm">
              <p className="text-foreground">
                <span className="text-muted-foreground">Método:</span> {formatPaymentMethod(formData.paymentMethod)}
              </p>
              <p className="text-foreground">
                <span className="text-muted-foreground">Código:</span>{' '}
                <span className="font-mono">{formData.transactionCode}</span>
              </p>
              {formData.amountPaid > 0 && (
                <p className="text-foreground">
                  <span className="text-muted-foreground">Valor:</span>{' '}
                  {formatCurrency(formData.amountPaid)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {formData.notes && (
          <div className="p-4 border-t border-border bg-muted/30">
            <p className="text-sm text-muted-foreground">
              <strong>Observações:</strong> {formData.notes}
            </p>
          </div>
        )}
      </div>

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
          onClick={handleSendWhatsApp}
          className="flex-1 h-14 text-lg bg-success hover:bg-success/90"
          size="xl"
        >
          <Send className="w-5 h-5 mr-2" />
          Enviar pelo WhatsApp
        </Button>
      </div>
    </motion.div>
  );
}
