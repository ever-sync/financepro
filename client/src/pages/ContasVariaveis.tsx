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

const categories = ["Alimentação", "Transporte", "Lazer", "Vestuário", "Saúde", "Educação", "Presentes", "Manutenção Casa", "Outros"];

export default function ContasVariaveis() {
  const { month, year, monthName, goToPrevMonth, goToNextMonth } = useMonthYear();
  const utils = trpc.useUtils();
  const { data: items = [], isLoading } = trpc.personalVariableCosts.list.useQuery({ month, year });
  const createMut = trpc.personalVariableCosts.create.useMutation({ onSuccess: () => { utils.personalVariableCosts.list.invalidate(); toast.success("Conta adicionada"); setOpen(false); } });
  const updateMut = trpc.personalVariableCosts.update.useMutation({ onSuccess: () => { utils.personalVariableCosts.list.invalidate(); } });
  const deleteMut = trpc.personalVariableCosts.delete.useMutation({ onSuccess: () => { utils.personalVariableCosts.list.invalidate(); toast.success("Removida"); } });
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMut.mutate({
      description: fd.get("description") as string,
      category: fd.get("category") as string,
      amount: (parseFloat(fd.get("amount") as string) || 0).toFixed(2),
      date: fd.get("date") as string,
    });
  };

  const total = items.reduce((s, i) => s + parseFloat(i.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contas Variáveis - Pessoal</h1>
          <p className="text-sm text-muted-foreground">Gastos do dia a dia da sua vida pessoal</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthSelector monthName={monthName} year={year} onPrev={goToPrevMonth} onNext={goToNextMonth} />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Conta</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova Conta Variável Pessoal</DialogTitle></DialogHeader>
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
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma conta variável neste mês</TableCell></TableRow>
              ) : items.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                  <TableCell>{formatDate(item.date)}</TableCell>
                  <TableCell>
                    <button onClick={() => updateMut.mutate({ id: item.id, status: item.status === "pago" ? "pendente" : "pago" })}>
                      <StatusBadge status={item.status} />
                    </button>
                  </TableCell>
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
