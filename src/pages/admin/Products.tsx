import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Package, MoreVertical, Image, Play } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ProductFormDialog } from '@/components/admin/products/ProductFormDialog';
import { Product } from '@/types/database';
import { formatCurrency } from '@/lib/whatsapp';
import { toast } from 'sonner';

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

export default function Products() {
  const { businessId } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', businessId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!businessId,
  });

  const createProduct = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert({
          business_id: businessId,
          name: data.name,
          description: data.description || null,
          price: parseFloat(data.price) || 0,
          category: data.category || null,
          image_url: data.main_image_url || data.image_urls[0] || null,
          image_urls: data.image_urls,
          video_urls: data.video_urls,
          main_image_url: data.main_image_url,
          active: data.active,
        })
        .select()
        .single();
      if (error) throw error;
      return newProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', businessId] });
      toast.success('Produto criado com sucesso!');
      handleCloseDialog();
    },
    onError: () => {
      toast.error('Erro ao criar produto');
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductFormData }) => {
      const { error } = await supabase
        .from('products')
        .update({
          name: data.name,
          description: data.description || null,
          price: parseFloat(data.price) || 0,
          category: data.category || null,
          image_url: data.main_image_url || data.image_urls[0] || null,
          image_urls: data.image_urls,
          video_urls: data.video_urls,
          main_image_url: data.main_image_url,
          active: data.active,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', businessId] });
      toast.success('Produto atualizado!');
      handleCloseDialog();
    },
    onError: () => {
      toast.error('Erro ao atualizar produto');
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', businessId] });
      toast.success('Produto removido!');
    },
    onError: () => {
      toast.error('Erro ao remover produto');
    },
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setSaving(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleSave = async (data: ProductFormData, productId?: string): Promise<string | null> => {
    setSaving(true);
    try {
      if (productId) {
        await updateProduct.mutateAsync({ id: productId, data });
      } else {
        await createProduct.mutateAsync(data);
      }
      return null;
    } catch (error) {
      setSaving(false);
      return 'Erro ao salvar produto';
    }
  };

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Get display image for product card
  const getProductDisplayImage = (product: Product): string | null => {
    return product.main_image_url || product.image_url || 
      (Array.isArray(product.image_urls) && product.image_urls.length > 0 
        ? product.image_urls[0] 
        : null);
  };

  // Check if product has video
  const hasVideo = (product: Product): boolean => {
    return Array.isArray(product.video_urls) && product.video_urls.length > 0;
  };

  // Get media count for display
  const getMediaCount = (product: Product): { images: number; videos: number } => {
    const images = Array.isArray(product.image_urls) ? product.image_urls.length : 0;
    const videos = Array.isArray(product.video_urls) ? product.video_urls.length : 0;
    return { images, videos };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
          <p className="text-muted-foreground mt-1">Gerencie seu catálogo de produtos</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar produtos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">Nenhum produto cadastrado</p>
            <p className="text-muted-foreground mb-4">Adicione produtos ao seu catálogo</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Produto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product, index) => {
            const displayImage = getProductDisplayImage(product);
            const mediaCount = getMediaCount(product);
            
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={!product.active ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center shrink-0 overflow-hidden relative">
                        {displayImage ? (
                          <>
                            <img
                              src={displayImage}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                            {/* Media count badge */}
                            {(mediaCount.images > 1 || mediaCount.videos > 0) && (
                              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                                {mediaCount.images > 0 && (
                                  <span className="flex items-center gap-0.5">
                                    <Image className="w-3 h-3" />
                                    {mediaCount.images}
                                  </span>
                                )}
                                {mediaCount.videos > 0 && (
                                  <span className="flex items-center gap-0.5">
                                    <Play className="w-3 h-3" />
                                    {mediaCount.videos}
                                  </span>
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          <Image className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                            {product.category && (
                              <span className="text-xs text-muted-foreground">{product.category}</span>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="shrink-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(product)}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => deleteProduct.mutate(product.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remover
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {product.description || 'Sem descrição'}
                        </p>
                        <p className="text-lg font-bold text-primary mt-2">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Product Form Dialog */}
      <ProductFormDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseDialog();
          else setIsDialogOpen(true);
        }}
        product={editingProduct}
        businessId={businessId || ''}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}
