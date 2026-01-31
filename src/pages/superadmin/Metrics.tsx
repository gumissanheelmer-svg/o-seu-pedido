import { useMemo } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import { 
  Building2, 
  ShoppingBag, 
  CreditCard,
  TrendingUp,
  Users,
  Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

const Metrics = () => {
  const { businesses, allOrders, subscriptions, metrics, isLoading } = useSuperAdmin();

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
      { name: 'Aprovados', value: statusCounts.approved, color: 'hsl(var(--success))' },
      { name: 'Rejeitados', value: statusCounts.rejected, color: 'hsl(var(--muted))' },
      { name: 'Bloqueados', value: statusCounts.blocked, color: 'hsl(var(--destructive))' },
    ].filter(item => item.value > 0);
  }, [businesses]);

  // Orders by day (last 7 days)
  const ordersByDay = useMemo(() => {
    if (!allOrders) return [];
    
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date: format(date, 'dd/MM', { locale: pt }),
        fullDate: date,
        orders: 0,
        revenue: 0,
      };
    });

    allOrders.forEach(order => {
      const orderDate = new Date(order.created_at);
      const dayIndex = days.findIndex(d => 
        orderDate >= startOfDay(d.fullDate) && orderDate <= endOfDay(d.fullDate)
      );
      if (dayIndex !== -1) {
        days[dayIndex].orders += 1;
        days[dayIndex].revenue += order.total_amount || 0;
      }
    });

    return days;
  }, [allOrders]);

  // Subscription status distribution
  const subscriptionStatusData = useMemo(() => {
    if (!subscriptions) return [];
    
    const statusCounts = {
      pending: subscriptions.filter(s => s.status === 'pending').length,
      active: subscriptions.filter(s => s.status === 'active').length,
      overdue: subscriptions.filter(s => s.status === 'overdue').length,
    };

    return [
      { name: 'Pendentes', value: statusCounts.pending, color: 'hsl(var(--warning))' },
      { name: 'Pagos', value: statusCounts.active, color: 'hsl(var(--success))' },
      { name: 'Atrasados', value: statusCounts.overdue, color: 'hsl(var(--destructive))' },
    ].filter(item => item.value > 0);
  }, [subscriptions]);

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
        <h1 className="text-2xl font-display font-bold text-foreground">Métricas</h1>
        <p className="text-muted-foreground">Visão geral da plataforma</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.totalBusinesses}</p>
                <p className="text-xs text-muted-foreground">Empresas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.totalOrders}</p>
                <p className="text-xs text-muted-foreground">Encomendas</p>
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
                <p className="text-2xl font-bold">{subscriptions?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Mensalidades</p>
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
                <p className="text-2xl font-bold">{metrics.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Receita (MZN)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders by Day */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Encomendas por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar 
                    dataKey="orders" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    name="Encomendas"
                  />
                </BarChart>
              </ResponsiveContainer>
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

        {/* Revenue by Day */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Receita por Dia (MZN)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ordersByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => [`${value.toLocaleString()} MZN`, 'Receita']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--success))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Status */}
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
    </div>
  );
};

export default Metrics;
