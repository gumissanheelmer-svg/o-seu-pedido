import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Clock, CheckCircle, TrendingUp, Package, CalendarDays, ChevronRight, User } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useBusiness } from '@/hooks/useBusiness';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/whatsapp';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function CountUp({ target, duration = 1.5, prefix = '' }: { target: number; duration?: number; prefix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return <span ref={ref}>{prefix}{value.toLocaleString()}</span>;
}

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendente', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
  confirmed: { label: 'Confirmado', color: '#4ADE80', bg: 'rgba(74,222,128,0.1)' },
  preparing: { label: 'Preparando', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)' },
  ready: { label: 'Pronto', color: '#A78BFA', bg: 'rgba(167,139,250,0.1)' },
  delivered: { label: 'Entregue', color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
  cancelled: { label: 'Cancelado', color: '#F87171', bg: 'rgba(248,113,113,0.1)' },
};

export default function AdminDashboard() {
  const { business } = useBusiness();
  const { orders, isLoading, pendingOrders, confirmedOrders, todayOrders, weekOrders } = useOrders();

  const totalRevenue = weekOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const pendingPayments = pendingOrders.filter(o => !o.payment_confirmed).length;
  const ownerName = business?.name || 'Gestor';

  // Resumo inteligente
  const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const uniquePendingClients = new Set(pendingOrders.map(o => o.client_phone)).size;
  
  // Produto mais vendido (simulado com ordem de criação)
  const mostPopularOrder = todayOrders.length > 0 ? todayOrders[0] : null;

  const stats = [
    { title: 'Pedidos Hoje', value: todayOrders.length, icon: CalendarDays, color: '#FF7A1A', isCurrency: false },
    { title: 'Pendentes', value: pendingOrders.length, icon: Clock, color: '#FBBF24', isCurrency: false },
    { title: 'Confirmadas', value: confirmedOrders.length, icon: CheckCircle, color: '#4ADE80', isCurrency: false },
    { title: 'Receita (7 dias)', value: totalRevenue, icon: TrendingUp, color: '#FF7A1A', isCurrency: true },
  ];

  const publicUrl = business ? `${window.location.origin}/p/${business.slug}` : '';
  const recentOrders = orders?.slice(0, 5) || [];

  // Simple weekly chart data
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const chartData = days.map((d, i) => {
    const dayOrders = weekOrders.filter(o => new Date(o.created_at).getDay() === ((i + 1) % 7));
    return { day: d, count: dayOrders.length, revenue: dayOrders.reduce((s, o) => s + (o.total_amount || 0), 0) };
  });
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

  return (
    <div className="space-y-8">
      {/* Saudação Personalizada */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Bem-vinda, {ownerName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Aqui está o desempenho do seu negócio hoje.
        </p>
      </motion.div>

      {/* Resumo Inteligente */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/50 bg-surface/40 backdrop-blur">
          <CardContent className="p-6">
            <div className="space-y-3 text-sm">
              {pendingOrders.length > 0 ? (
                <div className="flex items-start gap-2">
                  <span className="text-lg">📦</span>
                  <p className="text-muted-foreground">
                    Hoje você tem <span className="font-bold text-foreground"><CountUp target={pendingOrders.length} /></span> pedidos pendentes.
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <span className="text-lg">👏</span>
                  <p className="text-foreground font-medium">
                    Nenhum pedido pendente hoje. Excelente organização!
                  </p>
                </div>
              )}

              {uniquePendingClients > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-lg">⏳</span>
                  <p className="text-muted-foreground">
                    <span className="font-bold text-foreground"><CountUp target={uniquePendingClients} /></span> clientes aguardam resposta.
                  </p>
                </div>
              )}

              {mostPopularOrder && (
                <div className="flex items-start gap-2">
                  <span className="text-lg">⭐</span>
                  <p className="text-muted-foreground">
                    Seu pedido <span className="font-bold text-foreground">"{mostPopularOrder.order_description || 'sem descrição'}"</span> está em alta.
                  </p>
                </div>
              )}

              {todayRevenue > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-lg">💰</span>
                  <p className="text-muted-foreground">
                    Sua receita hoje é <span className="font-bold text-foreground"><CountUp target={todayRevenue} prefix="" /></span> MZN.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card className="border-border/50 hover:border-primary/20 transition-all duration-300 hover:-translate-y-0.5">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{stat.title}</p>
                    <p className="font-bold text-xl md:text-2xl text-foreground mt-0.5">
                      {stat.isCurrency ? (
                        <CountUp target={stat.value} prefix="" />
                      ) : (
                        <CountUp target={stat.value} />
                      )}
                      {stat.isCurrency && <span className="text-sm ml-1 text-muted-foreground">MZN</span>}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Receita Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-40">
              {chartData.map((d, i) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    className="w-full rounded-lg relative overflow-hidden"
                    style={{
                      background: `linear-gradient(180deg, rgba(255,122,26,0.8), rgba(255,122,26,0.3))`,
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max((d.revenue / maxRevenue) * 120, 4)}px` }}
                    transition={{ delay: 0.5 + i * 0.05, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-lg" />
                  </motion.div>
                  <span className="text-[10px] text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Public Link */}
      {business && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <Package className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">Link Público de Encomendas</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 bg-background border border-border rounded-xl px-4 py-3">
                  <code className="text-sm text-foreground break-all">{publicUrl}</code>
                </div>
                <Button onClick={() => navigator.clipboard.writeText(publicUrl)} variant="default">
                  Copiar Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Orders - Card-based */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Pedidos Recentes
          </h2>
          <Link to="/admin/encomendas">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Ver Todos <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-2xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Nenhum pedido ainda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order, i) => {
              const status = statusMap[order.status] || statusMap.pending;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                >
                  <Card className="border-border/50 hover:border-border transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">{order.client_name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {order.order_description?.slice(0, 40) || 'Sem descrição'}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <Badge
                            variant="outline"
                            className="text-[10px] border-0 mb-1"
                            style={{ color: status.color, backgroundColor: status.bg }}
                          >
                            {status.label}
                          </Badge>
                          <p className="text-sm font-bold text-foreground">
                            {formatCurrency(order.total_amount)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
