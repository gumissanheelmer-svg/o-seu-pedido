import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, Clock, CheckCircle, TrendingUp, Package, CalendarDays, 
  ChevronRight, User, ArrowUpRight, BarChart3, Users, Star
} from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useBusiness } from '@/hooks/useBusiness';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/whatsapp';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

/* ── Animated Counter ── */
function CountUp({ target, duration = 1.5, prefix = '' }: { target: number; duration?: number; prefix?: string }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
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

  return <span>{prefix}{value.toLocaleString()}</span>;
}

/* ── Status Map ── */
const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendente', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
  confirmed: { label: 'Confirmado', color: '#4ADE80', bg: 'rgba(74,222,128,0.12)' },
  preparing: { label: 'Preparando', color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  ready: { label: 'Pronto', color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
  delivered: { label: 'Entregue', color: '#34D399', bg: 'rgba(52,211,153,0.12)' },
  cancelled: { label: 'Cancelado', color: '#F87171', bg: 'rgba(248,113,113,0.12)' },
};

/* ── Mini sparkline bars ── */
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[2px] h-8">
      {data.map((v, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-sm min-w-[3px]"
          style={{ backgroundColor: color }}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: `${Math.max((v / max) * 100, 8)}%`, opacity: 0.7 }}
          transition={{ delay: 0.6 + i * 0.04, duration: 0.5 }}
        />
      ))}
    </div>
  );
}

/* ── Chart Config ── */
const chartConfig: ChartConfig = {
  revenue: {
    label: 'Receita',
    color: '#3B82F6',
  },
  orders: {
    label: 'Pedidos',
    color: '#F97316',
  },
};

/* ── Time Filter ── */
type TimeFilter = '7d' | '30d';

export default function AdminDashboard() {
  const { business } = useBusiness();
  const { orders, isLoading, pendingOrders, confirmedOrders, todayOrders, weekOrders } = useOrders();
  const { products } = useProducts();
  const { customers } = useCustomers();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7d');

  const ownerName = business?.name || 'Gestor';
  const totalRevenue = weekOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const uniquePendingClients = new Set(pendingOrders.map(o => o.client_phone)).size;
  const publicUrl = business ? `${window.location.origin}/p/${business.slug}` : '';
  const recentOrders = orders?.slice(0, 5) || [];

  // Top products by order frequency
  const topProducts = useMemo(() => {
    if (!orders?.length || !products?.length) return [];
    const countMap: Record<string, number> = {};
    orders.forEach(o => {
      const desc = o.order_description || '';
      products.forEach(p => {
        if (desc.toLowerCase().includes(p.name.toLowerCase())) {
          countMap[p.id] = (countMap[p.id] || 0) + 1;
        }
      });
    });
    return products
      .map(p => ({ ...p, orderCount: countMap[p.id] || 0 }))
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 4);
  }, [orders, products]);

  // Top customers by spend
  const topCustomers = useMemo(() => {
    if (!orders?.length) return [];
    const spendMap: Record<string, { name: string; phone: string; total: number; count: number }> = {};
    orders.forEach(o => {
      const key = o.client_phone;
      if (!spendMap[key]) spendMap[key] = { name: o.client_name, phone: key, total: 0, count: 0 };
      spendMap[key].total += o.total_amount || 0;
      spendMap[key].count += 1;
    });
    return Object.values(spendMap).sort((a, b) => b.total - a.total).slice(0, 4);
  }, [orders]);

  // Chart data
  const chartData = useMemo(() => {
    const allOrders = orders || [];
    const daysCount = timeFilter === '7d' ? 7 : 30;
    const labels7 = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    
    if (timeFilter === '7d') {
      return labels7.map((d, i) => {
        const dayOrders = allOrders.filter(o => new Date(o.created_at).getDay() === ((i + 1) % 7));
        return { name: d, revenue: dayOrders.reduce((s, o) => s + (o.total_amount || 0), 0), orders: dayOrders.length };
      });
    } else {
      const result: { name: string; revenue: number; orders: number }[] = [];
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().slice(0, 10);
        const dayOrders = allOrders.filter(o => o.created_at.slice(0, 10) === dateStr);
        result.push({
          name: `${date.getDate()}/${date.getMonth() + 1}`,
          revenue: dayOrders.reduce((s, o) => s + (o.total_amount || 0), 0),
          orders: dayOrders.length,
        });
      }
      return result;
    }
  }, [orders, timeFilter]);

  // Mini sparkline data for stat cards
  const last7DaysOrders = useMemo(() => {
    const all = orders || [];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const ds = d.toISOString().slice(0, 10);
      return all.filter(o => o.created_at.slice(0, 10) === ds).length;
    });
  }, [orders]);

  const last7DaysRevenue = useMemo(() => {
    const all = orders || [];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const ds = d.toISOString().slice(0, 10);
      return all.filter(o => o.created_at.slice(0, 10) === ds).reduce((s, o) => s + (o.total_amount || 0), 0);
    });
  }, [orders]);

  const stats = [
    { title: 'Pedidos Hoje', value: todayOrders.length, icon: CalendarDays, color: '#F97316', sparkline: last7DaysOrders },
    { title: 'Pendentes', value: pendingOrders.length, icon: Clock, color: '#FBBF24', sparkline: last7DaysOrders.map(v => Math.max(v - 1, 0)) },
    { title: 'Confirmados', value: confirmedOrders.length, icon: CheckCircle, color: '#4ADE80', sparkline: last7DaysOrders },
    { title: 'Receita (7d)', value: totalRevenue, icon: TrendingUp, color: '#3B82F6', sparkline: last7DaysRevenue, isCurrency: true },
  ];

  const glassCard = {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(12px)',
  };

  return (
    <div className="space-y-6" style={{ minHeight: '100vh' }}>
      {/* ── Greeting ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Bem-vinda, {ownerName} 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Aqui está o desempenho do seu negócio hoje.
        </p>
      </motion.div>

      {/* ── Smart Summary ── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <div className="rounded-2xl border p-5" style={glassCard}>
          <div className="space-y-2.5 text-sm">
            {pendingOrders.length > 0 ? (
              <div className="flex items-start gap-2">
                <span className="text-base">📦</span>
                <p className="text-muted-foreground">
                  Hoje você tem <span className="font-bold text-foreground"><CountUp target={pendingOrders.length} /></span> pedidos pendentes.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <span className="text-base">👏</span>
                <p className="text-foreground font-medium">Nenhum pedido pendente. Excelente organização!</p>
              </div>
            )}
            {uniquePendingClients > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-base">⏳</span>
                <p className="text-muted-foreground">
                  <span className="font-bold text-foreground"><CountUp target={uniquePendingClients} /></span> clientes aguardam resposta.
                </p>
              </div>
            )}
            {todayRevenue > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-base">💰</span>
                <p className="text-muted-foreground">
                  Receita hoje: <span className="font-bold text-foreground"><CountUp target={todayRevenue} /> MZN</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + index * 0.06 }}
          >
            <div
              className="rounded-2xl border p-4 transition-all duration-300 hover:scale-[1.02] cursor-default group"
              style={{
                ...glassCard,
                boxShadow: '0 0 0 0 transparent',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px -6px ${stat.color}30`;
                (e.currentTarget as HTMLElement).style.borderColor = `${stat.color}30`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 0 transparent';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon className="w-4.5 h-4.5" style={{ color: stat.color }} />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-muted-foreground mb-0.5">{stat.title}</p>
              <p className="font-bold text-xl text-foreground">
                {stat.isCurrency ? (
                  <><CountUp target={stat.value} /> <span className="text-xs text-muted-foreground font-normal">MZN</span></>
                ) : (
                  <CountUp target={stat.value} />
                )}
              </p>
              <div className="mt-2">
                <MiniSparkline data={stat.sparkline} color={stat.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Main Chart ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <div className="rounded-2xl border p-5" style={glassCard}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm text-foreground">Visão Geral</h3>
            </div>
            <div className="flex gap-1 rounded-lg p-0.5" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
              {(['7d', '30d'] as TimeFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setTimeFilter(f)}
                  className="px-3 py-1 rounded-md text-xs font-medium transition-all duration-200"
                  style={{
                    backgroundColor: timeFilter === f ? 'rgba(59,130,246,0.2)' : 'transparent',
                    color: timeFilter === f ? '#3B82F6' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {f === '7d' ? '7 dias' : '30 dias'}
                </button>
              ))}
            </div>
          </div>
          <ChartContainer config={chartConfig} className="h-[240px] w-full">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradOrange" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F97316" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} fill="url(#gradBlue)" />
              <Area type="monotone" dataKey="orders" stroke="#F97316" strokeWidth={2} fill="url(#gradOrange)" />
            </AreaChart>
          </ChartContainer>
        </div>
      </motion.div>

      {/* ── Sidebar Panels: Top Products + Top Customers ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="rounded-2xl border p-5" style={glassCard}>
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4" style={{ color: '#F97316' }} />
              <h3 className="font-semibold text-sm text-foreground">Top Produtos</h3>
            </div>
            {topProducts.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sem dados suficientes ainda.</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-xl p-2.5 transition-all duration-200 hover:scale-[1.01]"
                    style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: `${['#F97316', '#3B82F6', '#A78BFA', '#4ADE80'][i]}18`, color: ['#F97316', '#3B82F6', '#A78BFA', '#4ADE80'][i] }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(p.price)}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-0" style={{ color: '#F97316', backgroundColor: 'rgba(249,115,22,0.1)' }}>
                      {p.orderCount} pedidos
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Customers */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <div className="rounded-2xl border p-5" style={glassCard}>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4" style={{ color: '#3B82F6' }} />
              <h3 className="font-semibold text-sm text-foreground">Top Clientes</h3>
            </div>
            {topCustomers.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sem dados suficientes ainda.</p>
            ) : (
              <div className="space-y-3">
                {topCustomers.map((c, i) => (
                  <div
                    key={c.phone}
                    className="flex items-center gap-3 rounded-xl p-2.5 transition-all duration-200 hover:scale-[1.01]"
                    style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: `${['#3B82F6', '#F97316', '#A78BFA', '#4ADE80'][i]}18`, color: ['#3B82F6', '#F97316', '#A78BFA', '#4ADE80'][i] }}
                    >
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.count} pedidos</p>
                    </div>
                    <span className="text-sm font-bold text-foreground">{formatCurrency(c.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Public Link ── */}
      {business && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="rounded-2xl border p-5" style={{ ...glassCard, borderColor: 'rgba(249,115,22,0.2)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4" style={{ color: '#F97316' }} />
              <span className="font-semibold text-sm text-foreground">Link Público</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 rounded-xl px-4 py-2.5 border" style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <code className="text-xs text-foreground break-all">{publicUrl}</code>
              </div>
              <Button
                onClick={() => navigator.clipboard.writeText(publicUrl)}
                size="sm"
                className="shrink-0"
                style={{ backgroundColor: '#F97316' }}
              >
                Copiar
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Recent Orders ── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" style={{ color: '#F97316' }} />
            Pedidos Recentes
          </h2>
          <Link to="/admin/encomendas">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
              Ver Todos <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="rounded-2xl border p-8 text-center" style={glassCard}>
            <p className="text-sm text-muted-foreground">Nenhum pedido ainda</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order, i) => {
              const status = statusMap[order.status] || statusMap.pending;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.04 }}
                >
                  <div
                    className="rounded-xl border p-3.5 transition-all duration-200 hover:scale-[1.01] cursor-pointer group"
                    style={glassCard}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px -4px rgba(0,0,0,0.3)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{order.client_name}</p>
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
                        <p className="text-sm font-bold text-foreground">{formatCurrency(order.total_amount)}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
