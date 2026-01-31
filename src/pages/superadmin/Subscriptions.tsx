import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Plus,
  MoreHorizontal,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useSuperAdmin, Subscription } from '@/hooks/useSuperAdmin';
import { SubscriptionStatus } from '@/types/database';

const statusConfig: Record<SubscriptionStatus, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pendente', color: 'bg-warning text-warning-foreground', icon: Clock },
  active: { label: 'Pago', color: 'bg-success text-success-foreground', icon: CheckCircle2 },
  overdue: { label: 'Atrasado', color: 'bg-destructive text-destructive-foreground', icon: AlertTriangle },
  cancelled: { label: 'Cancelado', color: 'bg-muted text-muted-foreground', icon: AlertTriangle },
};

const Subscriptions = () => {
  const { subscriptions, businesses, isLoading, updateSubscription, createSubscription, metrics } = useSuperAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSubscription, setNewSubscription] = useState({
    businessId: '',
    amount: 500,
    dueDate: '',
  });

  const filteredSubscriptions = subscriptions?.filter(sub => {
    const matchesSearch = sub.business?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleMarkAsPaid = (subscriptionId: string) => {
    updateSubscription.mutate({
      subscriptionId,
      status: 'active',
      paidAt: new Date().toISOString(),
    });
  };

  const handleMarkAsOverdue = (subscriptionId: string) => {
    updateSubscription.mutate({
      subscriptionId,
      status: 'overdue',
      paidAt: null,
    });
  };

  const handleCreateSubscription = () => {
    if (!newSubscription.businessId || !newSubscription.dueDate) return;
    
    createSubscription.mutate({
      businessId: newSubscription.businessId,
      amount: newSubscription.amount,
      dueDate: newSubscription.dueDate,
    });
    
    setShowCreateDialog(false);
    setNewSubscription({ businessId: '', amount: 500, dueDate: '' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Mensalidades</h1>
          <p className="text-muted-foreground">Gerencie as mensalidades das empresas</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Mensalidade
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.pendingSubscriptions}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.overdueSubscriptions}</p>
                <p className="text-xs text-muted-foreground">Atrasados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{subscriptions?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por empresa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="active">Pagos</SelectItem>
            <SelectItem value="overdue">Atrasados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Subscriptions List */}
      <div className="space-y-4">
        {filteredSubscriptions?.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma mensalidade encontrada</p>
            </CardContent>
          </Card>
        ) : (
          filteredSubscriptions?.map((subscription, index) => {
            const status = statusConfig[subscription.status];
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={subscription.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <CreditCard className="w-6 h-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {subscription.business?.name || 'Empresa não encontrada'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Vencimento: {format(new Date(subscription.due_date), "dd/MM/yyyy", { locale: pt })}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`${status.color} text-xs`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                            <span className="text-sm font-medium">
                              {subscription.amount} {subscription.currency}
                            </span>
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {subscription.status !== 'active' && (
                            <DropdownMenuItem onClick={() => handleMarkAsPaid(subscription.id)}>
                              <CheckCircle2 className="w-4 h-4 mr-2 text-success" />
                              Marcar como Pago
                            </DropdownMenuItem>
                          )}
                          {subscription.status === 'pending' && (
                            <DropdownMenuItem onClick={() => handleMarkAsOverdue(subscription.id)}>
                              <AlertTriangle className="w-4 h-4 mr-2 text-destructive" />
                              Marcar como Atrasado
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create Subscription Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Mensalidade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Empresa</Label>
              <Select 
                value={newSubscription.businessId} 
                onValueChange={(v) => setNewSubscription(prev => ({ ...prev, businessId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {businesses?.filter(b => b.approval_status === 'approved').map(business => (
                    <SelectItem key={business.id} value={business.id}>
                      {business.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor (MZN)</Label>
              <Input
                type="number"
                value={newSubscription.amount}
                onChange={(e) => setNewSubscription(prev => ({ ...prev, amount: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Data de Vencimento</Label>
              <Input
                type="date"
                value={newSubscription.dueDate}
                onChange={(e) => setNewSubscription(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSubscription}>
              Criar Mensalidade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subscriptions;
