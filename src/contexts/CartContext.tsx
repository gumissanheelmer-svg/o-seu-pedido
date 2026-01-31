import { useState, createContext, useContext, ReactNode } from 'react';
import { ProductWithOptions, ProductOptionValue } from '@/hooks/useProducts';

export interface SelectedOption {
  optionId: string;
  optionName: string;
  valueId: string;
  valueName: string;
  priceAdjustment: number;
}

export interface CartItemWithOptions {
  product: ProductWithOptions;
  quantity: number;
  selectedOptions: SelectedOption[];
  unitPrice: number; // Base price + option adjustments
  lineTotal: number;
}

interface CartContextType {
  items: CartItemWithOptions[];
  addItem: (product: ProductWithOptions, selectedOptions: SelectedOption[], quantity?: number) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemWithOptions[]>([]);

  const calculateUnitPrice = (product: ProductWithOptions, selectedOptions: SelectedOption[]) => {
    const basePrice = product.price;
    const optionsTotal = selectedOptions.reduce((sum, opt) => sum + opt.priceAdjustment, 0);
    return basePrice + optionsTotal;
  };

  const addItem = (product: ProductWithOptions, selectedOptions: SelectedOption[], quantity = 1) => {
    const unitPrice = calculateUnitPrice(product, selectedOptions);
    const lineTotal = unitPrice * quantity;

    setItems((current) => [
      ...current,
      {
        product,
        quantity,
        selectedOptions,
        unitPrice,
        lineTotal,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((current) => current.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }

    setItems((current) =>
      current.map((item, i) =>
        i === index
          ? { ...item, quantity, lineTotal: item.unitPrice * quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}
