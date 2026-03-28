import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AsaasIntegracao() {
  const utils = trpc.useUtils();
  const { data: integration, isLoading } = trpc.asaasIntegration.get.useQuery();
  const { data: status } = trpc.asaasIntegration.syncStatus.useQuery();
  const saveMut = trpc.asaasIntegration.upsert.useMutation({
    onSuccess: () => {
      utils.asaasIntegration.get.invalidate();
      utils.asaasIntegration.syncStatus.invalidate();
      toast.success("Integracao Asaas salva.");
    },
  });
  const testMut = trpc.asaasIntegration.testConnection.useMutation({
    onSuccess: data => {
      utils.asaasIntegration.get.invalidate();
      utils.asaasIntegration.syncStatus.invalidate();
      toast.success(data.message);
    },
    onError: error => toast.error(error.message),
  });
  const syncAllMut = trpc.asaasCustomers.syncAll.useMutation({
    onSuccess: data => {
      utils.asaasIntegration.syncStatus.invalidate();
      utils.clients.list.invalidate();
      toast.success(`${data.length} clientes sincronizados com o Asaas.`);
    },
    onError: error => toast.error(error.message),
  });
  const syncChargeMut = trpc.asaasCharges.syncOne.useMutation({
    onSuccess: () => {
      utils.asaasCharges.list.invalidate();
      utils.asaasEvents.list.invalidate();
      toast.success("Cobranca sincronizada com sucesso.");
    },
    onError: error => toast.error(error.message),
  });
  const importHistoryMut = trpc.asaasIntegration.importHistory.useMutation({
    onSuccess: data => {
      utils.asaasIntegration.syncStatus.invalidate();
      utils.asaasCharges.list.invalidate();
      utils.asaasSubscriptions.list.invalidate();
      utils.asaasInvoices.list.invalidate();
      utils.asaasTransfers.list.invalidate();
      utils.asaasFinancialTransactions.list.invalidate();
      utils.asaasEvents.list.invalidate();
      utils.revenues.list.invalidate();
      toast.success(
        `Importacao concluida: ${data.charges} cobrancas, ${data.subscriptions} assinaturas, ${data.invoices} notas, ${data.transfers} transferencias e ${data.financialTransactions} lancamentos.`
      );
    },
    onError: error => toast.error(error.message),
  });

  const [form, setForm] = useState({
    accountName: "Conta principal",
    environment: "sandbox" as "sandbox" | "production",
    apiKey: "",
    webhookAuthToken: "",
    enabled: true,
  });
  const [manualChargeId, setManualChargeId] = useState("");

  useEffect(() => {
    if (!integration) return;
    setForm(prev => ({
      ...prev,
      accountName: integration.accountName || "Conta principal",
      environment: integration.environment || "sandbox",
      apiKey: "",
      webhookAuthToken: "",
      enabled: integration.enabled ?? true,
    }));
  }, [integration]);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando integracao do Asaas...</div>;
  }

  const runImport = (scope?: {
    charges?: boolean;
    subscriptions?: boolean;
    invoices?: boolean;
    transfers?: boolean;
    financialTransactions?: boolean;
  }) => importHistoryMut.mutate(scope);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Integracao Asaas</h1>
          <p className="text-sm text-muted-foreground">
            Configure a conta operacional do Asaas para cobrancas, assinaturas, NFSe e webhooks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => testMut.mutate()} disabled={testMut.isPending}>
            {testMut.isPending ? "Testando..." : "Testar conexao"}
          </Button>
          <Button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending}>
            {saveMut.isPending ? "Salvando..." : "Salvar integracao"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Conta Asaas</CardTitle>
            <CardDescription>
              A chave fica vinculada ao painel do sistema e o webhook usa o endpoint abaixo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Nome da conta</Label>
                <Input
                  value={form.accountName}
                  onChange={event => setForm(prev => ({ ...prev, accountName: event.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Ambiente</Label>
                <Select
                  value={form.environment}
                  onValueChange={value =>
                    setForm(prev => ({ ...prev, environment: value as "sandbox" | "production" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox</SelectItem>
                    <SelectItem value="production">Producao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>API Key</Label>
              <Input
                type="password"
                placeholder={integration?.maskedApiKey || "Cole aqui a API Key do Asaas"}
                value={form.apiKey}
                onChange={event => setForm(prev => ({ ...prev, apiKey: event.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Deixe em branco para manter a chave atual salva no banco.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Token de autenticacao do webhook</Label>
              <Input
                type="password"
                placeholder={integration?.maskedWebhookAuthToken || "Cole aqui o token do webhook"}
                value={form.webhookAuthToken}
                onChange={event =>
                  setForm(prev => ({ ...prev, webhookAuthToken: event.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Deixe em branco para manter o token atual salvo no servidor.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Webhook URL</Label>
              <Input value={integration?.webhookUrl || ""} readOnly />
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 px-4 py-3">
              <input
                id="asaas-enabled"
                type="checkbox"
                checked={form.enabled}
                onChange={event => setForm(prev => ({ ...prev, enabled: event.target.checked }))}
              />
              <Label htmlFor="asaas-enabled" className="cursor-pointer">
                Integracao habilitada
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status atual</CardTitle>
              <CardDescription>Resumo da conexao e do espelho local.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Conexao</span>
                <StatusBadge status={integration?.lastConnectionStatus || "pendente"} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Token do webhook</span>
                <StatusBadge status={integration?.hasWebhookAuthToken ? "sincronizado" : "pendente"} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border p-3">
                  <p className="text-muted-foreground">Clientes sincronizados</p>
                  <p className="mt-1 text-xl font-semibold">
                    {status?.totals.clientsSynced || 0}/{status?.totals.clients || 0}
                  </p>
                </div>
                <div className="rounded-2xl border p-3">
                  <p className="text-muted-foreground">Cobrancas</p>
                  <p className="mt-1 text-xl font-semibold">{status?.totals.charges || 0}</p>
                </div>
                <div className="rounded-2xl border p-3">
                  <p className="text-muted-foreground">Assinaturas</p>
                  <p className="mt-1 text-xl font-semibold">{status?.totals.subscriptions || 0}</p>
                </div>
                <div className="rounded-2xl border p-3">
                  <p className="text-muted-foreground">Eventos</p>
                  <p className="mt-1 text-xl font-semibold">{status?.totals.events || 0}</p>
                </div>
                <div className="rounded-2xl border p-3">
                  <p className="text-muted-foreground">Transferencias</p>
                  <p className="mt-1 text-xl font-semibold">{status?.totals.transfers || 0}</p>
                </div>
                <div className="rounded-2xl border p-3">
                  <p className="text-muted-foreground">Extrato</p>
                  <p className="mt-1 text-xl font-semibold">
                    {status?.totals.financialTransactions || 0}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border p-3 text-sm">
                <p className="text-muted-foreground">Saldo atual da conta</p>
                <p className="mt-1 text-xl font-semibold">
                  {status?.totals.currentBalance
                    ? formatCurrency(status.totals.currentBalance)
                    : "-"}
                </p>
              </div>
              {integration?.lastConnectionMessage ? (
                <p className="rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                  {integration.lastConnectionMessage}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acoes manuais</CardTitle>
              <CardDescription>Suporte rapido para sincronizacao e auditoria.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => syncAllMut.mutate()}
                disabled={syncAllMut.isPending}
              >
                {syncAllMut.isPending ? "Sincronizando..." : "Sincronizar todos os clientes"}
              </Button>
              <div className="space-y-2">
                <Label>Sincronizar cobranca por ID externo</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="pay_xxxxx"
                    value={manualChargeId}
                    onChange={event => setManualChargeId(event.target.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={() => syncChargeMut.mutate({ asaasChargeId: manualChargeId })}
                    disabled={syncChargeMut.isPending || !manualChargeId}
                  >
                    Sincronizar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Importacao inicial</CardTitle>
              <CardDescription>
                Puxa o historico ja existente no Asaas para o espelho local do FinancePRO.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={() => runImport()}
                disabled={importHistoryMut.isPending}
              >
                {importHistoryMut.isPending ? "Importando..." : "Importar historico completo"}
              </Button>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  variant="outline"
                  onClick={() => runImport({ charges: true, subscriptions: false, invoices: false, transfers: false, financialTransactions: false })}
                  disabled={importHistoryMut.isPending}
                >
                  Importar cobrancas
                </Button>
                <Button
                  variant="outline"
                  onClick={() => runImport({ charges: false, subscriptions: true, invoices: false, transfers: false, financialTransactions: false })}
                  disabled={importHistoryMut.isPending}
                >
                  Importar assinaturas
                </Button>
                <Button
                  variant="outline"
                  onClick={() => runImport({ charges: false, subscriptions: false, invoices: true, transfers: false, financialTransactions: false })}
                  disabled={importHistoryMut.isPending}
                >
                  Importar notas
                </Button>
                <Button
                  variant="outline"
                  onClick={() => runImport({ charges: false, subscriptions: false, invoices: false, transfers: true, financialTransactions: false })}
                  disabled={importHistoryMut.isPending}
                >
                  Importar transferencias
                </Button>
                <Button
                  variant="outline"
                  className="sm:col-span-2"
                  onClick={() => runImport({ charges: false, subscriptions: false, invoices: false, transfers: false, financialTransactions: true })}
                  disabled={importHistoryMut.isPending}
                >
                  Importar extrato
                </Button>
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                Eventos antigos do Asaas nao possuem importacao historica dedicada no app. A trilha
                de eventos continua sendo alimentada pelo webhook a partir da ativacao.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
