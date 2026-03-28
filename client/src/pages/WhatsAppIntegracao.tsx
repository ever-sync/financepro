import { useEffect, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";

export default function WhatsAppIntegracao() {
  const utils = trpc.useUtils();
  const { data: integration, isLoading } = trpc.whatsappIntegration.get.useQuery();
  const { data: status } = trpc.whatsappIntegration.syncStatus.useQuery();
  const saveMut = trpc.whatsappIntegration.upsert.useMutation({
    onSuccess: async () => {
      await utils.whatsappIntegration.get.invalidate();
      await utils.whatsappIntegration.syncStatus.invalidate();
      toast.success("Integracao do WhatsApp salva.");
    },
    onError: error => toast.error(error.message),
  });
  const testMut = trpc.whatsappIntegration.testConnection.useMutation({
    onSuccess: async data => {
      await utils.whatsappIntegration.get.invalidate();
      await utils.whatsappIntegration.syncStatus.invalidate();
      toast.success(data.message);
    },
    onError: error => toast.error(error.message),
  });
  const sendTestMut = trpc.whatsappIntegration.sendTestMessage.useMutation({
    onSuccess: () => toast.success("Mensagem de teste enviada."),
    onError: error => toast.error(error.message),
  });
  const canSendTest = Boolean(integration?.authorizedPhone) && integration?.lastConnectionStatus === "sincronizado";

  const [form, setForm] = useState({
    instanceId: "",
    apiBaseUrl: "https://api.uazapi.com",
    apiToken: "",
    authorizedPhone: "",
    enabled: true,
    automationHour: 8,
    timezone: "America/Sao_Paulo",
  });

  useEffect(() => {
    if (!integration) return;
    setForm(prev => ({
      ...prev,
      instanceId: integration.instanceId || "",
      apiBaseUrl: integration.apiBaseUrl || "https://api.uazapi.com",
      authorizedPhone: integration.authorizedPhone || "",
      enabled: integration.enabled ?? true,
      automationHour: integration.automationHour ?? 8,
      timezone: integration.timezone || "America/Sao_Paulo",
      apiToken: "",
    }));
  }, [integration]);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando integracao do WhatsApp...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">WhatsApp IA</h1>
          <p className="text-sm text-muted-foreground">
            Conecte a Uazapi, defina seu numero autorizado e ative a rotina diaria das 08:00.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() =>
              testMut.mutate({
                instanceId: form.instanceId,
                apiBaseUrl: form.apiBaseUrl,
                apiToken: form.apiToken || undefined,
              })
            }
            disabled={testMut.isPending || !form.instanceId || !form.apiBaseUrl}
          >
            {testMut.isPending ? "Testando..." : "Testar conexao"}
          </Button>
          <Button
            variant="outline"
            onClick={() => sendTestMut.mutate()}
            disabled={sendTestMut.isPending || !canSendTest}
          >
            {sendTestMut.isPending ? "Enviando..." : "Enviar teste"}
          </Button>
          <Button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending}>
            {saveMut.isPending ? "Salvando..." : "Salvar integracao"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Configuracao Uazapi</CardTitle>
            <CardDescription>
              Os segredos ficam no backend. Use o token da instancia da Uazapi, nao o admintoken. Deixe o token em branco para manter o atual.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Instance ID</Label>
              <Input value={form.instanceId} onChange={event => setForm(prev => ({ ...prev, instanceId: event.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>API base URL</Label>
              <Input value={form.apiBaseUrl} onChange={event => setForm(prev => ({ ...prev, apiBaseUrl: event.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Token da instancia</Label>
              <Input
                type="password"
                placeholder={integration?.maskedApiToken || "Cole aqui o token da instancia da Uazapi"}
                value={form.apiToken}
                onChange={event => setForm(prev => ({ ...prev, apiToken: event.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Numero autorizado</Label>
              <Input
                placeholder="5511999999999"
                value={form.authorizedPhone}
                onChange={event => setForm(prev => ({ ...prev, authorizedPhone: event.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Hora da automacao</Label>
              <Input
                type="number"
                min={0}
                max={23}
                value={form.automationHour}
                onChange={event => setForm(prev => ({ ...prev, automationHour: Number(event.target.value || 8) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Timezone</Label>
              <Input value={form.timezone} onChange={event => setForm(prev => ({ ...prev, timezone: event.target.value }))} />
            </div>
            <div className="md:col-span-2 flex items-center gap-3 rounded-2xl border px-4 py-3">
              <input
                id="whatsapp-enabled"
                type="checkbox"
                checked={form.enabled}
                onChange={event => setForm(prev => ({ ...prev, enabled: event.target.checked }))}
              />
              <Label htmlFor="whatsapp-enabled" className="cursor-pointer">
                Assistente habilitado
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status da sessao</CardTitle>
              <CardDescription>Saude da conexao, webhook e fila do assistente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Conexao</span>
                <StatusBadge status={integration?.lastConnectionStatus || "pendente"} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border p-3">
                  <p className="text-muted-foreground">Threads</p>
                  <p className="mt-1 text-xl font-semibold">{status?.totals.threads || 0}</p>
                </div>
                <div className="rounded-2xl border p-3">
                  <p className="text-muted-foreground">Mensagens</p>
                  <p className="mt-1 text-xl font-semibold">{status?.totals.messages || 0}</p>
                </div>
                <div className="rounded-2xl border p-3">
                  <p className="text-muted-foreground">Confirmacoes pendentes</p>
                  <p className="mt-1 text-xl font-semibold">{status?.totals.pendingConfirmations || 0}</p>
                </div>
                <div className="rounded-2xl border p-3">
                  <p className="text-muted-foreground">Alertas</p>
                  <p className="mt-1 text-xl font-semibold">{status?.totals.notifications || 0}</p>
                </div>
              </div>
              <div className="space-y-2 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
                <p>Webhook: {integration?.webhookUrl || "-"}</p>
                <p>Ultimo retorno da Uazapi: {integration?.lastConnectionMessage || "-"}</p>
                <p>Ultima mensagem recebida: {integration?.lastMessageReceivedAt ? new Date(integration.lastMessageReceivedAt).toLocaleString("pt-BR") : "-"}</p>
                <p>Ultima mensagem enviada: {integration?.lastMessageSentAt ? new Date(integration.lastMessageSentAt).toLocaleString("pt-BR") : "-"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
