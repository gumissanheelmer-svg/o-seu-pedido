 import { useState } from 'react';
 import { format } from 'date-fns';
 import { pt } from 'date-fns/locale';
 import { 
   Users, 
   Plus, 
   Pencil, 
   Trash2, 
   Phone, 
   Building2,
   DollarSign,
   TrendingUp,
   MoreHorizontal,
   Power
 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Badge } from '@/components/ui/badge';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
   DialogFooter,
   DialogDescription,
 } from '@/components/ui/dialog';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from '@/components/ui/table';
 import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
 } from '@/components/ui/alert-dialog';
 import { useAffiliates, Affiliate, AffiliateWithStats } from '@/hooks/useAffiliates';
 
 const Affiliates = () => {
   const { 
     affiliatesWithStats, 
     metrics, 
     isLoading,
     createAffiliate,
     updateAffiliate,
     deleteAffiliate,
   } = useAffiliates();
 
   const [isCreateOpen, setIsCreateOpen] = useState(false);
   const [isEditOpen, setIsEditOpen] = useState(false);
   const [selectedAffiliate, setSelectedAffiliate] = useState<AffiliateWithStats | null>(null);
   const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
 
   const [formData, setFormData] = useState({
     name: '',
     phone: '',
     fixed_commission: 0,
   });
 
   const handleCreate = async () => {
     await createAffiliate.mutateAsync(formData);
     setIsCreateOpen(false);
     setFormData({ name: '', phone: '', fixed_commission: 0 });
   };
 
   const handleEdit = (affiliate: AffiliateWithStats) => {
     setSelectedAffiliate(affiliate);
     setFormData({
       name: affiliate.name,
       phone: affiliate.phone,
       fixed_commission: affiliate.fixed_commission,
     });
     setIsEditOpen(true);
   };
 
   const handleUpdate = async () => {
     if (!selectedAffiliate) return;
     await updateAffiliate.mutateAsync({ id: selectedAffiliate.id, ...formData });
     setIsEditOpen(false);
     setSelectedAffiliate(null);
   };
 
   const handleToggleActive = async (affiliate: AffiliateWithStats) => {
     await updateAffiliate.mutateAsync({ id: affiliate.id, active: !affiliate.active });
   };
 
   const handleDelete = async () => {
     if (!deleteConfirmId) return;
     await deleteAffiliate.mutateAsync(deleteConfirmId);
     setDeleteConfirmId(null);
   };
 
   if (isLoading) {
     return (
       <div className="flex items-center justify-center h-64">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
       </div>
     );
   }
 
   return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-2xl font-display font-bold text-foreground">Afiliados</h1>
           <p className="text-muted-foreground">Gerir afiliados de encomendas</p>
         </div>
         <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
           <DialogTrigger asChild>
             <Button>
               <Plus className="w-4 h-4 mr-2" />
               Novo Afiliado
             </Button>
           </DialogTrigger>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>Criar Afiliado</DialogTitle>
               <DialogDescription>
                 Adicione um novo afiliado para rastrear vendas e comissões.
               </DialogDescription>
             </DialogHeader>
             <div className="space-y-4 py-4">
               <div className="space-y-2">
                 <Label htmlFor="name">Nome</Label>
                 <Input
                   id="name"
                   value={formData.name}
                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                   placeholder="Nome do afiliado"
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="phone">Telefone</Label>
                 <Input
                   id="phone"
                   value={formData.phone}
                   onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                   placeholder="+258 84 000 0000"
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="commission">Comissão Fixa (MZN)</Label>
                 <Input
                   id="commission"
                   type="number"
                   value={formData.fixed_commission}
                   onChange={(e) => setFormData({ ...formData, fixed_commission: Number(e.target.value) })}
                   placeholder="0"
                 />
               </div>
             </div>
             <DialogFooter>
               <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                 Cancelar
               </Button>
               <Button onClick={handleCreate} disabled={createAffiliate.isPending}>
                 {createAffiliate.isPending ? 'A criar...' : 'Criar'}
               </Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>
       </div>
 
       {/* KPI Cards */}
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                 <Users className="w-5 h-5 text-primary" />
               </div>
               <div>
                 <p className="text-2xl font-bold">{metrics.totalAffiliates}</p>
                 <p className="text-xs text-muted-foreground">Total</p>
               </div>
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                 <Users className="w-5 h-5 text-success" />
               </div>
               <div>
                 <p className="text-2xl font-bold">{metrics.activeAffiliates}</p>
                 <p className="text-xs text-muted-foreground">Ativos</p>
               </div>
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                 <DollarSign className="w-5 h-5 text-warning" />
               </div>
               <div>
                 <p className="text-2xl font-bold">{metrics.totalCommissions.toLocaleString()}</p>
                 <p className="text-xs text-muted-foreground">Comissões (MZN)</p>
               </div>
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                 <TrendingUp className="w-5 h-5 text-accent-foreground" />
               </div>
               <div>
                 <p className="text-2xl font-bold">{metrics.totalPlatformProfit.toLocaleString()}</p>
                 <p className="text-xs text-muted-foreground">Lucro (MZN)</p>
               </div>
             </div>
           </CardContent>
         </Card>
       </div>
 
       {/* Affiliates Table */}
       <Card>
         <CardHeader>
           <CardTitle>Lista de Afiliados</CardTitle>
         </CardHeader>
         <CardContent>
           {affiliatesWithStats && affiliatesWithStats.length > 0 ? (
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Nome</TableHead>
                   <TableHead>Telefone</TableHead>
                   <TableHead className="text-center">Negócios</TableHead>
                   <TableHead className="text-right">Vendas</TableHead>
                   <TableHead className="text-right">Comissão</TableHead>
                   <TableHead className="text-center">Status</TableHead>
                   <TableHead className="w-12"></TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {affiliatesWithStats.map((affiliate) => (
                   <TableRow key={affiliate.id}>
                     <TableCell className="font-medium">{affiliate.name}</TableCell>
                     <TableCell>
                       <div className="flex items-center gap-1 text-muted-foreground">
                         <Phone className="w-3 h-3" />
                         {affiliate.phone}
                       </div>
                     </TableCell>
                     <TableCell className="text-center">
                       <div className="flex items-center justify-center gap-1">
                         <Building2 className="w-3 h-3 text-muted-foreground" />
                         {affiliate.total_businesses}
                       </div>
                     </TableCell>
                     <TableCell className="text-right">
                       {affiliate.total_sales.toLocaleString()} MZN
                     </TableCell>
                     <TableCell className="text-right">
                       {affiliate.total_commission.toLocaleString()} MZN
                     </TableCell>
                     <TableCell className="text-center">
                       <Badge variant={affiliate.active ? 'default' : 'secondary'}>
                         {affiliate.active ? 'Ativo' : 'Inativo'}
                       </Badge>
                     </TableCell>
                     <TableCell>
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="icon">
                             <MoreHorizontal className="w-4 h-4" />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => handleEdit(affiliate)}>
                             <Pencil className="w-4 h-4 mr-2" />
                             Editar
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleToggleActive(affiliate)}>
                             <Power className="w-4 h-4 mr-2" />
                             {affiliate.active ? 'Desativar' : 'Ativar'}
                           </DropdownMenuItem>
                           <DropdownMenuItem 
                             onClick={() => setDeleteConfirmId(affiliate.id)}
                             className="text-destructive"
                           >
                             <Trash2 className="w-4 h-4 mr-2" />
                             Eliminar
                           </DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           ) : (
             <div className="text-center py-8 text-muted-foreground">
               <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
               <p className="text-lg font-medium">Nenhum afiliado</p>
               <p className="text-sm">Crie seu primeiro afiliado para começar.</p>
             </div>
           )}
         </CardContent>
       </Card>
 
       {/* Edit Dialog */}
       <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Editar Afiliado</DialogTitle>
             <DialogDescription>
               Atualize as informações do afiliado.
             </DialogDescription>
           </DialogHeader>
           <div className="space-y-4 py-4">
             <div className="space-y-2">
               <Label htmlFor="edit-name">Nome</Label>
               <Input
                 id="edit-name"
                 value={formData.name}
                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="edit-phone">Telefone</Label>
               <Input
                 id="edit-phone"
                 value={formData.phone}
                 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="edit-commission">Comissão Fixa (MZN)</Label>
               <Input
                 id="edit-commission"
                 type="number"
                 value={formData.fixed_commission}
                 onChange={(e) => setFormData({ ...formData, fixed_commission: Number(e.target.value) })}
               />
             </div>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setIsEditOpen(false)}>
               Cancelar
             </Button>
             <Button onClick={handleUpdate} disabled={updateAffiliate.isPending}>
               {updateAffiliate.isPending ? 'A guardar...' : 'Guardar'}
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
 
       {/* Delete Confirmation */}
       <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>Eliminar Afiliado?</AlertDialogTitle>
             <AlertDialogDescription>
               Esta ação não pode ser desfeita. Todas as vendas associadas serão também eliminadas.
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel>Cancelar</AlertDialogCancel>
             <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
               Eliminar
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
     </div>
   );
 };
 
 export default Affiliates;