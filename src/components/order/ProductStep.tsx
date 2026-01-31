import { motion } from 'framer-motion';
import { Package, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrderFormData, orderTypeLabels, BusinessType } from '@/types/database';

interface ProductStepProps {
  formData: OrderFormData;
  onUpdate: (data: Partial<OrderFormData>) => void;
  onNext: () => void;
  businessType: BusinessType;
}

const orderTypes = [
  { value: 'bolo', label: '🎂 Bolo' },
  { value: 'buque', label: '💐 Buquê' },
  { value: 'presente', label: '🎁 Presente' },
  { value: 'decoracao', label: '🎊 Decoração' },
  { value: 'personalizado', label: '✨ Personalizado' },
  { value: 'outro', label: '📦 Outro' },
];

export function ProductStep({ formData, onUpdate, onNext, businessType }: ProductStepProps) {
  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, formData.quantity + delta);
    onUpdate({ quantity: newQuantity });
  };

  const isValid = formData.orderType && formData.orderDescription.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">O que você deseja?</h2>
        <p className="text-muted-foreground mt-1">Descreva sua encomenda</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="orderType">Tipo de Encomenda *</Label>
          <Select
            value={formData.orderType}
            onValueChange={(value) => onUpdate({ orderType: value })}
          >
            <SelectTrigger id="orderType" className="h-12">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {orderTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="orderDescription">Descrição da Encomenda *</Label>
          <Textarea
            id="orderDescription"
            value={formData.orderDescription}
            onChange={(e) => onUpdate({ orderDescription: e.target.value })}
            placeholder="Ex: Bolo de chocolate com cobertura de brigadeiro, escrito 'Parabéns Ana'"
            className="min-h-[120px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Seja específico sobre o que deseja (sabor, cor, tamanho, detalhes, etc.)
          </p>
        </div>

        <div className="space-y-2">
          <Label>Quantidade</Label>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12"
              onClick={() => handleQuantityChange(-1)}
              disabled={formData.quantity <= 1}
            >
              <Minus className="w-5 h-5" />
            </Button>
            <div className="flex-1 text-center">
              <span className="text-3xl font-bold text-foreground">
                {formData.quantity}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12"
              onClick={() => handleQuantityChange(1)}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <Button
        onClick={onNext}
        disabled={!isValid}
        className="w-full h-14 text-lg"
        size="xl"
      >
        Continuar
      </Button>
    </motion.div>
  );
}
