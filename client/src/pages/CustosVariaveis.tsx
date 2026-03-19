import { trpc } from "@/lib/trpc";
import { useMonthYear } from "@/hooks/useMonthYear";
import { MonthSelector } from "@/components/MonthSelector";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const categories = ["Material", "Transporte", "Alimentação", "Manutenção", "Combustível", "Frete", "Comissão", "Outros"];

export default function CustosVariaveis() {
  const { month, year, monthName, goToPrevMonth, goToNextMonth } = useMonthYear();
  const utils = trpc.useUtils();
  const { data: items = [], isLoading } = trpc.companyVariableCosts.list.useQuery({ month, year });
  const createMut = trpc.companyVariableCosts.create.useMutation({ onSuccess: () => { utils.companyVariableCosts.list.invalidate(); toast.success("Custo adicionado"); setOpen(false); } });
  const updateMut = trpc.companyVariableCosts.update.useMutation({ onSuccess: () => { utils.companyVariableCosts.list.invalidate(); } });
  const deleteMut = trpc.companyVariableCosts.delete.useMutation({ onSuccess: () => { utils.companyVariableCosts.list.invalidate(); toast.success("Removido"); } });
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMut.mutate({
      description: fd.get("description") as string,
      category: fd.get("category") as string,
      amount: (parseFloat(fd.get("amount") as string) || 0).toFixed(2),
      date: fd.get("date") as string,
      supplier: (fd.get("supplier") as string) || undefined,
    });
  };

  const toggleStatus = (item: typeof items[0]) => {
    const next = item.status === "pago" ? "pendente" : "pago";
    updateMut.mutate({ id: item.id, status: next });
  };

  const total = items.reduce((s, i) => s + parseFloat(i.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Custos Variáveis - Empresa</h1>
          <p className="text-sm text-muted-foreground">Despesas pontuais e variáveis da empresa</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthSelector monthName={monthName} year={year} onPrev={goToPrevMonth} onNext={goToNextMonth} />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Novo Custo</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo Custo Variável</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><Label>Descrição</Label><Input name="description" required /></div>
                  <div><Label>Categoria</Label>
                    <Select name="category" required>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Valor (R$)</Label><Input name="amount" type="number" step="0.01" required /></div>
                  <div><Label>Data</Label><Input name="date" type="date" required /></div>
                  <div><Label>Fornecedor</Label><Input name="supplier" /></div>
                </div>
                <Button type="submit" className="w-full" disabled={createMut.isPending}>
                  {createMut.isPending ? "Salvando..." : "Adicionar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground uppercase">Total do Mês</p><p className="text-xl font-bold mt-1">{formatCurrency(total)}</p></CardContent></Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum custo variável neste mês</TableCell></TableRow>
              ) : items.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.supplier || "-"}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                  <TableCell>{formatDate(item.date)}</TableCell>
                  <TableCell><button onClick={() => toggleStatus(item)}><StatusBadge status={item.status} /></button></TableCell>
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
