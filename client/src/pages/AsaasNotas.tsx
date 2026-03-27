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
  chargeId: "",
  serviceDescription: "",
  value: "",
  effectiveDate: "",
  observations: "",
  municipalServiceId: "",
  municipalServiceCode: "",
  municipalServiceName: "",
};

export default function AsaasNotas() {
  const utils = trpc.useUtils();
  const { data: invoices = [], isLoading } = trpc.asaasInvoices.list.useQuery();
  const { data: charges = [] } = trpc.asaasCharges.list.useQuery();

  const issueMut = trpc.asaasInvoices.issue.useMutation({
    onSuccess: () => {
      utils.asaasInvoices.list.invalidate();
      toast.success("NFSe enviada para o fluxo do Asaas.");
      setOpen(false);
      setForm(EMPTY);
    },
    onError: error => toast.error(error.message),
  });
  const resendMut = trpc.asaasInvoices.resend.useMutation({
    onSuccess: () => {
      utils.asaasInvoices.list.invalidate();
      toast.success("Status da nota fiscal atualizado.");
    },
    onError: error => toast.error(error.message),
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const eligibleCharges = charges.filter(item => item.status === "RECEIVED" || item.status === "CONFIRMED");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notas fiscais Asaas</h1>
          <p className="text-sm text-muted-foreground">
            Emita NFSe vinculada a cobrancas elegiveis e acompanhe o espelho local.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>Emitir NFSe</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Espelho de notas fiscais</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NFSe</TableHead>
                <TableHead>Descricao</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data efetiva</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Arquivos</TableHead>
                <TableHead className="w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Carregando notas...</TableCell></TableRow>
              ) : invoices.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Nenhuma NFSe espelhada ainda.</TableCell></TableRow>
              ) : invoices.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.invoiceNumber || "Sem numero"}</p>
                      <p className="text-xs text-muted-foreground">{item.asaasInvoiceId}</p>
                    </div>
                  </TableCell>
                  <TableCell>{item.serviceDescription || "-"}</TableCell>
                  <TableCell>{item.value ? formatCurrency(item.value) : "-"}</TableCell>
                  <TableCell>{item.effectiveDate ? formatDate(item.effectiveDate) : "-"}</TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs">
                      {item.pdfUrl ? <a className="text-primary underline" href={item.pdfUrl} target="_blank" rel="noreferrer">PDF</a> : null}
                      {item.xmlUrl ? <a className="text-primary underline" href={item.xmlUrl} target="_blank" rel="noreferrer">XML</a> : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => resendMut.mutate({ invoiceId: item.id })}>
                      Atualizar
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
            <DialogTitle>Emitir NFSe</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={event => {
              event.preventDefault();
              issueMut.mutate({
                chargeId: Number(form.chargeId),
                serviceDescription: form.serviceDescription,
                value: form.value,
                effectiveDate: form.effectiveDate || undefined,
                observations: form.observations || undefined,
                municipalServiceId: form.municipalServiceId || undefined,
                municipalServiceCode: form.municipalServiceCode || undefined,
                municipalServiceName: form.municipalServiceName || undefined,
              });
            }}
          >
            <div className="space-y-1.5">
              <Label>Cobranca paga</Label>
              <Select
                value={form.chargeId}
                onValueChange={value => {
                  const charge = eligibleCharges.find(item => String(item.id) === value);
                  setForm(prev => ({
                    ...prev,
                    chargeId: value,
                    serviceDescription: prev.serviceDescription || charge?.description || "",
                    value: prev.value || charge?.value || "",
                    effectiveDate: prev.effectiveDate || charge?.dueDate || "",
                  }));
                }}
              >
                <SelectTrigger><SelectValue placeholder="Selecione uma cobranca recebida" /></SelectTrigger>
                <SelectContent>
                  {eligibleCharges.map(charge => (
                    <SelectItem key={charge.id} value={String(charge.id)}>
                      {charge.description} - {formatCurrency(charge.value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Descricao do servico</Label>
                <Input value={form.serviceDescription} onChange={event => setForm(prev => ({ ...prev, serviceDescription: event.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Valor</Label>
                <Input type="number" step="0.01" value={form.value} onChange={event => setForm(prev => ({ ...prev, value: event.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Data efetiva</Label>
                <Input type="date" value={form.effectiveDate} onChange={event => setForm(prev => ({ ...prev, effectiveDate: event.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Servico municipal ID</Label>
                <Input value={form.municipalServiceId} onChange={event => setForm(prev => ({ ...prev, municipalServiceId: event.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Codigo do servico</Label>
                <Input value={form.municipalServiceCode} onChange={event => setForm(prev => ({ ...prev, municipalServiceCode: event.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Nome do servico municipal</Label>
                <Input value={form.municipalServiceName} onChange={event => setForm(prev => ({ ...prev, municipalServiceName: event.target.value }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Observacoes</Label>
              <textarea
                className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.observations}
                onChange={event => setForm(prev => ({ ...prev, observations: event.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={issueMut.isPending || !form.chargeId || !form.serviceDescription || !form.value}>
                {issueMut.isPending ? "Emitindo..." : "Emitir NFSe"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
