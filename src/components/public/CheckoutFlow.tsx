import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, MapPin, User, Phone, FileText, MessageCircle } from 'lucide-react';
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
import { 
  slideHorizontal, 
  AnimatedCheck, 
  CelebrationParticles,
  shakeAnimation,
  MagneticButton 
} from './animations/MotionComponents';

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

// Step transition direction tracker
type Direction = 'left' | 'right';

export function CheckoutFlow({ business, onBack, onComplete }: CheckoutFlowProps) {
  const { items, totalAmount, clearCart } = useCartContext();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<Direction>('right');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  
  const primaryColor = business.primary_color || '#C9A24D';
  
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

  const goToStep = (newStep: number) => {
    setDirection(newStep > step ? 'right' : 'left');
    setStep(newStep);
  };

  const validateStep1 = () => {
    const errors: Record<string, boolean> = {};
    if (!checkoutData.clientName) errors.clientName = true;
    if (!checkoutData.clientPhone) errors.clientPhone = true;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Record<string, boolean> = {};
    if (!checkoutData.deliveryDate) errors.deliveryDate = true;
    if (checkoutData.fulfillmentType === 'delivery' && !checkoutData.deliveryAddress) {
      errors.deliveryAddress = true;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async () => {
    if (!validateStep2()) return;
    
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
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1500);
      goToStep(3);
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
    <div className="min-h-screen theme-premium-dark bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="container max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              className="hover:bg-white/10"
            >
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

      {/* Animated Progress Bar */}
      <div className="container max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="relative h-2 flex-1 max-w-16 rounded-full bg-muted/30 overflow-hidden">
              <motion.div
                className="absolute inset-0 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: s <= step ? 1 : 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{ originX: 0, backgroundColor: primaryColor }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="container max-w-lg mx-auto px-4 pb-24">
        <AnimatePresence mode="wait" initial={false}>
          {step === 1 && (
            <motion.div
              key="step1"
              variants={slideHorizontal(direction)}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <Card className="glass-card border-white/10 overflow-hidden">
                <CardHeader className="border-b border-white/5">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="w-5 h-5" style={{ color: primaryColor }} />
                    Seus Dados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <motion.div 
                    className="space-y-2"
                    animate={fieldErrors.clientName ? shakeAnimation.shake : {}}
                  >
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input
                      id="name"
                      value={checkoutData.clientName}
                      onChange={(e) => {
                        setCheckoutData({ ...checkoutData, clientName: e.target.value });
                        setFieldErrors({ ...fieldErrors, clientName: false });
                      }}
                      placeholder="Seu nome"
                      className={`bg-white/5 border-white/10 focus:border-primary focus-ring-gold ${
                        fieldErrors.clientName ? 'border-destructive' : ''
                      }`}
                    />
                  </motion.div>
                  <motion.div 
                    className="space-y-2"
                    animate={fieldErrors.clientPhone ? shakeAnimation.shake : {}}
                  >
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={checkoutData.clientPhone}
                      onChange={(e) => {
                        setCheckoutData({ ...checkoutData, clientPhone: e.target.value });
                        setFieldErrors({ ...fieldErrors, clientPhone: false });
                      }}
                      placeholder="84 000 0000"
                      className={`bg-white/5 border-white/10 focus:border-primary focus-ring-gold ${
                        fieldErrors.clientPhone ? 'border-destructive' : ''
                      }`}
                    />
                  </motion.div>
                </CardContent>
              </Card>

              <MagneticButton
                className="w-full h-12 rounded-xl font-semibold text-base ripple"
                style={{ 
                  backgroundColor: primaryColor, 
                  color: 'hsl(225 25% 6%)',
                  boxShadow: `0 0 30px -5px ${primaryColor}60`,
                }}
                disabled={!canProceedStep1}
                onClick={() => {
                  if (validateStep1()) goToStep(2);
                }}
              >
                Continuar
              </MagneticButton>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={slideHorizontal(direction)}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <Card className="glass-card border-white/10 overflow-hidden">
                <CardHeader className="border-b border-white/5">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="w-5 h-5" style={{ color: primaryColor }} />
                    Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <RadioGroup
                    value={checkoutData.fulfillmentType}
                    onValueChange={(value) => setCheckoutData({ 
                      ...checkoutData, 
                      fulfillmentType: value as FulfillmentType 
                    })}
                    className="space-y-3"
                  >
                    <motion.div 
                      className="flex items-center space-x-3 p-4 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                        <div className="font-medium">Retirar no local</div>
                        <div className="text-sm text-muted-foreground">
                          {business.address || 'Endereço não informado'}
                        </div>
                      </Label>
                    </motion.div>
                    <motion.div 
                      className="flex items-center space-x-3 p-4 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                        <div className="font-medium">Entrega</div>
                        <div className="text-sm text-muted-foreground">
                          Informe o endereço de entrega
                        </div>
                      </Label>
                    </motion.div>
                  </RadioGroup>

                  <AnimatePresence>
                    {checkoutData.fulfillmentType === 'delivery' && (
                      <motion.div 
                        className="space-y-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Label htmlFor="address">Endereço de entrega *</Label>
                        <Textarea
                          id="address"
                          value={checkoutData.deliveryAddress}
                          onChange={(e) => setCheckoutData({ ...checkoutData, deliveryAddress: e.target.value })}
                          placeholder="Rua, número, bairro..."
                          className="bg-white/5 border-white/10 focus:border-primary"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10 overflow-hidden">
                <CardHeader className="border-b border-white/5">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="w-5 h-5" style={{ color: primaryColor }} />
                    Data e Hora
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="flex justify-center">
                    <CalendarComponent
                      mode="single"
                      selected={checkoutData.deliveryDate}
                      onSelect={(date) => setCheckoutData({ ...checkoutData, deliveryDate: date })}
                      disabled={isDateDisabled}
                      locale={pt}
                      className="rounded-xl border border-white/10 bg-white/5 p-3 pointer-events-auto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Horário preferido</Label>
                    <Input
                      id="time"
                      type="time"
                      value={checkoutData.deliveryTime}
                      onChange={(e) => setCheckoutData({ ...checkoutData, deliveryTime: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                    <p className="text-xs text-muted-foreground">
                      Mínimo de {maxPrepHours}h de antecedência para preparação
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10 overflow-hidden">
                <CardHeader className="border-b border-white/5">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="w-5 h-5" style={{ color: primaryColor }} />
                    Observações
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Textarea
                    value={checkoutData.notes}
                    onChange={(e) => setCheckoutData({ ...checkoutData, notes: e.target.value })}
                    placeholder="Alguma observação especial?"
                    rows={3}
                    className="bg-white/5 border-white/10"
                  />
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => goToStep(1)} 
                  className="flex-1 border-white/10 bg-white/5 hover:bg-white/10"
                >
                  Voltar
                </Button>
                <MagneticButton
                  className="flex-1 h-12 rounded-xl font-semibold ripple"
                  style={{ 
                    backgroundColor: primaryColor, 
                    color: 'hsl(225 25% 6%)',
                    boxShadow: `0 0 30px -5px ${primaryColor}60`,
                  }}
                  disabled={!canProceedStep2 || isSubmitting}
                  onClick={handleSubmitOrder}
                >
                  {isSubmitting ? 'Registando...' : 'Confirmar Encomenda'}
                </MagneticButton>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={slideHorizontal('right')}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Celebration particles */}
              <AnimatePresence>
                {showCelebration && <CelebrationParticles count={16} />}
              </AnimatePresence>
              
              <motion.div 
                className="text-center py-8 relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex justify-center mb-6">
                  <div 
                    className="relative"
                    style={{ color: primaryColor }}
                  >
                    {/* Glow behind check */}
                    <motion.div
                      className="absolute inset-0 blur-2xl rounded-full"
                      style={{ backgroundColor: primaryColor }}
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                    <AnimatedCheck size={80} color={primaryColor} delay={0.3} />
                  </div>
                </div>
                <motion.h2 
                  className="text-2xl font-bold text-foreground mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Encomenda Registada!
                </motion.h2>
                <motion.p 
                  className="text-muted-foreground"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  Agora envie a confirmação pelo WhatsApp para finalizar
                </motion.p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="glass-card border-white/10 overflow-hidden">
                  <CardHeader className="border-b border-white/5">
                    <CardTitle className="text-base">Resumo da Encomenda</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    {items.map((item, index) => (
                      <motion.div 
                        key={index} 
                        className="flex justify-between text-sm"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.05 }}
                      >
                        <span>
                          {item.quantity}x {item.product.name}
                          {item.selectedOptions.length > 0 && (
                            <span className="text-muted-foreground">
                              {' '}({item.selectedOptions.map(o => o.valueName).join(', ')})
                            </span>
                          )}
                        </span>
                        <span className="font-medium">{formatCurrency(item.lineTotal)}</span>
                      </motion.div>
                    ))}
                    <Separator className="bg-white/10" />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span style={{ color: primaryColor }}>{formatCurrency(totalAmount)}</span>
                    </div>
                    <Separator className="bg-white/10" />
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
              </motion.div>

              {/* WhatsApp button with shimmer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="relative"
              >
                <MagneticButton
                  className="w-full h-14 text-base rounded-xl font-bold relative overflow-hidden ripple"
                  style={{
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    color: 'white',
                    boxShadow: '0 0 40px -5px rgba(37, 211, 102, 0.5)',
                  }}
                  onClick={handleSendWhatsApp}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      repeatDelay: 4,
                    }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Enviar pelo WhatsApp
                  </span>
                </MagneticButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="container max-w-lg mx-auto px-4 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Powered by <span className="font-semibold" style={{ color: primaryColor }}>Agenda Smart</span>
        </p>
      </footer>
    </div>
  );
}
