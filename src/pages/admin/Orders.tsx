import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  CreditCard,
  Check,
  X,
  ChevronRight,
  Package
} from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Order, OrderStatus, orderStatusLabels, orderStatusColors, orderTypeLabels } from '@/types/database';
import { formatCurrency, formatPhoneNumber } from '@/lib/whatsapp';
import { formatPaymentMethod } from '@/lib/payment-parser';
import { cn } from '@/lib/utils';

const statusOptions: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

export default function Orders() {
  const { orders, isLoading, updateOrderStatus, confirmPayment } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = 
      order.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.order_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.transaction_code?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus.mutateAsync({ orderId, status });
  };

  const handleConfirmPayment = async (orderId: string) => {
    await confirmPayment.mutateAsync(orderId);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-MZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Encomendas</h1>
          <p className="text-muted-foreground mt-1">Gerencie todas as suas encomendas</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, descrição ou código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {orderStatusLabels[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">Nenhuma encomenda encontrada</p>
            <p className="text-muted-foreground">As encomendas aparecerão aqui quando os clientes fizerem pedidos</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {order.client_name}
                        </h3>
                        <Badge className={cn('shrink-0', orderStatusColors[order.status])}>
                          {orderStatusLabels[order.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-2">
                        {order.order_description || 'Sem descrição'}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(order.delivery_date)}
                        </span>
                        {order.delivery_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {order.delivery_time}
                          </span>
                        )}
                        {order.payment_method && (
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            {formatPaymentMethod(order.payment_method as 'mpesa' | 'emola')}
                            {order.payment_confirmed ? (
                              <Check className="w-3 h-3 text-success" />
                            ) : (
                              <span className="text-warning">(pendente)</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Detalhes da Encomenda</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => handleStatusChange(selectedOrder.id, value as OrderStatus)}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {orderStatusLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Client Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Cliente
                  </h4>
                  <div className="pl-6 space-y-2 text-sm">
                    <p className="text-foreground">{selectedOrder.client_name}</p>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      {formatPhoneNumber(selectedOrder.client_phone)}
                    </p>
                  </div>
                </div>

                {/* Order Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Encomenda
                  </h4>
                  <div className="pl-6 space-y-2 text-sm">
                    {selectedOrder.order_type && (
                      <p className="text-muted-foreground">
                        Tipo: {orderTypeLabels[selectedOrder.order_type] || selectedOrder.order_type}
                      </p>
                    )}
                    <p className="text-foreground">{selectedOrder.order_description}</p>
                    <p className="text-muted-foreground">Quantidade: {selectedOrder.quantity}</p>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Entrega
                  </h4>
                  <div className="pl-6 space-y-2 text-sm">
                    <p className="text-foreground">{formatDate(selectedOrder.delivery_date)}</p>
                    {selectedOrder.delivery_time && (
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {selectedOrder.delivery_time}
                      </p>
                    )}
                    {selectedOrder.delivery_address && (
                      <p className="text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {selectedOrder.delivery_address}
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment Info */}
                {selectedOrder.payment_method && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Pagamento
                    </h4>
                    <div className="pl-6 space-y-2 text-sm">
                      <p className="text-foreground">
                        {formatPaymentMethod(selectedOrder.payment_method as 'mpesa' | 'emola')}
                      </p>
                      {selectedOrder.transaction_code && (
                        <p className="text-muted-foreground font-mono">
                          Código: {selectedOrder.transaction_code}
                        </p>
                      )}
                      {(selectedOrder.amount_paid ?? 0) > 0 && (
                        <p className="text-foreground font-semibold">
                          Valor: {formatCurrency(selectedOrder.amount_paid ?? 0)}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Status:</span>
                        {selectedOrder.payment_confirmed ? (
                          <Badge className="bg-success text-success-foreground">Confirmado</Badge>
                        ) : (
                          <Badge className="bg-warning text-warning-foreground">Pendente</Badge>
                        )}
                      </div>
                      {!selectedOrder.payment_confirmed && (
                        <Button
                          size="sm"
                          variant="success"
                          className="mt-2"
                          onClick={() => handleConfirmPayment(selectedOrder.id)}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Confirmar Pagamento
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground font-medium">Observações:</p>
                    <p className="text-sm text-foreground">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      const waLink = `https://wa.me/258${selectedOrder.client_phone.replace(/\D/g, '')}`;
                      window.open(waLink, '_blank');
                    }}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                  {selectedOrder.status === 'pending' && (
                    <Button
                      variant="success"
                      className="flex-1"
                      onClick={() => handleStatusChange(selectedOrder.id, 'confirmed')}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Confirmar
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
