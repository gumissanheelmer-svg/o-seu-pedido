import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { 
  Receipt, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Plus,
  MoreHorizontal,
  Search,
  Filter,
  Building2,
  Users,
  Calendar,
  FileText,
  TrendingUp,
  AlertCircle,
  Ban
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSuperAdmin, Subscription } from '@/hooks/useSuperAdmin';
import { useAffiliates } from '@/hooks/useAffiliates';
import { 
  SubscriptionStatus, 
  SubscriptionPlan,
  subscriptionPlanLabels,
  subscriptionPlanPrices,
  subscriptionStatusLabels,
} from '@/types/database';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pendente', color: 'bg-warning/20 text-warning', icon: Clock },
  active: { label: 'Ativo', color: 'bg-success/20 text-success', icon: CheckCircle2 },
  overdue: { label: 'Atrasado', color: 'bg-destructive/20 text-destructive', icon: AlertTriangle },
  cancelled: { label: 'Cancelado', color: 'bg-muted text-muted-foreground', icon: Ban },
  suspended: { label: 'Suspenso', color: 'bg-destructive/20 text-destructive', icon: AlertCircle },
};

const planConfig: Record<SubscriptionPlan, { label: string; color: string }> = {
  starter: { label: 'Starter', color: 'bg-muted text-muted-foreground' },
  pro: { label: 'Pro', color: 'bg-primary/20 text-primary' },
  premium: { label: 'Premium', color: 'bg-amber-500/20 text-amber-600' },
};

const Subscriptions = () => {
  const { subscriptions, businesses, isLoading, updateSubscription, createSubscription, metrics } = useSuperAdmin();
  const { affiliates } = useAffiliates();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [newSubscription, setNewSubscription] = useState({
    businessId: '',
    amount: 500,
    dueDate: '',
    plan: 'starter' as SubscriptionPlan,
    affiliateId: '',
    internalNotes: '',
  });

  // Businesses without subscriptions
  const businessesWithoutSub = useMemo(() => {
    const subsBusinessIds = subscriptions?.map(s => s.business_id) || [];
    return businesses?.filter(b => !subsBusinessIds.includes(b.id) && b.approval_status === 'approved') || [];
  }, [businesses, subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions?.filter(sub => {
      const matchesSearch = sub.business?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
      const matchesPlan = planFilter === 'all' || sub.plan === planFilter;
      return matchesSearch && matchesStatus && matchesPlan;
    }) || [];
  }, [subscriptions, searchQuery, statusFilter, planFilter]);

  const handleMarkAsPaid = (subscriptionId: string) => {
    updateSubscription.mutate({
      subscriptionId,
      status: 'active',
      paidAt: new Date().toISOString(),
    });
  };

  const handleSuspend = (subscriptionId: string) => {
    updateSubscription.mutate({
      subscriptionId,
      status: 'overdue' as SubscriptionStatus,
      paidAt: null,
    });
  };

  const handleCreateSubscription = () => {
    if (!newSubscription.businessId || !newSubscription.dueDate) return;
    
    createSubscription.mutate({
      businessId: newSubscription.businessId,
      amount: newSubscription.amount,
      dueDate: newSubscription.dueDate,
      plan: newSubscription.plan,
      affiliateId: newSubscription.affiliateId || null,
      internalNotes: newSubscription.internalNotes || null,
    });
    
    setShowCreateDialog(false);
    setNewSubscription({ businessId: '', amount: 500, dueDate: '', plan: 'starter', affiliateId: '', internalNotes: '' });
  };

  const handleEditSubscription = () => {
    if (!selectedSubscription) return;
    
    updateSubscription.mutate({
      subscriptionId: selectedSubscription.id,
      plan: selectedSubscription.plan,
      amount: selectedSubscription.amount,
      nextBillingDate: selectedSubscription.next_billing_date || undefined,
      affiliateId: selectedSubscription.affiliate_id,
      internalNotes: selectedSubscription.internal_notes,
    });
    
    setShowEditDialog(false);
    setSelectedSubscription(null);
  };

  const openEditDialog = (subscription: Subscription) => {
    setSelectedSubscription({ ...subscription });
    setShowEditDialog(true);
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
          <h1 className="text-2xl font-display font-bold text-foreground">Assinaturas</h1>
          <p className="text-muted-foreground">Gerencie as assinaturas e planos das empresas</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} disabled={businessesWithoutSub.length === 0}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Assinatura
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.activeSubscriptions}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                <p className="text-2xl font-bold">{metrics.overdueRevenue.toLocaleString()} MZN</p>
                <p className="text-xs text-muted-foreground">Em Atraso</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.totalRevenue.toLocaleString()} MZN</p>
                <p className="text-xs text-muted-foreground">Receita Mensal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por empresa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="overdue">Atrasados</SelectItem>
              <SelectItem value="cancelled">Cancelados</SelectItem>
            </SelectContent>
          </Select>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Planos</SelectItem>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="space-y-4">
        {filteredSubscriptions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma assinatura encontrada</p>
            </CardContent>
          </Card>
        ) : (
          filteredSubscriptions.map((subscription, index) => {
            const status = statusConfig[subscription.status] || statusConfig.pending;
            const plan = planConfig[subscription.plan] || planConfig.starter;
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={subscription.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-foreground">
                              {subscription.business?.name || 'Empresa não encontrada'}
                            </h3>
                            <Badge className={plan.color}>
                              {plan.label}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Próxima: {subscription.next_billing_date ? format(new Date(subscription.next_billing_date), "dd/MM/yyyy", { locale: pt }) : 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Receipt className="w-3.5 h-3.5" />
                              <span>{subscription.amount.toLocaleString()} {subscription.currency}</span>
                            </div>
                            {subscription.affiliate && (
                              <div className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                <span>{subscription.affiliate.name}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={status.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                            {subscription.start_date && (
                              <span className="text-xs text-muted-foreground">
                                Desde {format(new Date(subscription.start_date), "MMM yyyy", { locale: pt })}
                              </span>
                            )}
                          </div>

                          {subscription.internal_notes && (
                            <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground flex items-start gap-1">
                              <FileText className="w-3 h-3 mt-0.5 shrink-0" />
                              <span className="line-clamp-1">{subscription.internal_notes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="shrink-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(subscription)}>
                            <FileText className="w-4 h-4 mr-2" />
                            Editar Assinatura
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {subscription.status !== 'active' && (
                            <DropdownMenuItem onClick={() => handleMarkAsPaid(subscription.id)}>
                              <CheckCircle2 className="w-4 h-4 mr-2 text-success" />
                              Marcar como Ativo
                            </DropdownMenuItem>
                          )}
                          {subscription.status === 'active' && (
                            <DropdownMenuItem onClick={() => handleSuspend(subscription.id)} className="text-destructive">
                              <Ban className="w-4 h-4 mr-2" />
                              Suspender
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Assinatura</DialogTitle>
            <DialogDescription>
              Crie uma assinatura para uma empresa aprovada
            </DialogDescription>
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
                  {businessesWithoutSub.map(business => (
                    <SelectItem key={business.id} value={business.id}>
                      {business.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Plano</Label>
              <Select 
                value={newSubscription.plan} 
                onValueChange={(v: SubscriptionPlan) => setNewSubscription(prev => ({ 
                  ...prev, 
                  plan: v,
                  amount: subscriptionPlanPrices[v]
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter - {subscriptionPlanPrices.starter} MZN</SelectItem>
                  <SelectItem value="pro">Pro - {subscriptionPlanPrices.pro} MZN</SelectItem>
                  <SelectItem value="premium">Premium - {subscriptionPlanPrices.premium} MZN</SelectItem>
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
              <Label>Próxima Cobrança</Label>
              <Input
                type="date"
                value={newSubscription.dueDate}
                onChange={(e) => setNewSubscription(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Afiliado Responsável (opcional)</Label>
              <Select 
                value={newSubscription.affiliateId} 
                onValueChange={(v) => setNewSubscription(prev => ({ ...prev, affiliateId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um afiliado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {affiliates?.filter(a => a.active).map(affiliate => (
                    <SelectItem key={affiliate.id} value={affiliate.id}>
                      {affiliate.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observações Internas</Label>
              <Textarea
                value={newSubscription.internalNotes}
                onChange={(e) => setNewSubscription(prev => ({ ...prev, internalNotes: e.target.value }))}
                placeholder="Notas visíveis apenas para Super Admin..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSubscription}>
              Criar Assinatura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subscription Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Assinatura</DialogTitle>
            <DialogDescription>
              {selectedSubscription?.business?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Plano</Label>
                <Select 
                  value={selectedSubscription.plan} 
                  onValueChange={(v: SubscriptionPlan) => setSelectedSubscription(prev => prev ? ({ 
                    ...prev, 
                    plan: v,
                    amount: subscriptionPlanPrices[v]
                  }) : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter - {subscriptionPlanPrices.starter} MZN</SelectItem>
                    <SelectItem value="pro">Pro - {subscriptionPlanPrices.pro} MZN</SelectItem>
                    <SelectItem value="premium">Premium - {subscriptionPlanPrices.premium} MZN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor (MZN)</Label>
                <Input
                  type="number"
                  value={selectedSubscription.amount}
                  onChange={(e) => setSelectedSubscription(prev => prev ? ({ ...prev, amount: Number(e.target.value) }) : null)}
                />
              </div>
              <div className="space-y-2">
                <Label>Próxima Cobrança</Label>
                <Input
                  type="date"
                  value={selectedSubscription.next_billing_date || ''}
                  onChange={(e) => setSelectedSubscription(prev => prev ? ({ ...prev, next_billing_date: e.target.value }) : null)}
                />
              </div>
              <div className="space-y-2">
                <Label>Afiliado Responsável</Label>
                <Select 
                  value={selectedSubscription.affiliate_id || ''} 
                  onValueChange={(v) => setSelectedSubscription(prev => prev ? ({ ...prev, affiliate_id: v || null }) : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {affiliates?.filter(a => a.active).map(affiliate => (
                      <SelectItem key={affiliate.id} value={affiliate.id}>
                        {affiliate.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Observações Internas</Label>
                <Textarea
                  value={selectedSubscription.internal_notes || ''}
                  onChange={(e) => setSelectedSubscription(prev => prev ? ({ ...prev, internal_notes: e.target.value }) : null)}
                  placeholder="Notas visíveis apenas para Super Admin..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSubscription}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subscriptions;
