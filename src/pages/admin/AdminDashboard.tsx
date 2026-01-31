import { motion } from 'framer-motion';
import { ShoppingBag, Clock, CheckCircle, TrendingUp, Package, CalendarDays } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useBusiness } from '@/hooks/useBusiness';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/whatsapp';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const { business } = useBusiness();
  const { 
    orders, 
    isLoading, 
    pendingOrders, 
    confirmedOrders,
    todayOrders,
    weekOrders 
  } = useOrders();

  const totalRevenue = weekOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const pendingPayments = pendingOrders.filter(o => !o.payment_confirmed).length;

  const stats = [
    {
      title: 'Encomendas Hoje',
      value: todayOrders.length,
      icon: CalendarDays,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Pendentes',
      value: pendingOrders.length,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Confirmadas',
      value: confirmedOrders.length,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Receita (7 dias)',
      value: formatCurrency(totalRevenue),
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      isLarge: true,
    },
  ];

  const publicUrl = business ? `${window.location.origin}/p/${business.slug}` : '';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Bem-vindo ao seu painel de controle</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                    <p className={`font-bold ${stat.isLarge ? 'text-lg' : 'text-2xl'} text-foreground`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Public Link Card */}
      {business && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Link Público de Encomendas
            </CardTitle>
            <CardDescription>
              Compartilhe este link com seus clientes para receberem encomendas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 bg-background border border-border rounded-lg px-4 py-3">
                <code className="text-sm text-foreground break-all">{publicUrl}</code>
              </div>
              <Button
                onClick={() => navigator.clipboard.writeText(publicUrl)}
                variant="default"
              >
                Copiar Link
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Encomendas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : pendingOrders.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma encomenda pendente</p>
            ) : (
              <div className="space-y-3">
                {pendingOrders.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">{order.client_name}</p>
                      <p className="text-sm text-muted-foreground">{order.order_description?.slice(0, 30)}...</p>
                    </div>
                    <span className="text-xs bg-pending text-pending-foreground px-2 py-1 rounded-full">
                      Pendente
                    </span>
                  </div>
                ))}
                <Link to="/admin/encomendas">
                  <Button variant="outline" className="w-full mt-2">
                    Ver Todas
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-warning" />
              Pagamentos Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingPayments === 0 ? (
              <p className="text-muted-foreground">Todos os pagamentos confirmados</p>
            ) : (
              <div className="space-y-3">
                <div className="text-center py-4">
                  <p className="text-4xl font-bold text-warning">{pendingPayments}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    encomendas aguardando confirmação de pagamento
                  </p>
                </div>
                <Link to="/admin/encomendas">
                  <Button variant="warning" className="w-full">
                    Verificar Pagamentos
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
