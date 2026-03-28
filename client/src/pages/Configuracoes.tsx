import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, Building2, User, Percent, PiggyBank, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Configuracoes() {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.settings.get.useQuery();
  const updateMut = trpc.settings.upsert.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success("Configurações salvas com sucesso!");
    },
  });

  const [form, setForm] = useState({
    companyName: "",
    taxPercent: "6",
    tithePercent: "10",
    investmentPercent: "10",
    proLaboreGross: "0",
    companyReserveMonths: 3,
    personalReserveMonths: 6,
    companyMinCashMonths: "1",
    personalMinCashMonths: "1",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        companyName: settings.companyName || "",
        taxPercent: settings.taxPercent || "6",
        tithePercent: settings.tithePercent || "10",
        investmentPercent: settings.investmentPercent || "10",
        proLaboreGross: settings.proLaboreGross || "0",
        companyReserveMonths: settings.companyReserveMonths || 3,
        personalReserveMonths: settings.personalReserveMonths || 6,
        companyMinCashMonths: settings.companyMinCashMonths || "1",
        personalMinCashMonths: settings.personalMinCashMonths || "1",
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateMut.mutate(form);
  };

  const proLabore = parseFloat(form.proLaboreGross) || 0;
  const tithe = proLabore * (parseFloat(form.tithePercent) / 100);
  const investment = proLabore * (parseFloat(form.investmentPercent) / 100);
  const netProLabore = proLabore - tithe - investment;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <Card className="animate-pulse"><CardContent className="pt-6"><div className="h-64 bg-muted rounded" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-sm text-muted-foreground">Defina os parâmetros centrais do seu controle financeiro</p>
        </div>
        <Button onClick={handleSave} disabled={updateMut.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {updateMut.isPending ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Building2 className="h-4 w-4" /> Dados da Empresa</CardTitle>
            <CardDescription>Informações básicas da sua empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nome da Empresa</Label>
              <Input value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} placeholder="Sua Empresa Ltda" />
            </div>
          </CardContent>
        </Card>

        {/* Percentuais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Percent className="h-4 w-4" /> Percentuais de Dedução</CardTitle>
            <CardDescription>Estes percentuais são aplicados automaticamente em todo o sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Imposto (%)</Label>
                <Input type="number" step="0.1" value={form.taxPercent} onChange={e => setForm(f => ({ ...f, taxPercent: e.target.value }))} />
                <p className="text-[10px] text-muted-foreground mt-1">Sobre receita bruta</p>
              </div>
              <div>
                <Label>Dízimo (%)</Label>
                <Input type="number" step="0.1" value={form.tithePercent} onChange={e => setForm(f => ({ ...f, tithePercent: e.target.value }))} />
                <p className="text-[10px] text-muted-foreground mt-1">Sobre pró-labore</p>
              </div>
              <div>
                <Label>Investimento (%)</Label>
                <Input type="number" step="0.1" value={form.investmentPercent} onChange={e => setForm(f => ({ ...f, investmentPercent: e.target.value }))} />
                <p className="text-[10px] text-muted-foreground mt-1">Sobre pró-labore</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pró-labore */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4" /> Pró-labore (Seu Salário)</CardTitle>
            <CardDescription>Valor fixo mensal que a empresa te paga</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Pró-labore Bruto (R$)</Label>
              <Input type="number" step="0.01" value={form.proLaboreGross} onChange={e => setForm(f => ({ ...f, proLaboreGross: e.target.value }))} />
            </div>
            {proLabore > 0 && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Distribuição Automática</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Pró-labore Bruto:</span><span className="text-right">{formatCurrency(proLabore)}</span>
                    <span className="text-muted-foreground">(-) Dízimo ({form.tithePercent}%):</span><span className="text-right text-destructive">{formatCurrency(tithe)}</span>
                    <span className="text-muted-foreground">(-) Investimento ({form.investmentPercent}%):</span><span className="text-right text-destructive">{formatCurrency(investment)}</span>
                    <Separator className="col-span-2" />
                    <span className="font-medium">(=) Disponível para você:</span><span className="text-right font-bold text-primary">{formatCurrency(netProLabore)}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Fundo de Reserva */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><PiggyBank className="h-4 w-4" /> Metas de Reserva</CardTitle>
            <CardDescription>Defina quantos meses de despesas quer acumular</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Reserva Empresa (meses)</Label>
                <Input type="number" min="1" max="24" value={form.companyReserveMonths} onChange={e => setForm(f => ({ ...f, companyReserveMonths: parseInt(e.target.value) || 3 }))} />
                <p className="text-[10px] text-muted-foreground mt-1">Meses de custos operacionais</p>
              </div>
              <div>
                <Label>Reserva Pessoal (meses)</Label>
                <Input type="number" min="1" max="24" value={form.personalReserveMonths} onChange={e => setForm(f => ({ ...f, personalReserveMonths: parseInt(e.target.value) || 6 }))} />
                <p className="text-[10px] text-muted-foreground mt-1">Meses de despesas pessoais</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Caixa mínimo empresa (meses)</Label>
                <Input type="number" min="0.5" max="12" step="0.5" value={form.companyMinCashMonths} onChange={e => setForm(f => ({ ...f, companyMinCashMonths: e.target.value }))} />
                <p className="text-[10px] text-muted-foreground mt-1">Folga operacional mínima que não deve ser tocada</p>
              </div>
              <div>
                <Label>Caixa mínimo pessoal (meses)</Label>
                <Input type="number" min="0.5" max="12" step="0.5" value={form.personalMinCashMonths} onChange={e => setForm(f => ({ ...f, personalMinCashMonths: e.target.value }))} />
                <p className="text-[10px] text-muted-foreground mt-1">Folga mínima para segurar as despesas essenciais</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
