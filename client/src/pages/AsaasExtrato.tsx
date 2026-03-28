import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AsaasExtrato() {
  const { data: entries = [], isLoading } = trpc.asaasFinancialTransactions.list.useQuery();
  const { data: status } = trpc.asaasIntegration.syncStatus.useQuery();

  const totalIn = entries
    .filter(item => parseFloat(item.value) >= 0)
    .reduce((sum, item) => sum + parseFloat(item.value), 0);
  const totalOut = entries
    .filter(item => parseFloat(item.value) < 0)
    .reduce((sum, item) => sum + Math.abs(parseFloat(item.value)), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Extrato Asaas</h1>
        <p className="text-sm text-muted-foreground">
          Lancamentos financeiros importados do extrato da conta Asaas.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-xs uppercase text-muted-foreground">Lancamentos</p><p className="mt-1 text-xl font-bold">{entries.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs uppercase text-muted-foreground">Entradas</p><p className="mt-1 text-xl font-bold">{formatCurrency(totalIn)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs uppercase text-muted-foreground">Saidas</p><p className="mt-1 text-xl font-bold">{formatCurrency(totalOut)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs uppercase text-muted-foreground">Saldo atual</p><p className="mt-1 text-xl font-bold">{status?.totals.currentBalance ? formatCurrency(status.totals.currentBalance) : "-"}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Extrato importado</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descricao</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Referencias</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Carregando extrato...</TableCell></TableRow>
              ) : entries.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Nenhum lancamento importado ainda.</TableCell></TableRow>
              ) : entries.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{formatDate(item.transactionDate || item.effectiveDate)}</TableCell>
                  <TableCell className="max-w-[320px]">
                    <div>
                      <p className="font-medium">{item.description || "-"}</p>
                      <p className="text-xs text-muted-foreground">{item.asaasTransactionId}</p>
                    </div>
                  </TableCell>
                  <TableCell>{item.transactionType || item.entryType || "-"}</TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground">
                      <p>{item.asaasChargeId ? `Cobranca: ${item.asaasChargeId}` : "-"}</p>
                      <p>{item.asaasTransferId ? `Transferencia: ${item.asaasTransferId}` : "-"}</p>
                    </div>
                  </TableCell>
                  <TableCell className={parseFloat(item.value) < 0 ? "text-rose-600" : "text-emerald-600"}>
                    {formatCurrency(item.value)}
                  </TableCell>
                  <TableCell>{item.balance ? formatCurrency(item.balance) : "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
