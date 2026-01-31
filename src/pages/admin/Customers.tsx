import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, User, Phone, Mail, FileText, ShoppingBag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCustomers, Customer } from '@/hooks/useCustomers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/whatsapp';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function Customers() {
  const { businessId } = useAuth();
  const { customers, isLoading } = useCustomers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Fetch orders for selected customer
  const { data: customerOrders } = useQuery({
    queryKey: ['customer-orders', selectedCustomer?.id],
    queryFn: async () => {
      if (!selectedCustomer?.id) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('business_id', businessId)
        .eq('customer_id', selectedCustomer.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCustomer?.id && !!businessId,
  });

  const filteredCustomers = customers?.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
        <p className="text-muted-foreground mt-1">Histórico de clientes que fizeram encomendas</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou telefone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Customers List */}
      {filteredCustomers?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">Nenhum cliente encontrado</p>
            <p className="text-muted-foreground">Os clientes aparecerão aqui após fazerem encomendas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers?.map((customer, index) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelectedCustomer(customer)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground truncate">{customer.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {customer.phone}
                      </p>
                      {customer.email && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Desde {format(new Date(customer.created_at), "MMM yyyy", { locale: pt })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Customer Detail Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedCustomer.name}</h3>
                  <p className="text-muted-foreground">{selectedCustomer.phone}</p>
                  {selectedCustomer.email && (
                    <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedCustomer.notes && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm flex items-start gap-2">
                    <FileText className="w-4 h-4 shrink-0 mt-0.5" />
                    {selectedCustomer.notes}
                  </p>
                </div>
              )}

              {/* Orders History */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Histórico de Encomendas ({customerOrders?.length || 0})
                </h4>
                
                {customerOrders?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma encomenda encontrada
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {customerOrders?.map((order) => (
                      <div
                        key={order.id}
                        className="p-3 border rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {format(new Date(order.delivery_date), "dd/MM/yyyy", { locale: pt })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.order_description || order.order_type || 'Encomenda'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">
                            {formatCurrency(order.total_amount)}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
