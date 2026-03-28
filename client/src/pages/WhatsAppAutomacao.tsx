import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/format";

export default function WhatsAppAutomacao() {
  const { data: events, isLoading } = trpc.assistantAutomation.list.useQuery();
  const { data: dailyDigest } = trpc.financialAdvisor.getDailyDigest.useQuery();
  const { data: monthClose } = trpc.financialAdvisor.getMonthClose.useQuery();

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando automacoes...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Automacao</h1>
        <p className="text-sm text-muted-foreground">
          Monitoramento dos resumos diarios, alertas imediatos e rotinas de inicio e fim de mes.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prévia do digest diário</CardTitle>
            <CardDescription>Mensagem base das 08:00 com limite seguro e prioridades do dia.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border p-4">
              <p className="text-sm text-muted-foreground">Gasto seguro hoje</p>
              <p className="mt-1 text-2xl font-semibold">{formatCurrency(dailyDigest?.snapshot.safeToSpendNow || 0)}</p>
              <p className="mt-3 text-sm text-muted-foreground">{dailyDigest?.message || "Sem prévia disponível."}</p>
            </div>
            {dailyDigest?.alerts?.length ? dailyDigest.alerts.map(alert => (
              <div key={alert} className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                {alert}
              </div>
            )) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prévia do fechamento do mês</CardTitle>
            <CardDescription>Resumo gerencial que fecha o ciclo e direciona o próximo mês.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border p-4">
              <p className="text-sm text-muted-foreground">Desvio contra o plano</p>
              <p className="mt-1 text-2xl font-semibold">{formatCurrency(monthClose?.deviation || 0)}</p>
              <p className="mt-3 text-sm text-muted-foreground">{monthClose?.message || "Sem fechamento calculado."}</p>
            </div>
            {monthClose?.excessSignals?.length ? monthClose.excessSignals.map(signal => (
              <div key={signal} className="rounded-2xl border px-4 py-3 text-sm text-muted-foreground">
                {signal}
              </div>
            )) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eventos automatizados</CardTitle>
          <CardDescription>Os crons usam os endpoints server-side do deploy atual.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {events?.length ? events.map(event => (
            <div key={event.id} className="rounded-2xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground">{event.messageBody}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-400">
                    {event.type} · {event.scope}
                  </p>
                </div>
                <StatusBadge status={event.status} />
              </div>
            </div>
          )) : <p className="text-sm text-muted-foreground">Nenhum evento automatizado registrado ainda.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
