import { motion } from 'framer-motion';
import { Truck, Calendar, Clock, MapPin, User, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { OrderFormData } from '@/types/database';

interface DeliveryStepProps {
  formData: OrderFormData;
  onUpdate: (data: Partial<OrderFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function DeliveryStep({ formData, onUpdate, onNext, onBack }: DeliveryStepProps) {
  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const isValid = 
    formData.clientName.trim().length >= 2 &&
    formData.clientPhone.trim().length >= 9 &&
    formData.deliveryDate;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Truck className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Entrega & Contacto</h2>
        <p className="text-muted-foreground mt-1">Quando e onde deseja receber?</p>
      </div>

      <div className="space-y-4">
        {/* Client Info */}
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientName" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Seu Nome *
            </Label>
            <Input
              id="clientName"
              type="text"
              value={formData.clientName}
              onChange={(e) => onUpdate({ clientName: e.target.value })}
              placeholder="Nome completo"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientPhone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              WhatsApp *
            </Label>
            <Input
              id="clientPhone"
              type="tel"
              value={formData.clientPhone}
              onChange={(e) => onUpdate({ clientPhone: e.target.value })}
              placeholder="84 XXX XXXX"
              className="h-12"
            />
          </div>
        </div>

        {/* Delivery Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="deliveryDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data *
            </Label>
            <Input
              id="deliveryDate"
              type="date"
              value={formData.deliveryDate}
              onChange={(e) => onUpdate({ deliveryDate: e.target.value })}
              min={minDate}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryTime" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Hora
            </Label>
            <Input
              id="deliveryTime"
              type="time"
              value={formData.deliveryTime}
              onChange={(e) => onUpdate({ deliveryTime: e.target.value })}
              className="h-12"
            />
          </div>
        </div>

        {/* Delivery Address */}
        <div className="space-y-2">
          <Label htmlFor="deliveryAddress" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Local de Entrega
          </Label>
          <Input
            id="deliveryAddress"
            type="text"
            value={formData.deliveryAddress}
            onChange={(e) => onUpdate({ deliveryAddress: e.target.value })}
            placeholder="Endereço ou ponto de referência"
            className="h-12"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Observações
          </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Alguma informação adicional? (opcional)"
            className="min-h-[80px] resize-none"
          />
        </div>
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
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 h-14 text-lg"
          size="xl"
        >
          Continuar
        </Button>
      </div>
    </motion.div>
  );
}
