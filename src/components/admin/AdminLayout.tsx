import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Settings, 
  LogOut,
  Menu,
  X,
  Store,
  Users,
  XCircle,
  Wallet,
  Bell
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useBusiness } from '@/hooks/useBusiness';
import { useImpersonate } from '@/hooks/useImpersonate';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/admin/encomendas', icon: ShoppingBag, label: 'Encomendas' },
  { path: '/admin/produtos', icon: Package, label: 'Produtos' },
  { path: '/admin/clientes', icon: Users, label: 'Clientes' },
  { path: '/admin/despesas', icon: Wallet, label: 'Despesas' },
  { path: '/admin/configuracoes', icon: Settings, label: 'Configurações' },
];

export function AdminLayout() {
  const { user, isLoading: authLoading, signOut, isAdmin, isSuperAdmin } = useAuth();
  const { business, isLoading: businessLoading } = useBusiness();
  const { isImpersonating, endImpersonate } = useImpersonate();
  const { notifications, unreadCount, markAllRead } = useRealtimeOrders();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  if (authLoading || businessLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/entrar" replace />;
  }

  if (isSuperAdmin && !isImpersonating) {
    return <Navigate to="/superadmin" replace />;
  }

  if (business && (business.approval_status !== 'approved' || !business.active) && !isSuperAdmin) {
    return <Navigate to="/aguardando-aprovacao" replace />;
  }

  const handleSignOut = async () => {
    if (isImpersonating) {
      await endImpersonate.mutateAsync();
      window.location.href = '/superadmin';
      return;
    }
    await signOut();
  };

  const toggleNotif = () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen && unreadCount > 0) markAllRead();
  };

  return (
    <div className="min-h-screen bg-background dark">
      {/* Impersonate Banner */}
      {isImpersonating && (
        <div className="bg-warning text-warning-foreground px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
          <span>Você está visualizando como: {business?.name}</span>
          <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => { endImpersonate.mutate(); window.location.href = '/superadmin'; }}>
            <XCircle className="w-4 h-4 mr-1" />
            Sair
          </Button>
        </div>
      )}

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {business?.logo_url ? (
              <img src={business.logo_url} alt={business.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Store className="w-4 h-4 text-primary" />
              </div>
            )}
            <span className="font-semibold text-foreground">{business?.name || 'Meu Negócio'}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Notification bell mobile */}
            <Button variant="ghost" size="icon" className="relative" onClick={toggleNotif}>
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg, #ff4d8d, #c44cff)' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {notifOpen && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setNotifOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="fixed top-14 right-4 lg:right-auto lg:left-[17rem] z-[70] w-80 max-h-96 overflow-y-auto rounded-2xl border border-border bg-card shadow-large"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-bold text-foreground text-sm">Notificações</h3>
                {notifications.length > 0 && (
                  <button onClick={() => setNotifOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">Fechar</button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">Nenhuma notificação ainda</div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((n) => (
                    <Link
                      key={n.id}
                      to="/admin/encomendas"
                      onClick={() => setNotifOpen(false)}
                      className={cn(
                        'block p-4 hover:bg-muted/50 transition-colors',
                        !n.seen && 'bg-primary/5'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(255,77,141,0.15), rgba(196,76,255,0.15))' }}>
                          <ShoppingBag className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Nova encomenda</p>
                          <p className="text-xs text-muted-foreground">{n.clientName}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: pt })}
                          </p>
                        </div>
                        {!n.seen && (
                          <div className="w-2 h-2 rounded-full ml-auto mt-1 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #ff4d8d, #c44cff)' }} />
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            {business?.logo_url ? (
              <img src={business.logo_url} alt={business.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Store className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-foreground truncate">{business?.name || 'Meu Negócio'}</h2>
              <p className="text-xs text-muted-foreground">Painel Admin</p>
            </div>
            {/* Desktop notification bell */}
            <Button variant="ghost" size="icon" className="relative hidden lg:flex h-8 w-8" onClick={toggleNotif}>
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg, #ff4d8d, #c44cff)' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.end 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.label === 'Encomendas' && unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                    style={{ background: 'linear-gradient(135deg, #ff4d8d, #c44cff)' }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Agenda Smart v1.0
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64">
        <div className="container max-w-6xl mx-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
