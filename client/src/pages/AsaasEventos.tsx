import { trpc } from "@/lib/trpc";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export default function AsaasEventos() {
  const utils = trpc.useUtils();
  const { data: events = [], isLoading } = trpc.asaasEvents.list.useQuery();
  const reprocessMut = trpc.asaasEvents.reprocess.useMutation({
    onSuccess: () => {
      utils.asaasEvents.list.invalidate();
      utils.asaasCharges.list.invalidate();
      utils.asaasInvoices.list.invalidate();
      toast.success("Evento reprocessado com sucesso.");
    },
    onError: error => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Eventos do Asaas</h1>
        <p className="text-sm text-muted-foreground">
          Trilha de auditoria do webhook com idempotencia e reprocessamento manual.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fila de eventos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Processado em</TableHead>
                <TableHead>Erro</TableHead>
                <TableHead className="w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Carregando eventos...</TableCell></TableRow>
              ) : events.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Nenhum evento recebido ainda.</TableCell></TableRow>
              ) : events.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.eventType}</p>
                      <p className="text-xs text-muted-foreground">{item.eventFingerprint.slice(0, 16)}...</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{item.resourceType || "-"}</p>
                      <p className="text-xs text-muted-foreground">{item.resourceId || "-"}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.processed ? "sincronizado" : item.lastError ? "erro" : "pendente"} />
                  </TableCell>
                  <TableCell>
                    {item.processedAt
                      ? formatDate(new Date(item.processedAt).toISOString().slice(0, 10))
                      : "-"}
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate text-xs text-muted-foreground">
                    {item.lastError || "-"}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => reprocessMut.mutate({ eventId: item.id })}>
                      Reprocessar
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
