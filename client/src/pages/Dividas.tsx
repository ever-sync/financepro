import { trpc } from "@/lib/trpc";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, AlertTriangle, TrendingDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Dividas() {
  const utils = trpc.useUtils();
  const { data: items = [], isLoading } = trpc.debts.list.useQuery();
  const createMut = trpc.debts.create.useMutation({ onSuccess: () => { utils.debts.list.invalidate(); toast.success("Dívida adicionada"); setOpen(false); } });
  const updateMut = trpc.debts.update.useMutation({ onSuccess: () => { utils.debts.list.invalidate(); toast.success("Atualizado"); } });
  const deleteMut = trpc.debts.delete.useMutation({ onSuccess: () => { utils.debts.list.invalidate(); toast.success("Removida"); } });
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMut.mutate({
      creditor: fd.get("creditor") as string,
      description: fd.get("description") as string,
      originalAmount: (parseFloat(fd.get("originalAmount") as string) || 0).toFixed(2),
      currentBalance: (parseFloat(fd.get("currentBalance") as string) || 0).toFixed(2),
      monthlyPayment: (parseFloat(fd.get("monthlyPayment") as string) || 0).toFixed(2),
      interestRate: (parseFloat(fd.get("interestRate") as string) || 0).toFixed(2),
      totalInstallments: parseInt(fd.get("totalInstallments") as string) || 1,
      paidInstallments: parseInt(fd.get("paidInstallments") as string) || 0,
      dueDay: parseInt(fd.get("dueDay") as string) || 1,
      priority: (fd.get("priority") as "alta" | "media" | "baixa") || "media",
    });
  };

  const payInstallment = (item: typeof items[0]) => {
    const newPaid = item.paidInstallments + 1;
    const newBalance = Math.max(parseFloat(item.currentBalance) - parseFloat(item.monthlyPayment), 0);
    updateMut.mutate({
      id: item.id,
      paidInstallments: newPaid,
      currentBalance: newBalance.toFixed(2),
      status: newPaid >= item.totalInstallments ? "quitada" : "ativa",
    });
  };

  const activeDebts = items.filter(i => i.status === "ativa");
  const totalBalance = activeDebts.reduce((s, i) => s + parseFloat(i.currentBalance), 0);
  const totalMonthly = activeDebts.reduce((s, i) => s + parseFloat(i.monthlyPayment), 0);

  // Método Avalanche: ordenar por maior taxa de juros
  const avalancheOrder = [...activeDebts].sort((a, b) => parseFloat(b.interestRate) - parseFloat(a.interestRate));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plano de Quitação de Dívidas</h1>
          <p className="text-sm text-muted-foreground">Organize e elimine suas dívidas com o Método Avalanche</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Dívida</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nova Dívida</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Credor</Label><Input name="creditor" required /></div>
                <div><Label>Descrição</Label><Input name="description" required /></div>
                <div><Label>Valor Original (R$)</Label><Input name="originalAmount" type="number" step="0.01" required /></div>
                <div><Label>Saldo Atual (R$)</Label><Input name="currentBalance" type="number" step="0.01" required /></div>
                <div><Label>Parcela Mensal (R$)</Label><Input name="monthlyPayment" type="number" step="0.01" required /></div>
                <div><Label>Taxa Juros (% a.m.)</Label><Input name="interestRate" type="number" step="0.01" /></div>
                <div><Label>Total Parcelas</Label><Input name="totalInstallments" type="number" min="1" required /></div>
                <div><Label>Parcelas Pagas</Label><Input name="paidInstallments" type="number" min="0" defaultValue="0" /></div>
                <div><Label>Dia Vencimento</Label><Input name="dueDay" type="number" min="1" max="31" required /></div>
                <div><Label>Prioridade</Label>
                  <Select name="priority" defaultValue="media">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMut.isPending}>
                {createMut.isPending ? "Salvando..." : "Adicionar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 flex items-center justify-between">
          <div><p className="text-xs text-muted-foreground uppercase">Dívida Total</p><p className="text-2xl font-bold mt-1 text-destructive">{formatCurrency(totalBalance)}</p></div>
          <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
        </CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground uppercase">Parcelas Mensais</p><p className="text-2xl font-bold mt-1">{formatCurrency(totalMonthly)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground uppercase">Dívidas Ativas</p><p className="text-2xl font-bold mt-1">{activeDebts.length}</p></CardContent></Card>
      </div>

      {avalancheOrder.length > 0 && (
        <Card className="border-chart-3/30 bg-chart-3/5">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><TrendingDown className="h-4 w-4" /> Método Avalanche - Ordem de Prioridade</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">Pague primeiro as dívidas com maior taxa de juros para economizar mais no longo prazo.</p>
            <div className="space-y-3">
              {avalancheOrder.map((debt, i) => {
                const progress = debt.totalInstallments > 0 ? (debt.paidInstallments / debt.totalInstallments) * 100 : 0;
                return (
                  <div key={debt.id} className="flex items-center gap-4">
                    <span className="text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">{debt.creditor} - {debt.description}</span>
                        <span className="text-xs text-muted-foreground">{formatPercent(debt.interestRate)} a.m.</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                        <span>{debt.paidInstallments}/{debt.totalInstallments} parcelas</span>
                        <span>Saldo: {formatCurrency(debt.currentBalance)}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => payInstallment(debt)} disabled={updateMut.isPending}>
                      Pagar Parcela
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Credor</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Original</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead className="text-right">Parcela</TableHead>
                <TableHead>Juros</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">Nenhuma dívida cadastrada</TableCell></TableRow>
              ) : items.map(item => (
                <TableRow key={item.id} className={item.status === "quitada" ? "opacity-50" : ""}>
                  <TableCell className="font-medium">{item.creditor}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.originalAmount)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.currentBalance)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.monthlyPayment)}</TableCell>
                  <TableCell>{formatPercent(item.interestRate)}</TableCell>
                  <TableCell>{item.paidInstallments}/{item.totalInstallments}</TableCell>
                  <TableCell><StatusBadge status={item.priority} /></TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMut.mutate({ id: item.id })}><Trash2 className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
