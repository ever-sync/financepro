import { trpc } from "@/lib/trpc";
import { useMonthYear } from "@/hooks/useMonthYear";
import { MonthSelector } from "@/components/MonthSelector";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function DRE() {
  const { month, year, monthName, goToPrevMonth, goToNextMonth } = useMonthYear();
  const { data: company, isLoading } = trpc.dashboard.company.useQuery({ month, year });
  const { data: settings } = trpc.settings.get.useQuery();

  const grossRevenue = parseFloat(company?.revenue?.totalGross || "0");
  const taxAmount = parseFloat(company?.revenue?.totalTax || "0");
  const netRevenue = grossRevenue - taxAmount;
  const fixedCosts = parseFloat(company?.fixedCosts?.total || "0");
  const variableCosts = parseFloat(company?.variableCosts?.total || "0");
  const employeeCosts = parseFloat(company?.employees?.totalCost || "0");
  const purchaseCosts = parseFloat(company?.purchases?.total || "0");
  const totalOperatingCosts = fixedCosts + variableCosts + employeeCosts + purchaseCosts;
  const operatingProfit = netRevenue - totalOperatingCosts;
  const proLabore = parseFloat(settings?.proLaboreGross || "0");
  const netProfit = operatingProfit - proLabore;
  const margin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;
  const resultSeries = company?.resultSeries ?? [];
  const annualAccumulatedResult =
    resultSeries[resultSeries.length - 1]?.accumulatedResult ?? netProfit;

  const DRELine = ({ label, value, indent = 0, bold = false, highlight = false, negative = false }: {
    label: string; value: number; indent?: number; bold?: boolean; highlight?: boolean; negative?: boolean;
  }) => (
    <div className={`flex items-center justify-between py-2 px-4 ${indent > 0 ? "pl-8" : ""} ${bold ? "font-bold" : ""} ${highlight ? "bg-primary/5 rounded-lg" : ""}`}>
      <span className={`text-sm ${indent > 0 ? "text-muted-foreground" : ""}`}>
        {negative ? "(-) " : indent > 0 ? "" : ""}{label}
      </span>
      <span className={`text-sm font-mono ${value < 0 ? "text-destructive" : value > 0 && highlight ? "text-primary" : ""} ${bold ? "font-bold text-base" : ""}`}>
        {formatCurrency(Math.abs(value))}
      </span>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">DRE - Demonstrativo de Resultado</h1>
        <Card className="animate-pulse"><CardContent className="pt-6"><div className="h-96 bg-muted rounded" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">DRE - Demonstrativo de Resultado</h1>
          <p className="text-sm text-muted-foreground">Visão contábil simplificada do exercício mensal</p>
        </div>
        <MonthSelector monthName={monthName} year={year} onPrev={goToPrevMonth} onNext={goToNextMonth} />
      </div>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-base">DRE Simplificado - {monthName} {year}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-0">
            <DRELine label="RECEITA BRUTA" value={grossRevenue} bold />
            <Separator />
            <DRELine label="Impostos sobre receita" value={-taxAmount} indent={1} negative />
            <Separator />
            <DRELine label="RECEITA LÍQUIDA" value={netRevenue} bold highlight />
            <Separator />

            <div className="py-2 px-4"><span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Custos Operacionais</span></div>
            <DRELine label="Custos Fixos" value={-fixedCosts} indent={1} negative />
            <DRELine label="Custos Variáveis" value={-variableCosts} indent={1} negative />
            <DRELine label="Folha de Pagamento" value={-employeeCosts} indent={1} negative />
            <DRELine label="Fornecedores" value={-purchaseCosts} indent={1} negative />
            <Separator />
            <DRELine label="TOTAL CUSTOS OPERACIONAIS" value={-totalOperatingCosts} bold />
            <Separator />

            <DRELine label="LUCRO OPERACIONAL" value={operatingProfit} bold highlight />
            <Separator />

            <DRELine label="Pró-labore (retirada do sócio)" value={-proLabore} indent={1} negative />
            <Separator />

            <div className={`flex items-center justify-between py-3 px-4 rounded-lg ${netProfit >= 0 ? "bg-primary/10" : "bg-destructive/10"}`}>
              <span className="text-base font-bold">RESULTADO LÍQUIDO</span>
              <span className={`text-lg font-bold font-mono ${netProfit >= 0 ? "text-primary" : "text-destructive"}`}>
                {formatCurrency(netProfit)}
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground uppercase">Margem Líquida</p>
              <p className={`text-lg font-bold ${margin >= 0 ? "text-primary" : "text-destructive"}`}>{formatPercent(margin)}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground uppercase">Custo/Receita</p>
              <p className="text-lg font-bold">{formatPercent(grossRevenue > 0 ? (totalOperatingCosts / grossRevenue) * 100 : 0)}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground uppercase">Carga Tributária</p>
              <p className="text-lg font-bold">{formatPercent(grossRevenue > 0 ? (taxAmount / grossRevenue) * 100 : 0)}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground uppercase">Folha/Receita</p>
              <p className="text-lg font-bold">{formatPercent(grossRevenue > 0 ? (employeeCosts / grossRevenue) * 100 : 0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-base">Resultado do Exercício Acumulado - {year}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <div className="min-w-[980px] rounded-xl border border-border">
              <div className="grid grid-cols-[220px_repeat(12,minmax(70px,1fr))_120px] items-center border-b bg-muted/30 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <div className="px-4 py-3">Indicador</div>
                {resultSeries.map(item => (
                  <div key={`${item.key}-header`} className="px-2 py-3 text-center">
                    {item.month}
                  </div>
                ))}
                <div className="px-4 py-3 text-right">Total</div>
              </div>

              <div className="grid grid-cols-[220px_repeat(12,minmax(70px,1fr))_120px] items-center text-sm">
                <div className="px-4 py-4 font-medium">Resultado do Exercício</div>
                {resultSeries.map(item => (
                  <div key={item.key} className="px-2 py-4 text-center font-mono">
                    {formatCurrency(item.accumulatedResult)}
                  </div>
                ))}
                <div className="px-4 py-4 text-right font-mono font-semibold">
                  {formatCurrency(annualAccumulatedResult)}
                </div>
              </div>

              <div className="grid grid-cols-[220px_repeat(12,minmax(70px,1fr))_120px] items-center border-t text-sm">
                <div className="px-4 py-4 font-medium text-muted-foreground">Acumulado anterior no passivo</div>
                {resultSeries.map(item => (
                  <div key={`${item.key}-passive-carry`} className="px-2 py-4 text-center font-mono text-muted-foreground">
                    {formatCurrency(item.passiveCarryResult ?? 0)}
                  </div>
                ))}
                <div className="px-4 py-4 text-right font-mono text-muted-foreground">
                  {formatCurrency(resultSeries[resultSeries.length - 1]?.passiveCarryResult ?? 0)}
                </div>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Janeiro mostra o resultado do mês. De fevereiro em diante, cada coluna acumula o resultado do mês anterior.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
