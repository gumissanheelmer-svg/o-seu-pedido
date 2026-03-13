import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Mail, Lock, Eye, EyeOff, Loader2, Store, Phone, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { businessTypeLabels } from '@/types/database';

const Register = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    whatsapp: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.businessName || !formData.businessType || !formData.whatsapp || !formData.email || !formData.password) {
      toast({ title: 'Campos obrigatórios', description: 'Por favor, preencha todos os campos.', variant: 'destructive' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Senhas não coincidem', description: 'Por favor, verifique as senhas.', variant: 'destructive' });
      return;
    }

    if (formData.password.length < 6) {
      toast({ title: 'Senha muito curta', description: 'A senha deve ter pelo menos 6 caracteres.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      const { error: signUpError } = await signUp(formData.email, formData.password);
      if (signUpError) throw signUpError;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Erro ao criar usuário');

      const slug = generateSlug(formData.businessName);
      const { error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: formData.businessName,
          slug: slug,
          business_type: formData.businessType as 'lanchonete' | 'bolos' | 'buques' | 'restaurante' | 'outro',
          whatsapp_number: formData.whatsapp,
          owner_id: user.id,
        });

      if (businessError) throw businessError;

      toast({ title: 'Conta criada com sucesso!', description: 'Bem-vindo ao Encomendas. Seu negócio está pendente de aprovação.' });
      navigate('/aguardando-aprovacao');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({ title: 'Erro ao criar conta', description: error.message || 'Tente novamente mais tarde.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "pl-10 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#c44cff]/50 focus:ring-[#c44cff]/20";

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0b0f1a 0%, #121826 40%, #1a1330 100%)' }}>
      {/* Glow effects */}
      <div className="fixed top-1/4 right-1/3 w-[500px] h-[500px] rounded-full blur-[150px] opacity-15 pointer-events-none" style={{ backgroundColor: '#c44cff' }} />
      <div className="fixed bottom-1/3 left-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-10 pointer-events-none" style={{ backgroundColor: '#ff4d8d' }} />

      {/* Left side - Decorative */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center relative z-10"
        >
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-xl" style={{
            background: 'linear-gradient(135deg, rgba(255,77,141,0.2), rgba(196,76,255,0.2))',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 0 60px -12px rgba(196,76,255,0.4)',
          }}>
            <Store className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-display font-bold mb-4 text-white">
            Crie sua loja online
          </h2>
          <p className="max-w-sm" style={{ color: '#94a3b8' }}>
            Em poucos minutos, tenha sua página profissional de pedidos e receba encomendas organizadas pelo WhatsApp.
          </p>

          <motion.div
            animate={{ y: [4, -8, 4] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-4 left-8 flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <Sparkles className="w-4 h-4" style={{ color: '#ff4d8d' }} />
            <span className="text-xs font-medium text-white">Grátis</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff4d8d, #c44cff)' }}>
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-white">Encomendas</span>
          </Link>

          <h1 className="text-3xl font-display font-bold text-white mb-2">Criar conta grátis</h1>
          <p className="mb-8" style={{ color: '#94a3b8' }}>Comece a receber pedidos organizados hoje mesmo</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-white/80">Nome do Negócio</Label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#94a3b8' }} />
                <Input id="businessName" type="text" placeholder="Ex: Bolos da Maria" value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} className={inputClasses} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType" className="text-white/80">Tipo de Negócio</Label>
              <Select value={formData.businessType} onValueChange={(value) => setFormData({ ...formData, businessType: value })}>
                <SelectTrigger className="border-white/10 bg-white/5 text-white focus:border-[#c44cff]/50 focus:ring-[#c44cff]/20 [&>span]:text-white/50 data-[state=open]:border-[#c44cff]/50">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1f2e] border-white/10">
                  {Object.entries(businessTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value} className="text-white/80 focus:bg-white/10 focus:text-white">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-white/80">WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#94a3b8' }} />
                <Input id="whatsapp" type="tel" placeholder="+258 84 123 4567" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} className={inputClasses} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#94a3b8' }} />
                <Input id="email" type="email" placeholder="seu@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClasses} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#94a3b8' }} />
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={inputClasses} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/80">Confirmar</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#94a3b8' }} />
                  <Input id="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className={inputClasses} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-sm flex items-center gap-1" style={{ color: '#94a3b8' }}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPassword ? 'Ocultar senhas' : 'Mostrar senhas'}
              </button>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full font-bold text-white border-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_35px_-5px_rgba(196,76,255,0.5)]"
              style={{ background: 'linear-gradient(90deg, #ff4d8d, #c44cff)', boxShadow: '0 0 30px -5px rgba(196,76,255,0.3)' }}
              disabled={isLoading}
            >
              {isLoading ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Criando conta...</>) : ('Criar conta grátis')}
            </Button>
          </form>

          <p className="text-center mt-6" style={{ color: '#94a3b8' }}>
            Já tem conta?{' '}
            <Link to="/entrar" className="font-medium hover:underline" style={{ color: '#c44cff' }}>Entrar</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
