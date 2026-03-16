import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, Phone, CreditCard, MessageSquare, Save, Loader2, Palette } from 'lucide-react';
import { useBusiness } from '@/hooks/useBusiness';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { businessTypeLabels, BusinessType } from '@/types/database';
import { IdentitySettings } from '@/components/admin/settings/IdentitySettings';
import { toast } from 'sonner';

export default function Settings() {
  const { business, isLoading, updateBusiness } = useBusiness();
  const [isSaving, setIsSaving] = useState(false);

  // Business settings
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('outro');
  const [description, setDescription] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [address, setAddress] = useState('');

  // Payment settings
  const [paymentRequired, setPaymentRequired] = useState(false);
  // Order rules
  const [orderRulesMessage, setOrderRulesMessage] = useState('');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [emolaNumber, setEmolaNumber] = useState('');
  const [signalAmount, setSignalAmount] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');

  // Load business data
  useEffect(() => {
    if (business) {
      setBusinessName(business.name || '');
      setBusinessType(business.business_type || 'outro');
      setDescription(business.description || '');
      setWhatsappNumber(business.whatsapp_number || '');
      setAddress(business.address || '');
      setPaymentRequired(business.payment_required || false);
      setMpesaNumber(business.mpesa_number || '');
      setEmolaNumber(business.emola_number || '');
      setSignalAmount(business.signal_amount?.toString() || '');
      setConfirmationMessage(business.confirmation_message || '');
    }
  }, [business]);

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    try {
      await updateBusiness.mutateAsync({
        name: businessName,
        business_type: businessType,
        description: description || null,
        whatsapp_number: whatsappNumber,
        address: address || null,
      });
      toast.success('Configurações salvas!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePayment = async () => {
    setIsSaving(true);
    try {
      await updateBusiness.mutateAsync({
        payment_required: paymentRequired,
        mpesa_number: mpesaNumber || null,
        emola_number: emolaNumber || null,
        signal_amount: signalAmount ? parseFloat(signalAmount) : null,
        confirmation_message: confirmationMessage || null,
      });
      toast.success('Configurações de pagamento salvas!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleIdentityUpdate = async (updates: Record<string, unknown>) => {
    setIsSaving(true);
    try {
      await updateBusiness.mutateAsync(updates as any);
    } catch (error) {
      toast.error('Erro ao salvar');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Personalize seu negócio</p>
      </div>

      <Tabs defaultValue="identity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="identity" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Identidade
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Pagamento
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Regras
          </TabsTrigger>
        </TabsList>

        {/* Identity Settings */}
        <TabsContent value="identity">
          <IdentitySettings 
            business={business} 
            onUpdate={handleIdentityUpdate}
            isSaving={isSaving}
          />
        </TabsContent>

        {/* General Settings */}
        <TabsContent value="general">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-primary" />
                  Informações do Negócio
                </CardTitle>
                <CardDescription>
                  Informações básicas que aparecem para seus clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nome do Negócio *</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Ex: Doces da Maria"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">Tipo de Negócio</Label>
                  <Select value={businessType} onValueChange={(v) => setBusinessType(v as BusinessType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(businessTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Uma breve descrição do seu negócio..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    WhatsApp *
                  </Label>
                  <Input
                    id="whatsappNumber"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="84 XXX XXXX"
                  />
                  <p className="text-xs text-muted-foreground">
                    Este é o número que receberá as encomendas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Localização do seu negócio"
                  />
                </div>

                <Button
                  onClick={handleSaveGeneral}
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Configurações de Pagamento
                </CardTitle>
                <CardDescription>
                  Configure como receber pagamentos dos clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Required Toggle */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <div>
                    <p className="font-medium text-foreground">Exigir Pagamento</p>
                    <p className="text-sm text-muted-foreground">
                      Se ativado, clientes precisam pagar antes de enviar a encomenda
                    </p>
                  </div>
                  <Switch
                    checked={paymentRequired}
                    onCheckedChange={setPaymentRequired}
                  />
                </div>

                {/* Payment Methods */}
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Métodos de Pagamento</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mpesaNumber">Número M-Pesa</Label>
                    <Input
                      id="mpesaNumber"
                      value={mpesaNumber}
                      onChange={(e) => setMpesaNumber(e.target.value)}
                      placeholder="84 XXX XXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emolaNumber">Número e-Mola</Label>
                    <Input
                      id="emolaNumber"
                      value={emolaNumber}
                      onChange={(e) => setEmolaNumber(e.target.value)}
                      placeholder="86 XXX XXXX"
                    />
                  </div>
                </div>

                {/* Signal Amount */}
                <div className="space-y-2">
                  <Label htmlFor="signalAmount">Valor Mínimo do Sinal (MZN)</Label>
                  <Input
                    id="signalAmount"
                    type="number"
                    value={signalAmount}
                    onChange={(e) => setSignalAmount(e.target.value)}
                    placeholder="0 (sem mínimo)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe vazio ou 0 para não exigir valor mínimo
                  </p>
                </div>

                {/* Confirmation Message */}
                <div className="space-y-2">
                  <Label htmlFor="confirmationMessage" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Mensagem de Confirmação
                  </Label>
                  <Textarea
                    id="confirmationMessage"
                    value={confirmationMessage}
                    onChange={(e) => setConfirmationMessage(e.target.value)}
                    placeholder="Obrigado pela sua encomenda! Entraremos em contacto em breve."
                  />
                  <p className="text-xs text-muted-foreground">
                    Mensagem exibida após o cliente enviar a encomenda
                  </p>
                </div>

                <Button
                  onClick={handleSavePayment}
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salvar Configurações de Pagamento
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
