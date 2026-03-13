import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Mail, Lock, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);

    if (error) {
      setIsLoading(false);
      toast({
        title: 'Erro ao entrar',
        description: 'Email ou senha incorretos.',
        variant: 'destructive',
      });
      return;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      setIsLoading(false);
      toast({
        title: 'Bem-vindo de volta!',
        description: 'Login realizado com sucesso.',
      });
      
      if (roleData?.role === 'super_admin') {
        navigate('/superadmin');
      } else {
        navigate('/admin');
      }
    } else {
      setIsLoading(false);
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0b0f1a 0%, #121826 40%, #1a1330 100%)' }}>
      {/* Glow effects */}
      <div className="fixed top-1/3 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] opacity-15 pointer-events-none" style={{ backgroundColor: '#c44cff' }} />
      <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-10 pointer-events-none" style={{ backgroundColor: '#ff4d8d' }} />

      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff4d8d, #c44cff)' }}>
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-white">
              Encomendas
            </span>
          </Link>

          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Bem-vindo de volta
          </h1>
          <p className="mb-8" style={{ color: '#94a3b8' }}>
            Entre na sua conta para gerenciar seu negócio
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#94a3b8' }} />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#c44cff]/50 focus:ring-[#c44cff]/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#94a3b8' }} />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#c44cff]/50 focus:ring-[#c44cff]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full font-bold text-white border-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_35px_-5px_rgba(196,76,255,0.5)]"
              style={{
                background: 'linear-gradient(90deg, #ff4d8d, #c44cff)',
                boxShadow: '0 0 30px -5px rgba(196,76,255,0.3)',
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <p className="text-center mt-6" style={{ color: '#94a3b8' }}>
            Não tem conta?{' '}
            <Link to="/registar" className="font-medium hover:underline" style={{ color: '#c44cff' }}>
              Criar conta grátis
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center relative z-10"
        >
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-xl" style={{
            background: 'linear-gradient(135deg, rgba(255,77,141,0.2), rgba(196,76,255,0.2))',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 0 60px -12px rgba(196,76,255,0.4)',
          }}>
            <ShoppingBag className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-display font-bold mb-4 text-white">
            Gerencie seus pedidos
          </h2>
          <p className="max-w-sm" style={{ color: '#94a3b8' }}>
            Acesse seu painel para visualizar pedidos, atualizar produtos e acompanhar seu negócio.
          </p>

          {/* Floating badges */}
          <motion.div
            animate={{ y: [-8, 4, -8] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-8 right-0 flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <Sparkles className="w-4 h-4" style={{ color: '#c44cff' }} />
            <span className="text-xs font-medium text-white">Premium</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
