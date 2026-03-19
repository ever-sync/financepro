import { trpc } from "@/lib/trpc";
import { useMonthYear } from "@/hooks/useMonthYear";
import { MonthSelector } from "@/components/MonthSelector";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const categories = ["Serviço", "Produto", "Consultoria", "Projeto", "Comissão", "Outros"];

export default function Receitas() {
  const { month, year, monthName, goToPrevMonth, goToNextMonth } = useMonthYear();
  const utils = trpc.useUtils();
  const { data: items = [], isLoading } = trpc.revenues.list.useQuery({ month, year });
  const { data: settings } = trpc.settings.get.useQuery();
  const createMutation = trpc.revenues.create.useMutation({ onSuccess: () => { utils.revenues.list.invalidate(); toast.success("Receita adicionada"); setOpen(false); } });
  const updateMutation = trpc.revenues.update.useMutation({ onSuccess: () => { utils.revenues.list.invalidate(); toast.success("Receita atualizada"); } });
  const deleteMutation = trpc.revenues.delete.useMutation({ onSuccess: () => { utils.revenues.list.invalidate(); toast.success("Receita removida"); } });

  const [open, setOpen] = useState(false);
  const taxRate = parseFloat(settings?.taxPercent || "6") / 100;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const gross = parseFloat(fd.get("grossAmount") as string) || 0;
    const tax = gross * taxRate;
    const net = gross - tax;
    createMutation.mutate({
      description: fd.get("description") as string,
      category: fd.get("category") as string,
      grossAmount: gross.toFixed(2),
      taxAmount: tax.toFixed(2),
      netAmount: net.toFixed(2),
      client: (fd.get("client") as string) || undefined,
      dueDate: fd.get("dueDate") as string,
      status: "pendente",
    });
  };

  const toggleStatus = (item: typeof items[0]) => {
    const next = item.status === "recebido" ? "pendente" : "recebido";
    updateMutation.mutate({
      id: item.id,
      status: next,
      receivedDate: next === "recebido" ? new Date().toISOString().split("T")[0] : null,
    });
  };

  const totalGross = items.reduce((s, i) => s + parseFloat(i.grossAmount), 0);
  const totalNet = items.reduce((s, i) => s + parseFloat(i.netAmount), 0);
  const totalReceived = items.filter(i => i.status === "recebido").reduce((s, i) => s + parseFloat(i.grossAmount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Receitas</h1>
          <p className="text-sm text-muted-foreground">Faturamento da empresa (imposto de {(taxRate * 100).toFixed(0)}% calculado automaticamente)</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthSelector monthName={monthName} year={year} onPrev={goToPrevMonth} onNext={goToNextMonth} />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Receita</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova Receita</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><Label>Descrição</Label><Input name="description" required /></div>
                  <div><Label>Categoria</Label>
                    <Select name="category" required>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Valor Bruto (R$)</Label><Input name="grossAmount" type="number" step="0.01" required /></div>
                  <div><Label>Cliente</Label><Input name="client" /></div>
                  <div><Label>Data Vencimento</Label><Input name="dueDate" type="date" required /></div>
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Salvando..." : "Adicionar Receita"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground uppercase">Bruto</p><p className="text-xl font-bold mt-1">{formatCurrency(totalGross)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground uppercase">Líquido (após imposto)</p><p className="text-xl font-bold mt-1 text-primary">{formatCurrency(totalNet)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground uppercase">Recebido</p><p className="text-xl font-bold mt-1 text-chart-1">{formatCurrency(totalReceived)}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Bruto</TableHead>
                <TableHead className="text-right">Imposto</TableHead>
                <TableHead className="text-right">Líquido</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhuma receita neste mês</TableCell></TableRow>
              ) : items.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.client || "-"}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.grossAmount)}</TableCell>
                  <TableCell className="text-right text-destructive">{formatCurrency(item.taxAmount)}</TableCell>
                  <TableCell className="text-right text-primary font-medium">{formatCurrency(item.netAmount)}</TableCell>
                  <TableCell>{formatDate(item.dueDate)}</TableCell>
                  <TableCell>
                    <button onClick={() => toggleStatus(item)}>
                      <StatusBadge status={item.status} />
                    </button>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate({ id: item.id })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
