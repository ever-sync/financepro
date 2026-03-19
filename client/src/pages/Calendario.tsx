import { trpc } from "@/lib/trpc";
import { useMonthYear } from "@/hooks/useMonthYear";
import { MonthSelector } from "@/components/MonthSelector";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Building2, User, AlertTriangle } from "lucide-react";

interface PaymentItem {
  id: string;
  description: string;
  amount: string;
  dueDay: number;
  status: string;
  type: "empresa-fixo" | "empresa-variavel" | "pessoal-fixo" | "pessoal-variavel" | "divida" | "fornecedor";
}

export default function Calendario() {
  const { month, year, monthName, goToPrevMonth, goToNextMonth } = useMonthYear();
  const { data: companyFixed = [] } = trpc.companyFixedCosts.list.useQuery({ month, year });
  const { data: personalFixed = [] } = trpc.personalFixedCosts.list.useQuery({ month, year });
  const { data: debts = [] } = trpc.debts.list.useQuery();

  // Montar lista unificada de pagamentos
  const payments: PaymentItem[] = [
    ...companyFixed.map(i => ({
      id: `cf-${i.id}`, description: `[EMP] ${i.description}`, amount: i.amount,
      dueDay: i.dueDay, status: i.status, type: "empresa-fixo" as const,
    })),
    ...personalFixed.map(i => ({
      id: `pf-${i.id}`, description: `[PES] ${i.description}`, amount: i.amount,
      dueDay: i.dueDay, status: i.status, type: "pessoal-fixo" as const,
    })),
    ...debts.filter(d => d.status === "ativa").map(d => ({
      id: `dv-${d.id}`, description: `[DIV] ${d.creditor} - ${d.description}`, amount: d.monthlyPayment,
      dueDay: d.dueDay, status: "pendente", type: "divida" as const,
    })),
  ].sort((a, b) => a.dueDay - b.dueDay);

  const today = new Date().getDate();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const isCurrentMonth = month === currentMonth && year === currentYear;

  const totalMonth = payments.reduce((s, p) => s + parseFloat(p.amount), 0);
  const totalPending = payments.filter(p => p.status !== "pago").reduce((s, p) => s + parseFloat(p.amount), 0);
  const overdue = isCurrentMonth ? payments.filter(p => p.status !== "pago" && p.dueDay < today) : [];

  // Agrupar por dia
  const grouped: Record<number, PaymentItem[]> = {};
  payments.forEach(p => {
    if (!grouped[p.dueDay]) grouped[p.dueDay] = [];
    grouped[p.dueDay].push(p);
  });

  const typeColor = (type: string) => {
    switch (type) {
      case "empresa-fixo": case "empresa-variavel": return "bg-primary/10 text-primary";
      case "pessoal-fixo": case "pessoal-variavel": return "bg-chart-2/10 text-chart-2";
      case "divida": return "bg-destructive/10 text-destructive";
      case "fornecedor": return "bg-chart-3/10 text-chart-3";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendário de Pagamentos</h1>
          <p className="text-sm text-muted-foreground">Visão mensal de todos os compromissos financeiros</p>
        </div>
        <MonthSelector monthName={monthName} year={year} onPrev={goToPrevMonth} onNext={goToNextMonth} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground uppercase">Total do Mês</p><p className="text-xl font-bold mt-1">{formatCurrency(totalMonth)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground uppercase">Pendente</p><p className="text-xl font-bold mt-1 text-chart-3">{formatCurrency(totalPending)}</p></CardContent></Card>
        <Card className={overdue.length > 0 ? "border-destructive/30" : ""}>
          <CardContent className="pt-6 flex items-center justify-between">
            <div><p className="text-xs text-muted-foreground uppercase">Atrasados</p><p className="text-xl font-bold mt-1 text-destructive">{overdue.length}</p></div>
            {overdue.length > 0 && <AlertTriangle className="h-5 w-5 text-destructive" />}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3 flex-wrap text-xs">
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-primary/30" /> Empresa</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-chart-2/30" /> Pessoal</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-destructive/30" /> Dívida</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-chart-3/30" /> Fornecedor</span>
      </div>

      <div className="space-y-3">
        {Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b)).map(([day, items]) => {
          const dayNum = Number(day);
          const isPast = isCurrentMonth && dayNum < today;
          const isToday = isCurrentMonth && dayNum === today;
          const dayTotal = items.reduce((s, i) => s + parseFloat(i.amount), 0);

          return (
            <Card key={day} className={`${isToday ? "border-primary ring-1 ring-primary/20" : ""} ${isPast ? "opacity-60" : ""}`}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${isToday ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      {day}
                    </div>
                    <span className="text-sm font-medium">{isToday ? "Hoje" : `Dia ${day}`}</span>
                  </div>
                  <span className="text-sm font-bold">{formatCurrency(dayTotal)}</span>
                </div>
                <div className="space-y-1.5 ml-10">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeColor(item.type)}`}>
                          {item.type.includes("empresa") ? "EMP" : item.type === "divida" ? "DIV" : "PES"}
                        </span>
                        <span className="truncate max-w-[200px] sm:max-w-none">{item.description.replace(/^\[(EMP|PES|DIV)\]\s*/, "")}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs">{formatCurrency(item.amount)}</span>
                        <StatusBadge status={item.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {payments.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum pagamento agendado para este mês</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
