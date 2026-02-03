import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProductMediaUploader } from './ProductMediaUploader';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { Product } from '@/types/database';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  active: boolean;
  image_urls: string[];
  video_urls: string[];
  main_image_url: string | null;
}

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  businessId: string;
  onSave: (data: ProductFormData, productId?: string) => Promise<string | null>;
  saving?: boolean;
}

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  price: '',
  category: '',
  active: true,
  image_urls: [],
  video_urls: [],
  main_image_url: null,
};

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  businessId,
  onSave,
  saving = false,
}: ProductFormDialogProps) {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [tempProductId, setTempProductId] = useState<string | null>(null);
  const { uploading, progress, error, uploadProductMedia, clearError } = useMediaUpload();

  // Reset form when dialog opens/closes or product changes
  useEffect(() => {
    if (open) {
      if (product) {
        // Parse existing media URLs from product
        const existingImages = Array.isArray(product.image_urls) 
          ? (product.image_urls as string[]) 
          : [];
        const existingVideos = Array.isArray(product.video_urls) 
          ? (product.video_urls as string[]) 
          : [];
        
        setFormData({
          name: product.name,
          description: product.description || '',
          price: product.price.toString(),
          category: product.category || '',
          active: product.active,
          image_urls: existingImages,
          video_urls: existingVideos,
          main_image_url: product.main_image_url || product.image_url || existingImages[0] || null,
        });
        setTempProductId(product.id);
      } else {
        setFormData(initialFormData);
        setTempProductId(null);
      }
      clearError();
    }
  }, [open, product, clearError]);

  const handleUploadImages = async (files: File[]): Promise<string[]> => {
    // For new products, create a temp ID for uploads
    const productId = tempProductId || `temp_${Date.now()}`;
    if (!tempProductId) {
      setTempProductId(productId);
    }
    return uploadProductMedia(businessId, productId, files, 'images');
  };

  const handleUploadVideos = async (files: File[]): Promise<string[]> => {
    const productId = tempProductId || `temp_${Date.now()}`;
    if (!tempProductId) {
      setTempProductId(productId);
    }
    return uploadProductMedia(businessId, productId, files, 'videos');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate at least one media
    if (formData.image_urls.length === 0 && formData.video_urls.length === 0) {
      return;
    }
    
    await onSave(formData, product?.id);
  };

  const hasMedia = formData.image_urls.length > 0 || formData.video_urls.length > 0;
  const isSubmitDisabled = saving || uploading || !formData.name || !formData.price || !hasMedia;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>
            {product ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
            {/* Basic Info */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do produto"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do produto"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preço (MZN) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ex: Bolos"
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <Label htmlFor="active">Produto ativo</Label>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
            </div>

            {/* Media Upload Section */}
            <div className="border-t pt-4">
              <ProductMediaUploader
                images={formData.image_urls}
                videos={formData.video_urls}
                mainImageUrl={formData.main_image_url}
                onImagesChange={(urls) => setFormData({ ...formData, image_urls: urls })}
                onVideosChange={(urls) => setFormData({ ...formData, video_urls: urls })}
                onMainImageChange={(url) => setFormData({ ...formData, main_image_url: url })}
                onUploadImages={handleUploadImages}
                onUploadVideos={handleUploadVideos}
                uploading={uploading}
                progress={progress}
                error={error}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={saving || uploading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitDisabled}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  product ? 'Salvar' : 'Criar Produto'
                )}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
