import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Minus, ShoppingCart, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ProductWithOptions, ProductOption } from '@/hooks/useProducts';
import { useCartContext, SelectedOption } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/whatsapp';
import { toast } from 'sonner';

interface ProductDetailModalProps {
  product: ProductWithOptions | null;
  open: boolean;
  onClose: () => void;
}

export function ProductDetailModal({ product, open, onClose }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, SelectedOption>>({});
  const { addItem } = useCartContext();

  if (!product) return null;

  const options = product.options || [];
  
  const calculateTotalPrice = () => {
    const basePrice = product.price;
    const optionsTotal = Object.values(selectedOptions).reduce(
      (sum, opt) => sum + opt.priceAdjustment,
      0
    );
    return (basePrice + optionsTotal) * quantity;
  };

  const handleOptionChange = (option: ProductOption, valueId: string) => {
    const selectedValue = option.values?.find(v => v.id === valueId);
    if (!selectedValue) return;

    setSelectedOptions(prev => ({
      ...prev,
      [option.id]: {
        optionId: option.id,
        optionName: option.name,
        valueId: selectedValue.id,
        valueName: selectedValue.value,
        priceAdjustment: selectedValue.price_adjustment,
      },
    }));
  };

  const handleAddToCart = () => {
    // Check required options
    const requiredOptions = options.filter(o => o.required);
    const missingRequired = requiredOptions.filter(o => !selectedOptions[o.id]);
    
    if (missingRequired.length > 0) {
      toast.error(`Selecione: ${missingRequired.map(o => o.name).join(', ')}`);
      return;
    }

    addItem(product, Object.values(selectedOptions), quantity);
    toast.success('Adicionado ao carrinho!');
    
    // Reset and close
    setQuantity(1);
    setSelectedOptions({});
    onClose();
  };

  const handleClose = () => {
    setQuantity(1);
    setSelectedOptions({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Product Image */}
        {product.image_url && (
          <div className="aspect-video bg-muted rounded-lg overflow-hidden -mx-6 -mt-6 mb-4">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <DialogHeader>
          <DialogTitle className="text-xl">{product.name}</DialogTitle>
        </DialogHeader>

        {product.description && (
          <p className="text-muted-foreground text-sm">{product.description}</p>
        )}

        <p className="text-2xl font-bold text-primary">
          {formatCurrency(product.price)}
        </p>

        {/* Options */}
        {options.length > 0 && (
          <div className="space-y-6 mt-4">
            {options.map((option) => (
              <div key={option.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="font-medium">{option.name}</Label>
                  {option.required && (
                    <span className="text-xs text-destructive">*Obrigatório</span>
                  )}
                </div>

                {(option.type === 'radio' || option.type === 'select') && (
                  <RadioGroup
                    value={selectedOptions[option.id]?.valueId || ''}
                    onValueChange={(value) => handleOptionChange(option, value)}
                    className="space-y-2"
                  >
                    {option.values?.map((value) => (
                      <div
                        key={value.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleOptionChange(option, value.id)}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value={value.id} id={value.id} />
                          <Label htmlFor={value.id} className="cursor-pointer">
                            {value.value}
                          </Label>
                        </div>
                        {value.price_adjustment !== 0 && (
                          <span className="text-sm text-muted-foreground">
                            {value.price_adjustment > 0 ? '+' : ''}
                            {formatCurrency(value.price_adjustment)}
                          </span>
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {option.type === 'checkbox' && (
                  <div className="space-y-2">
                    {option.values?.map((value) => (
                      <div
                        key={value.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={value.id}
                            checked={selectedOptions[value.id]?.valueId === value.id}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleOptionChange(option, value.id);
                              } else {
                                setSelectedOptions(prev => {
                                  const updated = { ...prev };
                                  delete updated[value.id];
                                  return updated;
                                });
                              }
                            }}
                          />
                          <Label htmlFor={value.id} className="cursor-pointer">
                            {value.value}
                          </Label>
                        </div>
                        {value.price_adjustment !== 0 && (
                          <span className="text-sm text-muted-foreground">
                            +{formatCurrency(value.price_adjustment)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Separator className="my-4" />

        {/* Quantity */}
        <div className="flex items-center justify-between">
          <Label>Quantidade</Label>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-lg font-medium w-8 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(q => q + 1)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Add to Cart */}
        <Button className="w-full h-12 text-base mt-4" onClick={handleAddToCart}>
          <ShoppingCart className="w-5 h-5 mr-2" />
          Adicionar • {formatCurrency(calculateTotalPrice())}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
