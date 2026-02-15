import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, Plus, Trash2, CalendarDays, Tag, TrendingDown, BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { useExpenses, EXPENSE_CATEGORIES, type ExpenseInsert } from '@/hooks/useExpenses';
import { formatCurrency } from '@/lib/whatsapp';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts';

const COLORS = ['#F97316', '#3B82F6', '#A78BFA', '#4ADE80', '#FBBF24', '#F87171', '#34D399', '#60A5FA', '#E879F9'];

const glassCard = {
  backgroundColor: 'rgba(255,255,255,0.04)',
  borderColor: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)',
};

export default function Expenses() {
  const { expenses, isLoading, addExpense, deleteExpense, totalMonth, byCategory } = useExpenses();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ExpenseInsert>({
    description: '',
    amount: 0,
    category: 'outros',
    expense_date: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || form.amount <= 0) return;
    addExpense.mutate(form, {
      onSuccess: () => {
        setOpen(false);
        setForm({ description: '', amount: 0, category: 'outros', expense_date: new Date().toISOString().slice(0, 10), notes: '' });
      },
    });
  };

  const pieData = byCategory.map(c => ({ name: c.label, value: c.total }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wallet className="w-6 h-6" style={{ color: '#F97316' }} />
            Despesas
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Controle os gastos do seu negócio</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" style={{ backgroundColor: '#F97316' }}>
              <Plus className="w-4 h-4" /> Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registar Despesa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Descrição</Label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Ex: Compra de ingredientes" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Valor (MZN)</Label>
                  <Input type="number" min="0" step="0.01" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} required />
                </div>
                <div>
                  <Label>Data</Label>
                  <Input type="date" value={form.expense_date} onChange={e => setForm(f => ({ ...f, expense_date: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notas (opcional)</Label>
                <Textarea value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Observações..." />
              </div>
              <Button type="submit" className="w-full" disabled={addExpense.isPending} style={{ backgroundColor: '#F97316' }}>
                {addExpense.isPending ? 'Salvando...' : 'Registar Despesa'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="rounded-2xl border" style={glassCard}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(249,115,22,0.15)' }}>
                  <TrendingDown className="w-5 h-5" style={{ color: '#F97316' }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Despesas do Mês</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(totalMonth)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="rounded-2xl border" style={glassCard}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(59,130,246,0.15)' }}>
                  <BarChart3 className="w-5 h-5" style={{ color: '#3B82F6' }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Registos</p>
                  <p className="text-xl font-bold text-foreground">{expenses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="rounded-2xl border" style={glassCard}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(167,139,250,0.15)' }}>
                  <Tag className="w-5 h-5" style={{ color: '#A78BFA' }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Categorias Ativas</p>
                  <p className="text-xl font-bold text-foreground">{byCategory.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Chart + List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="rounded-2xl border" style={glassCard}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                          formatter={(value: number) => formatCurrency(value)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1.5 mt-2">
                    {byCategory.map((c, i) => (
                      <div key={c.value} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-muted-foreground">{c.label}</span>
                        </div>
                        <span className="font-medium text-foreground">{formatCurrency(c.total)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-8">Sem despesas este mês</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Expense List */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="lg:col-span-2">
          <Card className="rounded-2xl border" style={glassCard}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Histórico de Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <div className="text-center py-12">
                  <Wallet className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                  <p className="text-sm text-muted-foreground">Nenhuma despesa registada ainda.</p>
                  <p className="text-xs text-muted-foreground mt-1">Clique em "Nova Despesa" para começar.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {expenses.map((exp, i) => {
                    const cat = EXPENSE_CATEGORIES.find(c => c.value === exp.category);
                    return (
                      <motion.div
                        key={exp.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-3 rounded-xl p-3 transition-all duration-200 hover:scale-[1.01] group"
                        style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                      >
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COLORS[EXPENSE_CATEGORIES.findIndex(c => c.value === exp.category) % COLORS.length]}18` }}>
                          <Tag className="w-4 h-4" style={{ color: COLORS[EXPENSE_CATEGORIES.findIndex(c => c.value === exp.category) % COLORS.length] }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{exp.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{new Date(exp.expense_date).toLocaleDateString('pt-MZ')}</span>
                            <Badge variant="outline" className="text-[10px] border-0 px-1.5" style={{ color: COLORS[EXPENSE_CATEGORIES.findIndex(c => c.value === exp.category) % COLORS.length], backgroundColor: `${COLORS[EXPENSE_CATEGORIES.findIndex(c => c.value === exp.category) % COLORS.length]}15` }}>
                              {cat?.label || exp.category}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-foreground whitespace-nowrap">{formatCurrency(exp.amount)}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                          onClick={() => deleteExpense.mutate(exp.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
