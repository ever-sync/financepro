import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";

export default function WhatsAppAuditoria() {
  const { data: runs, isLoading } = trpc.assistantAudit.list.useQuery();

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando auditoria...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Auditoria</h1>
        <p className="text-sm text-muted-foreground">
          Trilhas das execucoes da IA com contexto, intencao detectada e status final.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Execucoes do assistente</CardTitle>
          <CardDescription>Recebido, analisado, aguardando confirmacao, executado ou falhou.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {runs?.length ? runs.map(run => (
            <div key={run.id} className="rounded-2xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{run.normalizedIntent || "sem intencao"}</p>
                  <p className="text-sm text-muted-foreground">{run.assistantResponse || run.userMessage || "-"}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-400">{run.triggerType}</p>
                </div>
                <StatusBadge status={run.status} />
              </div>
            </div>
          )) : <p className="text-sm text-muted-foreground">Nenhuma execucao registrada ainda.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
