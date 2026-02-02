import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, Save, Loader2, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUploader } from './ImageUploader';
import { useBusinessStorage } from '@/hooks/useBusinessStorage';
import { Business } from '@/types/database';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface IdentitySettingsProps {
  business: Business | null;
  onUpdate: (updates: Partial<Business>) => Promise<void>;
  isSaving: boolean;
}

export function IdentitySettings({ business, onUpdate, isSaving }: IdentitySettingsProps) {
  const { uploadLogo, uploadCover, uploading, error, clearError } = useBusinessStorage();
  
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#C9A24D');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (business) {
      setName(business.name || '');
      setSlug(business.slug || '');
      setDescription(business.description || '');
      setPrimaryColor(business.primary_color || '#C9A24D');
      setLogoUrl(business.logo_url);
      setCoverUrl(business.cover_image_url);
    }
  }, [business]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const validateSlug = async (newSlug: string): Promise<boolean> => {
    if (!newSlug) {
      setSlugError('Slug é obrigatório');
      return false;
    }
    
    // Validate format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(newSlug)) {
      setSlugError('Use apenas letras minúsculas, números e hífens');
      return false;
    }
    
    // Check uniqueness if changed
    if (newSlug !== business?.slug) {
      const { data } = await supabase
        .from('businesses')
        .select('id')
        .eq('slug', newSlug)
        .neq('id', business?.id || '')
        .maybeSingle();
      
      if (data) {
        setSlugError('Este slug já está em uso');
        return false;
      }
    }
    
    setSlugError(null);
    return true;
  };

  const handleLogoUpload = async (file: File) => {
    if (!business?.id) return null;
    
    const url = await uploadLogo(business.id, file);
    if (url) {
      setLogoUrl(url);
      await onUpdate({ logo_url: url });
      toast.success('Logotipo atualizado!');
    }
    return url;
  };

  const handleCoverUpload = async (file: File) => {
    if (!business?.id) return null;
    
    const url = await uploadCover(business.id, file);
    if (url) {
      setCoverUrl(url);
      await onUpdate({ cover_image_url: url });
      toast.success('Foto de capa atualizada!');
    }
    return url;
  };

  const handleRemoveLogo = async () => {
    if (!business?.id) return;
    setLogoUrl(null);
    await onUpdate({ logo_url: null });
    toast.success('Logotipo removido');
  };

  const handleRemoveCover = async () => {
    if (!business?.id) return;
    setCoverUrl(null);
    await onUpdate({ cover_image_url: null });
    toast.success('Foto de capa removida');
  };

  const handleSave = async () => {
    const isValid = await validateSlug(slug);
    if (!isValid) return;
    
    await onUpdate({
      name,
      slug,
      description: description || null,
      primary_color: primaryColor,
    });
    toast.success('Identidade do negócio salva!');
  };

  const publicUrl = `${window.location.origin}/b/${slug}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Imagens do Negócio
          </CardTitle>
          <CardDescription>
            Adicione um logotipo e foto de capa para seu site público
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploader
              label="Logotipo"
              description="Imagem quadrada, aparece no cabeçalho"
              currentUrl={logoUrl}
              onUpload={handleLogoUpload}
              onRemove={handleRemoveLogo}
              uploading={uploading}
              aspectRatio="square"
            />
            
            <div className="md:col-span-1">
              <ImageUploader
                label="Foto de Capa"
                description="Imagem panorâmica, aparece no topo do site"
                currentUrl={coverUrl}
                onUpload={handleCoverUpload}
                onRemove={handleRemoveCover}
                uploading={uploading}
                aspectRatio="cover"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Identity Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Identidade</CardTitle>
          <CardDescription>
            Personalize como seu negócio aparece para os clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Negócio *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Doces da Maria"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL) *</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => {
                    const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                    setSlug(newSlug);
                    setSlugError(null);
                  }}
                  placeholder="meu-negocio"
                  className={slugError ? 'border-destructive' : ''}
                />
                {slugError && (
                  <p className="text-xs text-destructive mt-1">{slugError}</p>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Este será o link do seu site: {publicUrl}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição Curta</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Uma breve descrição do seu negócio..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryColor">Cor Principal</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="primaryColor"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-12 h-12 rounded-lg border border-border cursor-pointer"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#C9A24D"
                className="flex-1 max-w-[150px]"
              />
              <div 
                className="h-10 px-4 rounded-lg flex items-center text-white text-sm font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                Exemplo
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Esta cor será usada nos botões e destaques do seu site
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving || uploading}
            className="w-full"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Identidade
          </Button>
        </CardContent>
      </Card>

      {/* Public Site Link */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-foreground">Seu Site Público</h4>
              <p className="text-sm text-muted-foreground">
                Compartilhe este link com seus clientes
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
                className="flex-1 sm:flex-none"
              >
                {copied ? (
                  <Check className="w-4 h-4 mr-1" />
                ) : (
                  <Copy className="w-4 h-4 mr-1" />
                )}
                Copiar
              </Button>
              <Button
                size="sm"
                onClick={() => window.open(publicUrl, '_blank')}
                className="flex-1 sm:flex-none"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Visitar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
