import { trpc } from "@/lib/trpc";
import { useMonthYear } from "@/hooks/useMonthYear";
import { MonthSelector } from "@/components/MonthSelector";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingDown, TrendingUp, PiggyBank, Heart, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["oklch(0.65 0.18 155)", "oklch(0.6 0.15 250)", "oklch(0.75 0.15 75)", "oklch(0.65 0.2 25)"];

export default function DashboardPessoal() {
  const { month, year, monthName, goToPrevMonth, goToNextMonth } = useMonthYear();
  const { data, isLoading } = trpc.dashboard.personal.useQuery({ month, year });
  const settingsData = trpc.settings.get.useQuery();

  const proLaboreGross = parseFloat(settingsData.data?.proLaboreGross || "0");
  const tithePercent = parseFloat(settingsData.data?.tithePercent || "10");
  const investPercent = parseFloat(settingsData.data?.investmentPercent || "10");
  const tithe = proLaboreGross * (tithePercent / 100);
  const investPersonal = proLaboreGross * (investPercent / 100);
  const proLaboreNet = proLaboreGross - tithe - investPersonal;

  const totalFixed = parseFloat(data?.fixedCosts?.total || "0");
  const totalVar = parseFloat(data?.variableCosts?.total || "0");
  const totalDebtsMonthly = parseFloat(data?.debts?.totalMonthly || "0");
  const totalExpenses = totalFixed + totalVar + totalDebtsMonthly;
  const balance = proLaboreNet - totalExpenses;

  const totalDebtBalance = parseFloat(data?.debts?.totalBalance || "0");
  const totalInvested = parseFloat(data?.investments?.totalBalance || "0");
  const reserveTotal = parseFloat(data?.reserve?.total || "0");
  const reserveGoal = totalExpenses * (settingsData.data?.personalReserveMonths || 6);
  const reserveProgress = reserveGoal > 0 ? Math.min((reserveTotal / reserveGoal) * 100, 100) : 0;

  const distribution = [
    { name: "Contas Fixas", value: totalFixed },
    { name: "Contas Variáveis", value: totalVar },
    { name: "Dívidas", value: totalDebtsMonthly },
    { name: "Disponível", value: Math.max(balance, 0) },
  ].filter(c => c.value > 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Pessoal</h1>
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
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Pessoal</h1>
          <p className="text-sm text-muted-foreground">Controle da sua vida financeira pessoal</p>
        </div>
        <MonthSelector monthName={monthName} year={year} onPrev={goToPrevMonth} onNext={goToNextMonth} />
      </div>

      {/* Pró-labore breakdown */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Pró-labore Bruto</p>
              <p className="text-xl font-bold mt-1">{formatCurrency(proLaboreGross)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Heart className="h-3 w-3" /> Dízimo ({formatPercent(tithePercent)})
              </p>
              <p className="text-xl font-bold mt-1 text-chart-3">{formatCurrency(tithe)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Investimento ({formatPercent(investPercent)})
              </p>
              <p className="text-xl font-bold mt-1 text-chart-2">{formatCurrency(investPersonal)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Líquido Disponível</p>
              <p className="text-xl font-bold mt-1 text-primary">{formatCurrency(proLaboreNet)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Despesas do Mês</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalExpenses)}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Saldo Mensal</p>
                <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? "text-primary" : "text-destructive"}`}>
                  {formatCurrency(balance)}
                </p>
              </div>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${balance >= 0 ? "bg-primary/10" : "bg-destructive/10"}`}>
                <BarChart3 className={`h-5 w-5 ${balance >= 0 ? "text-primary" : "text-destructive"}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dívidas Ativas</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalDebtBalance)}</p>
                <p className="text-xs text-muted-foreground mt-1">{data?.debts?.count || 0} dívidas</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Patrimônio</p>
                <p className="text-2xl font-bold mt-1 text-primary">{formatCurrency(totalInvested + reserveTotal)}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <PiggyBank className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${reserveProgress}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Reserva: {formatPercent(reserveProgress)} da meta</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distribuição do Pró-labore</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                      {distribution.map((_, index) => (
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
                  Configure seu pró-labore nas Configurações
                </div>
              )}
            </div>
            {distribution.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-2 justify-center">
                {distribution.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{item.name}: {formatCurrency(item.value)}</span>
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
