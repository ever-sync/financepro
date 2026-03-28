import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";

export default function WhatsAppPlanos() {
  const utils = trpc.useUtils();
  const { data: currentPlan } = trpc.assistantPlans.getCurrent.useQuery();
  const { data: plans, isLoading } = trpc.assistantPlans.list.useQuery();
  const confirmMut = trpc.assistantPlans.confirmAction.useMutation({
    onSuccess: async () => {
      await utils.assistantPlans.getCurrent.invalidate();
      await utils.assistantPlans.list.invalidate();
      toast.success("Acao do plano marcada como concluida.");
    },
    onError: error => toast.error(error.message),
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando planos mensais...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Planos mensais</h1>
        <p className="text-sm text-muted-foreground">
          Metas do mes, acoes recomendadas pela IA e progresso de execucao.
        </p>
      </div>

      {currentPlan ? (
        <Card>
          <CardHeader>
            <CardTitle>Plano vigente</CardTitle>
            <CardDescription>{currentPlan.periodMonth}/{currentPlan.periodYear}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-muted p-4">
              <p className="font-medium">{currentPlan.summary}</p>
              {currentPlan.recommendedCashAction ? (
                <p className="mt-2 text-sm text-muted-foreground">{currentPlan.recommendedCashAction}</p>
              ) : null}
            </div>
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

