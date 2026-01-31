import { CartItem, Business } from '@/types/database';
import { formatPaymentMethod } from './payment-parser';

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

// New interface for simplified order flow
export interface OrderMessageParams {
  businessName: string;
  clientName: string;
  orderDescription?: string;
  quantity?: number;
  orderType?: string;
  deliveryDate: string;
  deliveryTime?: string;
  deliveryAddress?: string;
  notes?: string;
  paymentMethod?: 'mpesa' | 'emola' | null;
  transactionCode?: string;
  amountPaid?: number;
  // New fields for catalog orders
  items?: string;
  total?: number;
  fulfillmentType?: string;
}

export function sanitizePhoneNumber(phone: string): string | null {
  if (!phone) return null;
  
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Handle Mozambique numbers
  // If starts with 0, remove it and add 258
  if (cleaned.startsWith('0')) {
    cleaned = '258' + cleaned.slice(1);
  }
  
  // If doesn't start with 258, add it
  if (!cleaned.startsWith('258')) {
    cleaned = '258' + cleaned;
  }
  
  // Validate length (258 + 9 digits = 12 total)
  if (cleaned.length !== 12) {
    return null;
  }
  
  return cleaned;
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

export function generateOrderMessage({
  businessName,
  clientName,
  orderDescription,
  quantity,
  orderType,
  deliveryDate,
  deliveryTime,
  deliveryAddress,
  notes,
  paymentMethod,
  transactionCode,
  amountPaid,
  items,
  total,
  fulfillmentType,
}: OrderMessageParams): string {
  let message = `Olá! 👋\n\n`;
  message += `Fiz uma encomenda na *${businessName}* 🎁\n\n`;
  message += `👤 *Cliente:* ${clientName}\n`;
  
  // If items list is provided (catalog flow)
  if (items) {
    message += `\n📋 *Itens:*\n${items}\n`;
    if (total) {
      message += `\n💰 *Total:* ${formatCurrency(total)}\n`;
    }
  } else if (orderDescription) {
    // Simple order flow
    message += `📦 *Encomenda:* ${orderDescription}`;
    if (quantity && quantity > 1) {
      message += ` (${quantity}x)`;
    }
    message += '\n';
    
    if (orderType) {
      message += `📋 *Tipo:* ${orderType}\n`;
    }
  }
  
  message += `\n📅 *Data de entrega:* ${deliveryDate}\n`;
  
  if (deliveryTime) {
    message += `⏰ *Hora:* ${deliveryTime}\n`;
  }
  
  if (fulfillmentType) {
    message += `🚚 *Método:* ${fulfillmentType}\n`;
  }
  
  if (deliveryAddress) {
    message += `📍 *Local:* ${deliveryAddress}\n`;
  }
  
  // Only include payment info if there was a payment
  if (paymentMethod && transactionCode) {
    message += '\n';
    message += `💳 *Método:* ${formatPaymentMethod(paymentMethod)}\n`;
    message += `🔐 *Código da transação:* ${transactionCode}\n`;
    
    if (amountPaid && amountPaid > 0) {
      message += `💰 *Valor pago:* ${formatCurrency(amountPaid)}\n`;
    }
  }
  
  if (notes) {
    message += `\n📝 *Observações:* ${notes}\n`;
  }
  
  message += '\nAguardo confirmação 🙏';

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

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as +258 84 XXX XXXX
  if (cleaned.startsWith('258') && cleaned.length === 12) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  
  // Format as 84 XXX XXXX
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  }
  
  return phone;
}
