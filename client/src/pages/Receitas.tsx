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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const categories = ["Serviço", "Produto", "Consultoria", "Projeto", "Comissão", "Outros"];

interface FormState {
  description: string;
  category: string;
  grossAmount: string;
  client: string;
  dueDate: string;
  status: string;
}

const EMPTY: FormState = { description: "", category: "", grossAmount: "", client: "", dueDate: "", status: "pendente" };

export default function Receitas() {
  const { month, year, monthName, goToPrevMonth, goToNextMonth } = useMonthYear();
  const utils = trpc.useUtils();
  const { data: items = [], isLoading } = trpc.revenues.list.useQuery({ month, year });
  const { data: settings } = trpc.settings.get.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const { data: services = [] } = trpc.services.list.useQuery();

  const createMutation = trpc.revenues.create.useMutation({ onSuccess: () => { utils.revenues.list.invalidate(); toast.success("Receita adicionada"); closeDialog(); } });
  const updateMutation = trpc.revenues.update.useMutation({ onSuccess: () => { utils.revenues.list.invalidate(); toast.success("Receita atualizada"); closeDialog(); } });
  const deleteMutation = trpc.revenues.delete.useMutation({ onSuccess: () => { utils.revenues.list.invalidate(); toast.success("Receita removida"); } });

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [selectedService, setSelectedService] = useState("");

  const taxRate = parseFloat(settings?.taxPercent || "6") / 100;

  const closeDialog = () => { setOpen(false); setEditingId(null); setForm(EMPTY); setSelectedService(""); };

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setSelectedService(""); setOpen(true); };

  const openEdit = (item: typeof items[0]) => {
    setEditingId(item.id);
    setForm({
      description: item.description,
      category: item.category,
      grossAmount: parseFloat(item.grossAmount).toFixed(2),
      client: item.client ?? "",
      dueDate: item.dueDate,
      status: item.status,
    });
    setSelectedService("");
    setOpen(true);
  };

  const set = (field: keyof FormState, val: string) => setForm(prev => ({ ...prev, [field]: val }));

  const handleServiceChange = (val: string) => {
    setSelectedService(val);
    if (val === "__none__") { setSelectedService(""); return; }
    const svc = services.find(s => String(s.id) === val);
    if (svc) {
      setForm(prev => ({ ...prev, description: svc.name, grossAmount: parseFloat(svc.basePrice).toFixed(2) }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const gross = parseFloat(form.grossAmount) || 0;
    const tax = gross * taxRate;
    const net = gross - tax;
    const client = (form.client && form.client !== "__none__") ? form.client : undefined;

    if (editingId !== null) {
      updateMutation.mutate({
        id: editingId,
        description: form.description,
        category: form.category,
        grossAmount: gross.toFixed(2),
        taxAmount: tax.toFixed(2),
        netAmount: net.toFixed(2),
        client: client ?? null,
        dueDate: form.dueDate,
        status: form.status as any,
      });
    } else {
      createMutation.mutate({
        description: form.description,
        category: form.category,
        grossAmount: gross.toFixed(2),
        taxAmount: tax.toFixed(2),
        netAmount: net.toFixed(2),
        client,
        dueDate: form.dueDate,
        status: "pendente",
      });
    }
  };

  const toggleStatus = (item: typeof items[0]) => {
    const next = item.status === "recebido" ? "pendente" : "recebido";
    updateMutation.mutate({
      id: item.id,
      status: next,
      receivedDate: next === "recebido" ? new Date().toISOString().split("T")[0] : null,
    });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
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
          <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Nova Receita</Button>
        </div>
      </div>

      {/* ── Dialog ── */}
      <Dialog open={open} onOpenChange={v => !v && closeDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId !== null ? "Editar Receita" : "Nova Receita"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* Serviço (apenas no cadastro) */}
            {editingId === null && (
              <div className="space-y-1">
                <Label>Serviço</Label>
                <Select value={selectedService} onValueChange={handleServiceChange}>
                  <SelectTrigger><SelectValue placeholder="Selecionar serviço..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sem serviço</SelectItem>
                    {services.filter(s => s.status === "ativo").map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name} — {formatCurrency(s.basePrice)}/{s.unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Descrição */}
            <div className="space-y-1">
              <Label>Descrição</Label>
              <Input value={form.description} onChange={e => set("description", e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Categoria */}
              <div className="space-y-1">
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={v => set("category", v)} required>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* Valor Bruto */}
              <div className="space-y-1">
                <Label>Valor Bruto (R$)</Label>
                <Input type="number" step="0.01" value={form.grossAmount} onChange={e => set("grossAmount", e.target.value)} required />
              </div>

              {/* Cliente */}
              <div className="space-y-1">
                <Label>Cliente</Label>
                <Select value={form.client || "__none__"} onValueChange={v => set("client", v === "__none__" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Selecionar cliente..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sem cliente</SelectItem>
                    {clients.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Data Vencimento */}
              <div className="space-y-1">
                <Label>Data Vencimento</Label>
                <Input type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} required />
              </div>

              {/* Status — só na edição */}
              {editingId !== null && (
                <div className="col-span-2 space-y-1">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => set("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="recebido">Recebido</SelectItem>
                      <SelectItem value="atrasado">Atrasado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Imposto calculado (exibição) */}
            {form.grossAmount && (
              <p className="text-xs text-muted-foreground">
                Imposto ({(taxRate * 100).toFixed(0)}%): {formatCurrency((parseFloat(form.grossAmount) || 0) * taxRate)} →
                Líquido: <span className="font-medium text-foreground">{formatCurrency((parseFloat(form.grossAmount) || 0) * (1 - taxRate))}</span>
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={closeDialog}>Cancelar</Button>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : editingId !== null ? "Salvar alterações" : "Adicionar Receita"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Cards resumo ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground uppercase">Bruto</p><p className="text-xl font-bold mt-1">{formatCurrency(totalGross)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground uppercase">Líquido (após imposto)</p><p className="text-xl font-bold mt-1 text-primary">{formatCurrency(totalNet)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground uppercase">Recebido</p><p className="text-xl font-bold mt-1 text-chart-1">{formatCurrency(totalReceived)}</p></CardContent></Card>
      </div>

      {/* ── Tabela ── */}
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
                <TableHead className="w-[90px]"></TableHead>
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
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate({ id: item.id })}><Trash2 className="h-4 w-4" /></Button>
                    </div>
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
