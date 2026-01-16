import { CartItem, Business } from '@/types/database';

interface WhatsAppMessageParams {
  business: Business;
  clientName: string;
  clientPhone: string;
  deliveryDate: string;
  deliveryTime?: string;
  deliveryAddress?: string;
  items: CartItem[];
  notes?: string;
  totalAmount: number;
}

export function generateWhatsAppMessage({
  business,
  clientName,
  deliveryDate,
  deliveryTime,
  deliveryAddress,
  items,
  notes,
  totalAmount,
}: WhatsAppMessageParams): string {
  const formattedDate = new Date(deliveryDate).toLocaleDateString('pt-MZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const itemsList = items
    .map(
      (item) =>
        `• ${item.quantity}x ${item.product.name} - ${formatCurrency(item.product.price * item.quantity)}`
    )
    .join('\n');

  let message = `🛒 *NOVO PEDIDO - ${business.name.toUpperCase()}*\n\n`;
  message += `👤 *Cliente:* ${clientName}\n`;
  message += `📅 *Entrega:* ${formattedDate}`;
  if (deliveryTime) {
    message += ` às ${deliveryTime}`;
  }
  message += '\n';
  
  if (deliveryAddress) {
    message += `📍 *Endereço:* ${deliveryAddress}\n`;
  }
  
  message += `\n📋 *Itens do Pedido:*\n${itemsList}\n`;
  message += `\n💰 *Total:* ${formatCurrency(totalAmount)}`;
  
  if (notes) {
    message += `\n\n📝 *Observações:* ${notes}`;
  }
  
  message += '\n\n✅ Por favor confirme o recebimento deste pedido!';

  return message;
}

export function generateWhatsAppLink(phoneNumber: string, message: string): string {
  // Remove non-numeric characters from phone
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Add Mozambique country code if not present
  const phoneWithCode = cleanPhone.startsWith('258') ? cleanPhone : `258${cleanPhone}`;
  
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${phoneWithCode}?text=${encodedMessage}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
