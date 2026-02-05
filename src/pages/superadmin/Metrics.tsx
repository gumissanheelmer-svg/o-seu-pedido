import { useMemo } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { 
  Building2, 
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
   Ban,
   Users,
   DollarSign,
   TrendingUp,
   ShoppingBag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
 import { useAffiliates } from '@/hooks/useAffiliates';
import { 
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
   Legend,
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
   LineChart,
   Line
} from 'recharts';

const Metrics = () => {
  const { businesses, subscriptions, metrics, isLoading } = useSuperAdmin();
   const { affiliatesWithStats, affiliateSales, metrics: affiliateMetrics, isLoading: isLoadingAffiliates } = useAffiliates();

  // Business status distribution
  const businessStatusData = useMemo(() => {
    if (!businesses) return [];
    
    const statusCounts = {
      pending: businesses.filter(b => b.approval_status === 'pending').length,
      approved: businesses.filter(b => b.approval_status === 'approved').length,
      rejected: businesses.filter(b => b.approval_status === 'rejected').length,
      blocked: businesses.filter(b => b.approval_status === 'blocked').length,
    };

    return [
      { name: 'Pendentes', value: statusCounts.pending, color: 'hsl(var(--warning))' },
      { name: 'Aprovadas', value: statusCounts.approved, color: 'hsl(var(--success))' },
      { name: 'Rejeitadas', value: statusCounts.rejected, color: 'hsl(var(--muted))' },
      { name: 'Bloqueadas', value: statusCounts.blocked, color: 'hsl(var(--destructive))' },
    ].filter(item => item.value > 0);
  }, [businesses]);
   
   // Affiliate performance data
   const affiliatePerformanceData = useMemo(() => {
     if (!affiliatesWithStats) return [];
     return affiliatesWithStats
       .filter(a => a.active)
       .slice(0, 5)
       .map(a => ({
         name: a.name.split(' ')[0],
         negocios: a.total_businesses,
         vendas: a.total_sales,
         comissao: a.total_commission,
       }));
   }, [affiliatesWithStats]);
 
   // Financial data over time (mock aggregation by month for now)
   const financialData = useMemo(() => {
     if (!affiliateSales || affiliateSales.length === 0) return [];
     
     // Group by month
     const monthlyData: { [key: string]: { vendas: number; comissoes: number; lucro: number } } = {};
     
     affiliateSales.forEach(sale => {
       const monthKey = format(new Date(sale.created_at), 'MMM', { locale: pt });
       if (!monthlyData[monthKey]) {
         monthlyData[monthKey] = { vendas: 0, comissoes: 0, lucro: 0 };
       }
       monthlyData[monthKey].vendas += sale.sale_value;
       monthlyData[monthKey].comissoes += sale.commission_value;
       monthlyData[monthKey].lucro += sale.platform_profit;
     });
     
     return Object.entries(monthlyData).map(([month, data]) => ({
       month,
       ...data,
     }));
   }, [affiliateSales]);
 
   // Total orders from all businesses
   const totalOrders = useMemo(() => {
     // This would need orders data - for now returning subscription count as placeholder
     return subscriptions?.length || 0;
   }, [subscriptions]);

  // Subscription status distribution
  const subscriptionStatusData = useMemo(() => {
    if (!subscriptions) return [];
    
    const statusCounts = {
      pending: subscriptions.filter(s => s.status === 'pending').length,
      active: subscriptions.filter(s => s.status === 'active').length,
      overdue: subscriptions.filter(s => s.status === 'overdue').length,
      cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
    };

    return [
      { name: 'Pendentes', value: statusCounts.pending, color: 'hsl(var(--warning))' },
      { name: 'Pagas', value: statusCounts.active, color: 'hsl(var(--success))' },
      { name: 'Atrasadas', value: statusCounts.overdue, color: 'hsl(var(--destructive))' },
      { name: 'Canceladas', value: statusCounts.cancelled, color: 'hsl(var(--muted))' },
    ].filter(item => item.value > 0);
  }, [subscriptions]);

  // Calculate subscription revenue
  const subscriptionRevenue = useMemo(() => {
    if (!subscriptions) return 0;
    return subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + s.amount, 0);
  }, [subscriptions]);

  // Upcoming due subscriptions (next 7 days)
  const upcomingDue = useMemo(() => {
    if (!subscriptions) return [];
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return subscriptions
      .filter(s => {
        const dueDate = new Date(s.due_date);
        return s.status === 'pending' && dueDate >= now && dueDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }, [subscriptions]);

   if (isLoading || isLoadingAffiliates) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasNoData = !businesses?.length && !subscriptions?.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Métricas da Plataforma</h1>
         <p className="text-muted-foreground">Visão geral de empresas, afiliados e lucros</p>
      </div>
 
       {/* Main KPIs - Agenda Smart Encomendas */}
       <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
         <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                 <Building2 className="w-5 h-5 text-primary" />
               </div>
               <div>
                 <p className="text-2xl font-bold">{metrics.approvedActive}</p>
                 <p className="text-xs text-muted-foreground">Negócios Ativos</p>
               </div>
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                 <ShoppingBag className="w-5 h-5 text-muted-foreground" />
               </div>
               <div>
                 <p className="text-2xl font-bold">{totalOrders}</p>
                 <p className="text-xs text-muted-foreground">Total Encomendas</p>
               </div>
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                 <DollarSign className="w-5 h-5 text-success" />
               </div>
               <div>
                 <p className="text-2xl font-bold">{affiliateMetrics.totalSales.toLocaleString()}</p>
                 <p className="text-xs text-muted-foreground">Total Vendas (MZN)</p>
               </div>
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                 <CreditCard className="w-5 h-5 text-warning" />
               </div>
               <div>
                 <p className="text-2xl font-bold">{affiliateMetrics.totalCommissions.toLocaleString()}</p>
                 <p className="text-xs text-muted-foreground">Total Comissões (MZN)</p>
               </div>
             </div>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                 <TrendingUp className="w-5 h-5 text-success" />
               </div>
               <div>
                 <p className="text-2xl font-bold text-success">{affiliateMetrics.totalPlatformProfit.toLocaleString()}</p>
                 <p className="text-xs text-muted-foreground">Lucro Agenda Smart (MZN)</p>
               </div>
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                 <Users className="w-5 h-5 text-accent-foreground" />
               </div>
               <div>
                 <p className="text-2xl font-bold">{affiliateMetrics.activeAffiliates}</p>
                 <p className="text-xs text-muted-foreground">Afiliados Ativos</p>
               </div>
             </div>
           </CardContent>
         </Card>
       </div>

      {/* Key Metrics - Empresas */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Empresas
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
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
                  <Clock className="w-5 h-5 text-warning" />
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
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics.approvedActive}</p>
                  <p className="text-xs text-muted-foreground">Aprovadas</p>
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
                  <p className="text-xs text-muted-foreground">Bloqueadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Key Metrics - Mensalidades */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          Mensalidades
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{subscriptions?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
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
                  <p className="text-2xl font-bold">{metrics.overdueSubscriptions}</p>
                  <p className="text-xs text-muted-foreground">Atrasadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{subscriptionRevenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Receita (MZN)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts */}
      {hasNoData ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Ainda não há dados</p>
              <p className="text-sm">Quando empresas se registarem, as métricas aparecerão aqui.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
           {/* Affiliate Performance Chart */}
           <Card>
             <CardHeader>
               <CardTitle className="text-lg flex items-center gap-2">
                 <Users className="w-5 h-5 text-primary" />
                 Afiliado × Negócios
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="h-64">
                 {affiliatePerformanceData.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={affiliatePerformanceData}>
                       <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                       <XAxis dataKey="name" className="text-xs" />
                       <YAxis className="text-xs" />
                       <Tooltip
                         contentStyle={{
                           backgroundColor: 'hsl(var(--card))',
                           border: '1px solid hsl(var(--border))',
                           borderRadius: '8px',
                         }}
                       />
                       <Bar dataKey="negocios" fill="hsl(var(--primary))" name="Negócios" radius={[4, 4, 0, 0]} />
                     </BarChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="flex items-center justify-center h-full text-muted-foreground">
                     Nenhum afiliado com dados
                   </div>
                 )}
               </div>
             </CardContent>
           </Card>
 
           {/* Financial Chart */}
           <Card>
             <CardHeader>
               <CardTitle className="text-lg flex items-center gap-2">
                 <TrendingUp className="w-5 h-5 text-success" />
                 Financeiro (Vendas × Comissões × Lucro)
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="h-64">
                 {financialData.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={financialData}>
                       <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                       <XAxis dataKey="month" className="text-xs" />
                       <YAxis className="text-xs" />
                       <Tooltip
                         contentStyle={{
                           backgroundColor: 'hsl(var(--card))',
                           border: '1px solid hsl(var(--border))',
                           borderRadius: '8px',
                         }}
                         formatter={(value: number) => `${value.toLocaleString()} MZN`}
                       />
                       <Legend />
                       <Line type="monotone" dataKey="vendas" stroke="hsl(var(--primary))" name="Vendas" strokeWidth={2} />
                       <Line type="monotone" dataKey="comissoes" stroke="hsl(var(--warning))" name="Comissões" strokeWidth={2} />
                       <Line type="monotone" dataKey="lucro" stroke="hsl(var(--success))" name="Lucro" strokeWidth={2} />
                     </LineChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="flex items-center justify-center h-full text-muted-foreground">
                     Nenhuma venda registada
                   </div>
                 )}
               </div>
             </CardContent>
           </Card>
 
          {/* Business Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status das Empresas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {businessStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={businessStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {businessStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Nenhum dado disponível
                  </div>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {businessStatusData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Subscription Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status das Mensalidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {subscriptionStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subscriptionStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {subscriptionStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Nenhum dado disponível
                  </div>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {subscriptionStatusData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upcoming Due Subscriptions */}
      {upcomingDue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Mensalidades a Vencer (próximos 7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDue.map((sub) => (
                <div 
                  key={sub.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{sub.business?.name || 'Empresa'}</p>
                    <p className="text-sm text-muted-foreground">
                      Vence em {format(new Date(sub.due_date), "dd 'de' MMMM", { locale: pt })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{sub.amount.toLocaleString()} {sub.currency}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Metrics;
