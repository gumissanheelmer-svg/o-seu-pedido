// Custom types for the Agenda Smart - Encomendas application

export type BusinessType = 'lanchonete' | 'bolos' | 'buques' | 'restaurante' | 'presente' | 'decoracao' | 'personalizado' | 'outro';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'blocked';
export type SubscriptionStatus = 'active' | 'pending' | 'overdue' | 'cancelled';
export type AppRole = 'super_admin' | 'admin';
export type PaymentMethod = 'mpesa' | 'emola' | null;

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  business_type: BusinessType;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  whatsapp_number: string;
  address: string | null;
  approval_status: ApprovalStatus;
  active: boolean;
  created_at: string;
  updated_at: string;
  // Payment configuration
  mpesa_number: string | null;
  emola_number: string | null;
  payment_required: boolean;
  signal_amount: number | null;
  confirmation_message: string | null;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  category_id: string | null;
  prep_hours: number;
  active: boolean;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  business_id: string;
  client_name: string;
  client_phone: string;
  delivery_date: string;
  delivery_time: string | null;
  delivery_address: string | null;
  status: OrderStatus;
  notes: string | null;
  total_amount: number;
  created_at: string;
  updated_at: string;
  // New order fields
  payment_method: string | null;
  transaction_code: string | null;
  amount_paid: number | null;
  payment_confirmed: boolean;
  order_description: string | null;
  quantity: number;
  order_type: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface UsedTransactionCode {
  id: string;
  business_id: string;
  transaction_code: string;
  order_id: string | null;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

// Order form data for public order flow
export interface OrderFormData {
  // Step 1: Product
  orderType: string;
  orderDescription: string;
  quantity: number;
  
  // Step 2: Delivery & Client
  clientName: string;
  clientPhone: string;
  deliveryDate: string;
  deliveryTime: string;
  deliveryAddress: string;
  notes: string;
  
  // Step 3: Payment (conditional)
  paymentMethod: 'mpesa' | 'emola' | null;
  transactionCode: string;
  amountPaid: number;
  paymentMessage: string;
}

export const businessTypeLabels: Record<BusinessType, string> = {
  lanchonete: 'Lanchonete',
  bolos: 'Bolos & Confeitaria',
  buques: 'Buquês & Flores',
  restaurante: 'Restaurante',
  presente: 'Presentes',
  decoracao: 'Decoração de Eventos',
  personalizado: 'Produtos Personalizados',
  outro: 'Outro',
};

export const orderTypeLabels: Record<string, string> = {
  bolo: 'Bolo',
  buque: 'Buquê',
  presente: 'Presente',
  decoracao: 'Decoração',
  personalizado: 'Personalizado',
  outro: 'Outro',
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Pronto',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

export const orderStatusColors: Record<OrderStatus, string> = {
  pending: 'bg-pending text-pending-foreground',
  confirmed: 'bg-primary text-primary-foreground',
  preparing: 'bg-warning text-warning-foreground',
  ready: 'bg-success text-success-foreground',
  delivered: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive text-destructive-foreground',
};

export const paymentMethodLabels: Record<string, string> = {
  mpesa: 'M-Pesa',
  emola: 'e-Mola',
};
