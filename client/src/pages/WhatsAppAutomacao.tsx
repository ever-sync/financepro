import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";

export default function WhatsAppAutomacao() {
  const { data: events, isLoading } = trpc.assistantAutomation.list.useQuery();

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

