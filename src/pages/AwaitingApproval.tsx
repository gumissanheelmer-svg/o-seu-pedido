import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ShoppingBag, LogOut, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useBusiness } from '@/hooks/useBusiness';

const AwaitingApproval = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut, isAdmin, isSuperAdmin } = useAuth();
  const { business, isLoading: businessLoading, refetch } = useBusiness();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/entrar');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // If super admin, redirect to super admin dashboard
    if (!authLoading && isSuperAdmin) {
      navigate('/superadmin');
      return;
    }
    
    // If business is approved and active, redirect to admin
    if (!businessLoading && business?.approval_status === 'approved' && business?.active) {
      navigate('/admin');
    }
  }, [business, businessLoading, authLoading, isSuperAdmin, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleRefresh = () => {
    refetch();
  };

  if (authLoading || businessLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusContent = () => {
    if (!business) {
      return {
        title: 'Negócio não encontrado',
        description: 'Não conseguimos encontrar os dados do seu negócio.',
        color: 'text-muted-foreground',
        bgColor: 'bg-muted/20',
      };
    }

    switch (business.approval_status) {
      case 'pending':
        return {
          title: 'Aguardando Aprovação',
          description: 'Seu negócio está em análise. Você receberá uma notificação quando for aprovado.',
          color: 'text-warning',
          bgColor: 'bg-warning/20',
        };
      case 'rejected':
        return {
          title: 'Cadastro Rejeitado',
          description: 'Infelizmente seu cadastro não foi aprovado. Entre em contato para mais informações.',
          color: 'text-destructive',
          bgColor: 'bg-destructive/20',
        };
      case 'blocked':
        return {
          title: 'Conta Bloqueada',
          description: 'Sua conta foi bloqueada. Entre em contato com o suporte para mais informações.',
          color: 'text-destructive',
          bgColor: 'bg-destructive/20',
        };
      default:
        if (!business.active) {
          return {
            title: 'Conta Inativa',
            description: 'Sua conta está temporariamente inativa. Entre em contato com o suporte.',
            color: 'text-muted-foreground',
            bgColor: 'bg-muted/20',
          };
        }
        return {
          title: 'Status Desconhecido',
          description: 'Houve um problema ao verificar o status da sua conta.',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/20',
        };
    }
  };

  const status = getStatusContent();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-display font-bold text-foreground">
            Encomendas
          </span>
        </Link>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className={`w-20 h-20 rounded-full ${status.bgColor} flex items-center justify-center mx-auto mb-6`}>
              <Clock className={`w-10 h-10 ${status.color}`} />
            </div>
            
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              {status.title}
            </h1>
            
            <p className="text-muted-foreground mb-6">
              {status.description}
            </p>

            {business && (
              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-muted-foreground">Negócio</p>
                <p className="font-semibold text-foreground">{business.name}</p>
                <p className="text-sm text-muted-foreground mt-2">Email</p>
                <p className="text-foreground">{user?.email}</p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleRefresh}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Verificar Status
              </Button>
              
              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair da Conta
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Precisa de ajuda?{' '}
          <a href="mailto:suporte@encomendas.co.mz" className="text-primary hover:underline">
            Entre em contato
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default AwaitingApproval;
