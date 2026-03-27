import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { toast } from "sonner";

const EMPTY = {
  clientId: "",
  serviceId: "__none__",
  description: "",
  value: "",
  nextDueDate: "",
  billingType: "PIX" as "PIX" | "BOLETO",
  cycle: "MONTHLY" as "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "SEMIANNUALLY" | "YEARLY",
};

export default function AsaasAssinaturas() {
  const utils = trpc.useUtils();
  const { data: subscriptions = [], isLoading } = trpc.asaasSubscriptions.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const { data: services = [] } = trpc.services.list.useQuery();

  const createMut = trpc.asaasSubscriptions.create.useMutation({
    onSuccess: () => {
      utils.asaasSubscriptions.list.invalidate();
      toast.success("Assinatura criada no Asaas.");
      setOpen(false);
      setForm(EMPTY);
    },
    onError: error => toast.error(error.message),
  });
  const cancelMut = trpc.asaasSubscriptions.cancel.useMutation({
    onSuccess: () => {
      utils.asaasSubscriptions.list.invalidate();
      toast.success("Assinatura cancelada.");
    },
    onError: error => toast.error(error.message),
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assinaturas Asaas</h1>
          <p className="text-sm text-muted-foreground">
            Configure recorrencias operacionais no Asaas com base no seu catalogo local.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>Nova assinatura</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="pt-6"><p className="text-xs uppercase text-muted-foreground">Total</p><p className="mt-1 text-xl font-bold">{subscriptions.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs uppercase text-muted-foreground">Ativas</p><p className="mt-1 text-xl font-bold">{subscriptions.filter(item => item.status === "ACTIVE").length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs uppercase text-muted-foreground">Carteira</p><p className="mt-1 text-xl font-bold">{formatCurrency(subscriptions.reduce((sum, item) => sum + parseFloat(item.value), 0))}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descricao</TableHead>
                <TableHead>Ciclo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Proximo vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Carregando assinaturas...</TableCell></TableRow>
              ) : subscriptions.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Nenhuma assinatura cadastrada.</TableCell></TableRow>
              ) : subscriptions.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-xs text-muted-foreground">{item.asaasSubscriptionId}</p>
                    </div>
                  </TableCell>
                  <TableCell>{item.cycle}</TableCell>
                  <TableCell>{item.billingType}</TableCell>
                  <TableCell>{formatCurrency(item.value)}</TableCell>
                  <TableCell>{formatDate(item.nextDueDate)}</TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => cancelMut.mutate({ subscriptionId: item.id })}>
                      Cancelar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova assinatura</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={event => {
              event.preventDefault();
              createMut.mutate({
                clientId: Number(form.clientId),
                serviceId: form.serviceId !== "__none__" ? Number(form.serviceId) : undefined,
                description: form.description || undefined,
                value: form.value || undefined,
                nextDueDate: form.nextDueDate,
                billingType: form.billingType,
                cycle: form.cycle,
              });
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Cliente</Label>
                <Select value={form.clientId} onValueChange={value => setForm(prev => ({ ...prev, clientId: value }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={String(client.id)}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Servico</Label>
                <Select
                  value={form.serviceId}
                  onValueChange={value => {
                    const service = services.find(item => String(item.id) === value);
                    setForm(prev => ({
                      ...prev,
                      serviceId: value,
                      description: prev.description || service?.name || "",
                      value: prev.value || (service ? parseFloat(service.basePrice).toFixed(2) : ""),
                    }));
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sem servico vinculado</SelectItem>
                    {services.map(service => (
                      <SelectItem key={service.id} value={String(service.id)}>{service.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Descricao</Label>
              <Input value={form.description} onChange={event => setForm(prev => ({ ...prev, description: event.target.value }))} />
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-1.5">
                <Label>Valor</Label>
                <Input type="number" step="0.01" value={form.value} onChange={event => setForm(prev => ({ ...prev, value: event.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Primeiro vencimento</Label>
                <Input type="date" value={form.nextDueDate} onChange={event => setForm(prev => ({ ...prev, nextDueDate: event.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={form.billingType} onValueChange={value => setForm(prev => ({ ...prev, billingType: value as "PIX" | "BOLETO" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="BOLETO">Boleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Ciclo</Label>
                <Select value={form.cycle} onValueChange={value => setForm(prev => ({ ...prev, cycle: value as typeof form.cycle }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEEKLY">Semanal</SelectItem>
                    <SelectItem value="BIWEEKLY">Quinzenal</SelectItem>
                    <SelectItem value="MONTHLY">Mensal</SelectItem>
                    <SelectItem value="QUARTERLY">Trimestral</SelectItem>
                    <SelectItem value="SEMIANNUALLY">Semestral</SelectItem>
                    <SelectItem value="YEARLY">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createMut.isPending || !form.clientId || !form.nextDueDate}>
                {createMut.isPending ? "Criando..." : "Criar assinatura"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
