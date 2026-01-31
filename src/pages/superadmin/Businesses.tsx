import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Ban, 
  Eye,
  MoreHorizontal,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSuperAdmin, BusinessWithOwner } from '@/hooks/useSuperAdmin';
import { businessTypeLabels, ApprovalStatus } from '@/types/database';

const statusConfig: Record<ApprovalStatus, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pendente', color: 'bg-warning text-warning-foreground', icon: Eye },
  approved: { label: 'Aprovado', color: 'bg-success text-success-foreground', icon: CheckCircle2 },
  rejected: { label: 'Rejeitado', color: 'bg-destructive text-destructive-foreground', icon: XCircle },
  blocked: { label: 'Bloqueado', color: 'bg-destructive text-destructive-foreground', icon: Ban },
};

const Businesses = () => {
  const { businesses, isLoading, updateBusinessStatus, metrics } = useSuperAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessWithOwner | null>(null);

  const filteredBusinesses = businesses?.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         business.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || business.approval_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (businessId: string) => {
    updateBusinessStatus.mutate({ 
      businessId, 
      approvalStatus: 'approved', 
      active: true 
    });
  };

  const handleReject = (businessId: string) => {
    updateBusinessStatus.mutate({ 
      businessId, 
      approvalStatus: 'rejected', 
      active: false 
    });
  };

  const handleBlock = (businessId: string) => {
    updateBusinessStatus.mutate({ 
      businessId, 
      approvalStatus: 'blocked', 
      active: false 
    });
  };

  const handleToggleActive = (business: BusinessWithOwner) => {
    updateBusinessStatus.mutate({ 
      businessId: business.id, 
      approvalStatus: business.approval_status, 
      active: !business.active 
    });
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
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Empresas</h1>
        <p className="text-muted-foreground">Gerencie as empresas cadastradas na plataforma</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Building2 className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.totalBusinesses}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.pendingApproval}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.approvedActive}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                <Ban className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.blocked}</p>
                <p className="text-xs text-muted-foreground">Bloqueados</p>
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
            placeholder="Buscar por nome ou slug..."
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
            <SelectItem value="approved">Aprovados</SelectItem>
            <SelectItem value="rejected">Rejeitados</SelectItem>
            <SelectItem value="blocked">Bloqueados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Businesses List */}
      <div className="space-y-4">
        {filteredBusinesses?.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma empresa encontrada</p>
            </CardContent>
          </Card>
        ) : (
          filteredBusinesses?.map((business, index) => {
            const status = statusConfig[business.approval_status];
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={business.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{business.name}</h3>
                          <p className="text-sm text-muted-foreground">/{business.slug}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {businessTypeLabels[business.business_type as keyof typeof businessTypeLabels] || business.business_type}
                            </Badge>
                            <Badge className={`${status.color} text-xs`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                            {business.approval_status === 'approved' && (
                              <Badge variant={business.active ? 'default' : 'secondary'} className="text-xs">
                                {business.active ? 'Ativo' : 'Inativo'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBusiness(business)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {business.approval_status === 'pending' && (
                              <>
                                <DropdownMenuItem onClick={() => handleApprove(business.id)}>
                                  <CheckCircle2 className="w-4 h-4 mr-2 text-success" />
                                  Aprovar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReject(business.id)}>
                                  <XCircle className="w-4 h-4 mr-2 text-destructive" />
                                  Rejeitar
                                </DropdownMenuItem>
                              </>
                            )}
                            {business.approval_status === 'approved' && (
                              <>
                                <DropdownMenuItem onClick={() => handleToggleActive(business)}>
                                  {business.active ? 'Desativar' : 'Ativar'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleBlock(business.id)}
                                  className="text-destructive"
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  Bloquear
                                </DropdownMenuItem>
                              </>
                            )}
                            {(business.approval_status === 'rejected' || business.approval_status === 'blocked') && (
                              <DropdownMenuItem onClick={() => handleApprove(business.id)}>
                                <CheckCircle2 className="w-4 h-4 mr-2 text-success" />
                                Reativar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Business Detail Dialog */}
      <Dialog open={!!selectedBusiness} onOpenChange={() => setSelectedBusiness(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Empresa</DialogTitle>
          </DialogHeader>
          {selectedBusiness && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{selectedBusiness.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Slug</p>
                  <p className="font-medium">/{selectedBusiness.slug}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium">
                    {businessTypeLabels[selectedBusiness.business_type as keyof typeof businessTypeLabels] || selectedBusiness.business_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="font-medium">{selectedBusiness.whatsapp_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={statusConfig[selectedBusiness.approval_status].color}>
                    {statusConfig[selectedBusiness.approval_status].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pagamento</p>
                  <p className="font-medium">
                    {selectedBusiness.payment_required ? 'Obrigatório' : 'Opcional'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Data de Criação</p>
                  <p className="font-medium">
                    {format(new Date(selectedBusiness.created_at), "dd 'de' MMMM 'de' yyyy", { locale: pt })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Businesses;
