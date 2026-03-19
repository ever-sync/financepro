import { trpc } from "@/lib/trpc";
import { useMonthYear } from "@/hooks/useMonthYear";
import { MonthSelector } from "@/components/MonthSelector";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Users, Building2, PiggyBank, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["oklch(0.65 0.18 155)", "oklch(0.6 0.15 250)", "oklch(0.75 0.15 75)", "oklch(0.65 0.2 25)", "oklch(0.6 0.15 300)"];

export default function DashboardEmpresa() {
  const { month, year, monthName, goToPrevMonth, goToNextMonth } = useMonthYear();
  const { data, isLoading } = trpc.dashboard.company.useQuery({ month, year });

  const totalRevenue = parseFloat(data?.revenue?.totalGross || "0");
  const totalTax = parseFloat(data?.revenue?.totalTax || "0");
  const netRevenue = parseFloat(data?.revenue?.totalNet || "0");
  const totalFixedCosts = parseFloat(data?.fixedCosts?.total || "0");
  const totalVarCosts = parseFloat(data?.variableCosts?.total || "0");
  const totalEmployees = parseFloat(data?.employees?.totalCost || "0");
  const totalPurchases = parseFloat(data?.purchases?.total || "0");
  const proLabore = parseFloat(data?.settings?.proLaboreGross || "0");
  const totalCosts = totalFixedCosts + totalVarCosts + totalEmployees + totalPurchases + proLabore;
  const profit = netRevenue - totalCosts;
  const margin = netRevenue > 0 ? (profit / netRevenue) * 100 : 0;
  const reserveTotal = parseFloat(data?.reserve?.total || "0");
  const reserveGoal = totalCosts * (data?.settings?.companyReserveMonths || 3);
  const reserveProgress = reserveGoal > 0 ? Math.min((reserveTotal / reserveGoal) * 100, 100) : 0;

  const costBreakdown = [
    { name: "Fixos", value: totalFixedCosts },
    { name: "Variáveis", value: totalVarCosts },
    { name: "Folha", value: totalEmployees },
    { name: "Fornecedores", value: totalPurchases },
    { name: "Pró-labore", value: proLabore },
  ].filter(c => c.value > 0);

  const summaryData = [
    { name: "Receita", receita: netRevenue, custo: 0 },
    { name: "Custos", receita: 0, custo: totalCosts },
    { name: "Lucro", receita: Math.max(profit, 0), custo: Math.abs(Math.min(profit, 0)) },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Empresa</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="pt-6"><div className="h-20 bg-muted rounded" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Empresa</h1>
          <p className="text-sm text-muted-foreground">Visão geral financeira da empresa</p>
        </div>
        <MonthSelector monthName={monthName} year={year} onPrev={goToPrevMonth} onNext={goToNextMonth} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Faturamento Bruto</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">Imposto: {formatCurrency(totalTax)}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Custos Totais</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalCosts)}</p>
                <p className="text-xs text-muted-foreground mt-1">{data?.employees?.count || 0} funcionários</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Lucro Operacional</p>
                <p className={`text-2xl font-bold mt-1 ${profit >= 0 ? "text-primary" : "text-destructive"}`}>
                  {formatCurrency(profit)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Margem: {formatPercent(margin)}</p>
              </div>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${profit >= 0 ? "bg-primary/10" : "bg-destructive/10"}`}>
                {profit >= 0 ? <TrendingUp className="h-5 w-5 text-primary" /> : <AlertTriangle className="h-5 w-5 text-destructive" />}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fundo Reserva</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(reserveTotal)}</p>
                <p className="text-xs text-muted-foreground mt-1">Meta: {formatCurrency(reserveGoal)}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-chart-3/10 flex items-center justify-center">
                <PiggyBank className="h-5 w-5 text-chart-3" />
              </div>
            </div>
            <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${reserveProgress}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Receita vs Custos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summaryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.008 260)" />
                  <XAxis dataKey="name" stroke="oklch(0.6 0.01 260)" fontSize={12} />
                  <YAxis stroke="oklch(0.6 0.01 260)" fontSize={12} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "oklch(0.19 0.008 260)", border: "1px solid oklch(0.28 0.008 260)", borderRadius: "8px", color: "oklch(0.93 0.005 260)" }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="receita" fill="oklch(0.65 0.18 155)" radius={[4, 4, 0, 0]} name="Receita" />
                  <Bar dataKey="custo" fill="oklch(0.65 0.2 25)" radius={[4, 4, 0, 0]} name="Custo" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distribuição de Custos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {costBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={costBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                      {costBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "oklch(0.19 0.008 260)", border: "1px solid oklch(0.28 0.008 260)", borderRadius: "8px", color: "oklch(0.93 0.005 260)" }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Sem dados de custos neste mês
                </div>
              )}
            </div>
            {costBreakdown.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-2 justify-center">
                {costBreakdown.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
