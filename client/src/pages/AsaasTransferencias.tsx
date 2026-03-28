import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AsaasTransferencias() {
  const { data: transfers = [], isLoading } = trpc.asaasTransfers.list.useQuery();

  const totalValue = transfers.reduce((sum, item) => sum + parseFloat(item.value), 0);
  const completedTransfers = transfers.filter(item =>
    ["DONE", "COMPLETED", "CONFIRMED"].includes(String(item.status).toUpperCase())
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transferencias Asaas</h1>
        <p className="text-sm text-muted-foreground">
          Espelho local das transferencias existentes no Asaas. Esta tela e somente leitura.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="pt-6"><p className="text-xs uppercase text-muted-foreground">Total</p><p className="mt-1 text-xl font-bold">{transfers.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs uppercase text-muted-foreground">Concluidas</p><p className="mt-1 text-xl font-bold">{completedTransfers}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs uppercase text-muted-foreground">Valor movimentado</p><p className="mt-1 text-xl font-bold">{formatCurrency(totalValue)}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historico importado</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transferencia</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Carregando transferencias...</TableCell></TableRow>
              ) : transfers.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Nenhuma transferencia importada ainda.</TableCell></TableRow>
              ) : transfers.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.asaasTransferId}</p>
                      <p className="text-xs text-muted-foreground">{item.operationType || item.transferType || "-"}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{item.recipientName || "-"}</p>
                      <p className="text-xs text-muted-foreground">{item.bankName || "-"}</p>
                    </div>
                  </TableCell>
                  <TableCell>{item.transferType || "-"}</TableCell>
                  <TableCell>{formatDate(item.effectiveDate || item.transferDate || item.scheduledDate)}</TableCell>
                  <TableCell>
                    <div>
                      <p>{formatCurrency(item.value)}</p>
                      {item.netValue ? (
                        <p className="text-xs text-muted-foreground">Liquido {formatCurrency(item.netValue)}</p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
