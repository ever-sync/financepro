import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/format";
import { PiggyBank, ShieldCheck, Wallet } from "lucide-react";

export default function WhatsAppPlanos() {
  const utils = trpc.useUtils();
  const { data: snapshot } = trpc.financialAdvisor.getSnapshot.useQuery();
  const { data: currentPlan } = trpc.assistantPlans.getCurrent.useQuery();
  const { data: plans, isLoading } = trpc.assistantPlans.list.useQuery();
  const generateMut = trpc.financialAdvisor.generateMonthlyPlan.useMutation({
    onSuccess: async () => {
      await utils.assistantPlans.getCurrent.invalidate();
      await utils.assistantPlans.list.invalidate();
      await utils.financialAdvisor.getSnapshot.invalidate();
      toast.success("Plano mensal regenerado com os dados mais recentes.");
    },
    onError: error => toast.error(error.message),
  });
  const confirmMut = trpc.financialAdvisor.confirmAction.useMutation({
    onSuccess: async () => {
      await utils.assistantPlans.getCurrent.invalidate();
      await utils.assistantPlans.list.invalidate();
      await utils.financialAdvisor.getSnapshot.invalidate();
      toast.success("Acao do plano marcada como concluida.");
    },
    onError: error => toast.error(error.message),
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando planos mensais...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Planos mensais</h1>
          <p className="text-sm text-muted-foreground">
            Metas do mes, acoes recomendadas pela IA e progresso de execucao.
          </p>
        </div>
        <Button onClick={() => generateMut.mutate()} disabled={generateMut.isPending}>
          {generateMut.isPending ? "Gerando..." : "Gerar plano agora"}
        </Button>
      </div>

      {snapshot ? (
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Gasto seguro hoje</CardDescription>
              <CardTitle className="text-xl">{formatCurrency(snapshot.safeToSpendNow)}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Limite diário sem apertar o restante do mês.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Gasto seguro no mês</CardDescription>
              <CardTitle className="text-xl">{formatCurrency(snapshot.safeToSpendMonth)}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Espaço disponível após reservas e proteções.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Caixa protegido</CardDescription>
              <CardTitle className="text-xl">{formatCurrency(snapshot.protectedCash)}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Impostos, caixa mínimo e valores que não deveriam ser tocados.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Risco do caixa</CardDescription>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl capitalize">{snapshot.cashRiskLevel}</CardTitle>
                <StatusBadge status={snapshot.cashRiskLevel} />
              </div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {snapshot.summary}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {currentPlan ? (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Plano vigente</CardTitle>
                <CardDescription>{currentPlan.periodMonth}/{currentPlan.periodYear}</CardDescription>
              </div>
              <Button onClick={() => generateMut.mutate()} disabled={generateMut.isPending}>
                {generateMut.isPending ? "Atualizando..." : "Atualizar plano"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-muted p-4">
              <p className="font-medium">{currentPlan.summary}</p>
              {currentPlan.recommendedCashAction ? (
                <p className="mt-2 text-sm text-muted-foreground">{currentPlan.recommendedCashAction}</p>
              ) : null}
            </div>
            {snapshot ? (
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Reserva empresa</p>
                  <div className="mt-2 flex items-center gap-2">
                    <PiggyBank className="size-4 text-emerald-600" />
                    <p className="font-semibold">{formatCurrency(snapshot.companyReserveRecommendation)}</p>
                  </div>
                </div>
                <div className="rounded-2xl border p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Reserva pessoal</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Wallet className="size-4 text-orange-500" />
                    <p className="font-semibold">{formatCurrency(snapshot.personalReserveRecommendation)}</p>
                  </div>
                </div>
                <div className="rounded-2xl border p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Provisão tributária</p>
                  <div className="mt-2 flex items-center gap-2">
                    <ShieldCheck className="size-4 text-zinc-700" />
                    <p className="font-semibold">{formatCurrency(snapshot.taxProvision)}</p>
                  </div>
                </div>
              </div>
            ) : null}
            <div className="grid gap-3 md:grid-cols-2">
              {currentPlan.actions.map(action => (
                <div key={action.id} className="rounded-2xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{action.title}</p>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                    <StatusBadge status={action.status} />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <StatusBadge status={action.priority} />
                    {action.status !== "concluida" ? (
                      <Button size="sm" onClick={() => confirmMut.mutate({ actionId: action.id })} disabled={confirmMut.isPending}>
                        Concluir
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Historico</CardTitle>
          <CardDescription>Planos criados a partir das confirmacoes no WhatsApp.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {plans?.length ? plans.map(plan => (
            <div key={plan.id} className="rounded-2xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{plan.periodMonth}/{plan.periodYear}</p>
                  <p className="text-sm text-muted-foreground">{plan.summary}</p>
                </div>
                <StatusBadge status={plan.status} />
              </div>
            </div>
          )) : <p className="text-sm text-muted-foreground">Nenhum plano mensal confirmado ainda.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
