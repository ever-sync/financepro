import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  dueDate: "",
  billingType: "PIX" as "PIX" | "BOLETO",
};

export default function AsaasCobrancas() {
  const utils = trpc.useUtils();
  const { data: charges = [], isLoading } = trpc.asaasCharges.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const { data: services = [] } = trpc.services.list.useQuery();

  const createMut = trpc.asaasCharges.create.useMutation({
    onSuccess: () => {
      utils.asaasCharges.list.invalidate();
      utils.revenues.list.invalidate();
      toast.success("Cobranca criada no Asaas e vinculada a receita local.");
      setOpen(false);
      setForm(EMPTY);
    },
    onError: error => toast.error(error.message),
  });
  const resendMut = trpc.asaasCharges.resend.useMutation({
    onSuccess: () => {
      utils.asaasCharges.list.invalidate();
      toast.success("Links e status da cobranca atualizados.");
    },
    onError: error => toast.error(error.message),
  });
  const cancelMut = trpc.asaasCharges.cancel.useMutation({
    onSuccess: () => {
      utils.asaasCharges.list.invalidate();
      utils.revenues.list.invalidate();
      toast.success("Cobranca cancelada no Asaas.");
    },
    onError: error => toast.error(error.message),
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const selectedService = services.find(service => String(service.id) === form.serviceId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cobrancas Asaas</h1>
          <p className="text-sm text-muted-foreground">
            Gere cobrancas Pix e boleto, mantendo a receita local sincronizada.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>Nova cobranca</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="pt-6"><p className="text-xs uppercase text-muted-foreground">Total</p><p className="mt-1 text-xl font-bold">{charges.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs uppercase text-muted-foreground">Recebidas</p><p className="mt-1 text-xl font-bold">{charges.filter(item => item.status === "RECEIVED" || item.status === "CONFIRMED").length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs uppercase text-muted-foreground">Valor espelhado</p><p className="mt-1 text-xl font-bold">{formatCurrency(charges.reduce((sum, item) => sum + parseFloat(item.value), 0))}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Espelho local das cobrancas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descricao</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Links</TableHead>
                <TableHead className="w-[160px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Carregando cobrancas...</TableCell></TableRow>
              ) : charges.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Nenhuma cobranca criada ainda.</TableCell></TableRow>
              ) : charges.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-xs text-muted-foreground">{item.asaasChargeId}</p>
                    </div>
                  </TableCell>
                  <TableCell>{item.billingType}</TableCell>
                  <TableCell>{formatCurrency(item.value)}</TableCell>
                  <TableCell>{formatDate(item.dueDate)}</TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs">
                      {item.invoiceUrl ? <a className="text-primary underline" href={item.invoiceUrl} target="_blank" rel="noreferrer">Abrir fatura</a> : null}
                      {item.bankSlipUrl ? <a className="text-primary underline" href={item.bankSlipUrl} target="_blank" rel="noreferrer">Abrir boleto</a> : null}
                      {item.pixCopyAndPaste ? <span className="truncate text-muted-foreground">PIX copiado disponivel</span> : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => resendMut.mutate({ chargeId: item.id })}>
                        Atualizar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => cancelMut.mutate({ chargeId: item.id })}>
                        Cancelar
                      </Button>
                    </div>
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
            <DialogTitle>Nova cobranca Asaas</DialogTitle>
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
                dueDate: form.dueDate,
                billingType: form.billingType,
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
              <Input
                value={form.description}
                onChange={event => setForm(prev => ({ ...prev, description: event.target.value }))}
                placeholder={selectedService?.name || "Descricao da cobranca"}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Valor</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.value}
                  onChange={event => setForm(prev => ({ ...prev, value: event.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Vencimento</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={event => setForm(prev => ({ ...prev, dueDate: event.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select
                  value={form.billingType}
                  onValueChange={value =>
                    setForm(prev => ({ ...prev, billingType: value as "PIX" | "BOLETO" }))
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="BOLETO">Boleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createMut.isPending || !form.clientId || !form.dueDate}>
                {createMut.isPending ? "Criando..." : "Criar cobranca"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
