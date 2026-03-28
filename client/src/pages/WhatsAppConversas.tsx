import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";

export default function WhatsAppConversas() {
  const { data, isLoading } = trpc.assistantInbox.list.useQuery();

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando conversas...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Conversas</h1>
        <p className="text-sm text-muted-foreground">Entrada do assistente, mensagens recentes e confirmacoes pendentes.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Threads</CardTitle>
            <CardDescription>Conversas ativas do numero autorizado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.threads.length ? data.threads.map(thread => (
              <div key={thread.id} className="rounded-2xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">Thread #{thread.id}</p>
                    <p className="text-sm text-muted-foreground">
                      Ultima mensagem: {thread.latestMessage?.textContent || "Sem mensagens"}
                    </p>
                  </div>
                  <StatusBadge status={thread.pendingRun?.status || "ativo"} />
                </div>
              </div>
            )) : <p className="text-sm text-muted-foreground">Nenhuma conversa registrada ainda.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mensagens recentes</CardTitle>
            <CardDescription>Historico salvo do webhook e das respostas enviadas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.messages.slice(0, 20).map(message => (
              <div key={message.id} className="rounded-2xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">
                    {message.direction === "inbound" ? "Recebida" : "Enviada"}
                  </div>
                  <StatusBadge status={message.status} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{message.textContent}</p>
                {message.detectedIntent ? (
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-400">{message.detectedIntent}</p>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

