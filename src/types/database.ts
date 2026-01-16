// Custom types for the Encomendas application

export type BusinessType = 'lanchonete' | 'bolos' | 'buques' | 'restaurante' | 'outro';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'blocked';
export type SubscriptionStatus = 'active' | 'pending' | 'overdue' | 'cancelled';
export type AppRole = 'super_admin' | 'admin';

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  business_type: BusinessType;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  primary_color: string;
  secondary_color: string;
  whatsapp_number: string;
  address: string | null;
  approval_status: ApprovalStatus;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  active: boolean;
  sort_order: number;
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

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export const businessTypeLabels: Record<BusinessType, string> = {
  lanchonete: 'Lanchonete',
  bolos: 'Bolos & Confeitaria',
  buques: 'Buquês & Flores',
  restaurante: 'Restaurante',
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
