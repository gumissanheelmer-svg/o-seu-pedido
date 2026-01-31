import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, MapPin, User, Phone, FileText, Check, MessageCircle } from 'lucide-react';
import { format, addHours, isBefore, startOfDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCartContext } from '@/contexts/CartContext';
import { Business } from '@/types/database';
import { formatCurrency, generateOrderMessage, sanitizePhoneNumber } from '@/lib/whatsapp';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CheckoutFlowProps {
  business: Business;
  onBack: () => void;
  onComplete: () => void;
}

type FulfillmentType = 'pickup' | 'delivery';

interface CheckoutData {
  clientName: string;
  clientPhone: string;
  fulfillmentType: FulfillmentType;
  deliveryAddress: string;
  deliveryDate: Date | undefined;
  deliveryTime: string;
  notes: string;
}

export function CheckoutFlow({ business, onBack, onComplete }: CheckoutFlowProps) {
  const { items, totalAmount, clearCart } = useCartContext();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    clientName: '',
    clientPhone: '',
    fulfillmentType: 'pickup',
    deliveryAddress: '',
    deliveryDate: undefined,
    deliveryTime: '',
    notes: '',
  });

  // Calculate minimum date based on max prep hours of products in cart
  const maxPrepHours = Math.max(...items.map(item => item.product.prep_hours || 24));
  const minDate = startOfDay(addHours(new Date(), maxPrepHours));

  const isDateDisabled = (date: Date) => {
    return isBefore(date, minDate);
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    
    try {
      // Create or get customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .upsert({
          business_id: business.id,
          name: checkoutData.clientName,
          phone: checkoutData.clientPhone,
        }, { onConflict: 'business_id,phone' })
        .select()
        .single();

      if (customerError) throw customerError;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          business_id: business.id,
          customer_id: customer.id,
          client_name: checkoutData.clientName,
          client_phone: checkoutData.clientPhone,
          delivery_date: format(checkoutData.deliveryDate!, 'yyyy-MM-dd'),
          delivery_time: checkoutData.deliveryTime || null,
          delivery_address: checkoutData.fulfillmentType === 'delivery' ? checkoutData.deliveryAddress : null,
          notes: checkoutData.notes || null,
          order_type: checkoutData.fulfillmentType,
          total_amount: totalAmount,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: item.lineTotal,
        selected_options: JSON.parse(JSON.stringify(item.selectedOptions)),
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setOrderCreated(true);
      setStep(3);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Erro ao registar encomenda. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendWhatsApp = () => {
    const phoneNumber = sanitizePhoneNumber(business.whatsapp_number);
    
    if (!phoneNumber) {
      toast.error('Número de WhatsApp inválido. Contacte o estabelecimento.');
      return;
    }

    const itemsList = items.map(item => {
      const options = item.selectedOptions.length > 0
        ? ` (${item.selectedOptions.map(o => o.valueName).join(', ')})`
        : '';
      return `• ${item.quantity}x ${item.product.name}${options} - ${formatCurrency(item.lineTotal)}`;
    }).join('\n');

    const message = generateOrderMessage({
      businessName: business.name,
      clientName: checkoutData.clientName,
      items: itemsList,
      deliveryDate: format(checkoutData.deliveryDate!, 'dd/MM/yyyy', { locale: pt }),
      deliveryTime: checkoutData.deliveryTime,
      fulfillmentType: checkoutData.fulfillmentType === 'pickup' ? 'Retirada' : 'Entrega',
      deliveryAddress: checkoutData.deliveryAddress,
      total: totalAmount,
      notes: checkoutData.notes,
    });

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    clearCart();
    onComplete();
  };

  const canProceedStep1 = checkoutData.clientName && checkoutData.clientPhone;
  const canProceedStep2 = checkoutData.deliveryDate && 
    (checkoutData.fulfillmentType === 'pickup' || checkoutData.deliveryAddress);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold text-foreground">Finalizar Encomenda</h1>
              <p className="text-xs text-muted-foreground">
                {items.length} {items.length === 1 ? 'item' : 'itens'} • {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Steps Indicator */}
      <div className="container max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 max-w-16 rounded-full ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="container max-w-lg mx-auto px-4 pb-24">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Seus Dados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input
                      id="name"
                      value={checkoutData.clientName}
                      onChange={(e) => setCheckoutData({ ...checkoutData, clientName: e.target.value })}
                      placeholder="Seu nome"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={checkoutData.clientPhone}
                      onChange={(e) => setCheckoutData({ ...checkoutData, clientPhone: e.target.value })}
                      placeholder="84 000 0000"
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                className="w-full h-12"
                disabled={!canProceedStep1}
                onClick={() => setStep(2)}
              >
                Continuar
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={checkoutData.fulfillmentType}
                    onValueChange={(value) => setCheckoutData({ 
                      ...checkoutData, 
                      fulfillmentType: value as FulfillmentType 
                    })}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                        <div className="font-medium">Retirar no local</div>
                        <div className="text-sm text-muted-foreground">
                          {business.address || 'Endereço não informado'}
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                        <div className="font-medium">Entrega</div>
                        <div className="text-sm text-muted-foreground">
                          Informe o endereço de entrega
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {checkoutData.fulfillmentType === 'delivery' && (
                    <div className="space-y-2">
                      <Label htmlFor="address">Endereço de entrega *</Label>
                      <Textarea
                        id="address"
                        value={checkoutData.deliveryAddress}
                        onChange={(e) => setCheckoutData({ ...checkoutData, deliveryAddress: e.target.value })}
                        placeholder="Rua, número, bairro..."
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Data e Hora
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <CalendarComponent
                      mode="single"
                      selected={checkoutData.deliveryDate}
                      onSelect={(date) => setCheckoutData({ ...checkoutData, deliveryDate: date })}
                      disabled={isDateDisabled}
                      locale={pt}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Horário preferido</Label>
                    <Input
                      id="time"
                      type="time"
                      value={checkoutData.deliveryTime}
                      onChange={(e) => setCheckoutData({ ...checkoutData, deliveryTime: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Mínimo de {maxPrepHours}h de antecedência para preparação
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Observações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={checkoutData.notes}
                    onChange={(e) => setCheckoutData({ ...checkoutData, notes: e.target.value })}
                    placeholder="Alguma observação especial?"
                    rows={3}
                  />
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Voltar
                </Button>
                <Button
                  className="flex-1"
                  disabled={!canProceedStep2 || isSubmitting}
                  onClick={handleSubmitOrder}
                >
                  {isSubmitting ? 'Registando...' : 'Confirmar Encomenda'}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="w-10 h-10 text-success" />
                </motion.div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Encomenda Registada!
                </h2>
                <p className="text-muted-foreground">
                  Agora envie a confirmação pelo WhatsApp para finalizar
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo da Encomenda</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.product.name}
                        {item.selectedOptions.length > 0 && (
                          <span className="text-muted-foreground">
                            {' '}({item.selectedOptions.map(o => o.valueName).join(', ')})
                          </span>
                        )}
                      </span>
                      <span className="font-medium">{formatCurrency(item.lineTotal)}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(totalAmount)}</span>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <User className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span>{checkoutData.clientName}</span>
                    </div>
                    <div className="flex gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span>{checkoutData.clientPhone}</span>
                    </div>
                    <div className="flex gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span>
                        {checkoutData.deliveryDate && format(checkoutData.deliveryDate, "dd 'de' MMMM", { locale: pt })}
                        {checkoutData.deliveryTime && ` às ${checkoutData.deliveryTime}`}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span>
                        {checkoutData.fulfillmentType === 'pickup' 
                          ? 'Retirar no local' 
                          : checkoutData.deliveryAddress}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                className="w-full h-14 text-base bg-[#25D366] hover:bg-[#20bd5a]"
                onClick={handleSendWhatsApp}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Enviar no WhatsApp
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                O estabelecimento irá confirmar a sua encomenda
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
