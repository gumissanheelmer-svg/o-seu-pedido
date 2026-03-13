import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Settings, 
  LogOut,
  Menu,
  Store,
  Users,
  XCircle,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useBusiness } from '@/hooks/useBusiness';
import { useImpersonate } from '@/hooks/useImpersonate';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useState } from 'react';

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
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Super admin should go to super admin dashboard (unless impersonating)
  if (isSuperAdmin && !isImpersonating) {
    return <Navigate to="/superadmin" replace />;
  }

  // If business is not approved or not active, redirect to awaiting approval (unless super admin)
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

  return (
    <div className="min-h-screen bg-background dark">
      {/* Impersonate Banner */}
      {isImpersonating && (
        <div className="bg-warning text-warning-foreground px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
          <span>Você está visualizando como: {business?.name}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2"
            onClick={() => {
              endImpersonate.mutate();
              window.location.href = '/superadmin';
            }}
          >
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
              <img
                src={business.logo_url}
                alt={business.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Store className="w-4 h-4 text-primary" />
              </div>
            )}
            <span className="font-semibold text-foreground">{business?.name || 'Meu Negócio'}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Mobile Sheet Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              {business?.logo_url ? (
                <img
                  src={business.logo_url}
                  alt={business.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary" />
                </div>
              )}
              <div>
                <SheetTitle className="text-foreground">{business?.name || 'Meu Negócio'}</SheetTitle>
                <p className="text-xs text-muted-foreground">Painel Admin</p>
              </div>
            </div>
          </SheetHeader>

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
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sair
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            {business?.logo_url ? (
              <img
                src={business.logo_url}
                alt={business.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Store className="w-5 h-5 text-primary" />
              </div>
            )}
            <div>
              <h2 className="font-bold text-foreground">{business?.name || 'Meu Negócio'}</h2>
              <p className="text-xs text-muted-foreground">Painel Admin</p>
            </div>
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
