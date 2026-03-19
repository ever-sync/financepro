import { trpc } from "@/lib/trpc";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Funcionarios() {
  const utils = trpc.useUtils();
  const { data: items = [], isLoading } = trpc.employees.list.useQuery();
  const createMut = trpc.employees.create.useMutation({ onSuccess: () => { utils.employees.list.invalidate(); toast.success("Funcionário adicionado"); setOpen(false); } });
  const updateMut = trpc.employees.update.useMutation({ onSuccess: () => { utils.employees.list.invalidate(); toast.success("Atualizado"); } });
  const deleteMut = trpc.employees.delete.useMutation({ onSuccess: () => { utils.employees.list.invalidate(); toast.success("Removido"); } });
  const [open, setOpen] = useState(false);
  const [salary, setSalary] = useState("");

  const salaryNum = parseFloat(salary) || 0;
  const fgts = salaryNum * 0.08;
  const thirteenth = salaryNum / 12;
  const vacation = (salaryNum * 1.3333) / 12;
  const totalCost = salaryNum + fgts + thirteenth + vacation;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMut.mutate({
      name: fd.get("name") as string,
      role: fd.get("role") as string,
      salary: salaryNum.toFixed(2),
      fgtsAmount: fgts.toFixed(2),
      thirteenthProvision: thirteenth.toFixed(2),
      vacationProvision: vacation.toFixed(2),
      totalCost: totalCost.toFixed(2),
      admissionDate: (fd.get("admissionDate") as string) || undefined,
    });
    setSalary("");
  };

  const toggleStatus = (item: typeof items[0]) => {
    const next = item.status === "ativo" ? "inativo" : "ativo";
    updateMut.mutate({ id: item.id, status: next });
  };

  const activeEmployees = items.filter(i => i.status === "ativo");
  const totalPayroll = activeEmployees.reduce((s, i) => s + parseFloat(i.totalCost), 0);
  const totalSalaries = activeEmployees.reduce((s, i) => s + parseFloat(i.salary), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Funcionários</h1>
          <p className="text-sm text-muted-foreground">Folha de pagamento com cálculos automáticos de encargos</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Novo Funcionário</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Funcionário</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><Label>Nome</Label><Input name="name" required /></div>
                <div><Label>Cargo</Label><Input name="role" required /></div>
                <div><Label>Salário (R$)</Label><Input name="salary" type="number" step="0.01" required value={salary} onChange={e => setSalary(e.target.value)} /></div>
                <div><Label>Data Admissão</Label><Input name="admissionDate" type="date" /></div>
              </div>
              {salaryNum > 0 && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Cálculo Automático</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">FGTS (8%):</span><span className="text-right">{formatCurrency(fgts)}</span>
                      <span className="text-muted-foreground">Provisão 13º:</span><span className="text-right">{formatCurrency(thirteenth)}</span>
                      <span className="text-muted-foreground">Provisão Férias:</span><span className="text-right">{formatCurrency(vacation)}</span>
                      <span className="font-medium border-t pt-1">Custo Total:</span><span className="text-right font-bold text-primary border-t pt-1">{formatCurrency(totalCost)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
              <Button type="submit" className="w-full" disabled={createMut.isPending}>
                {createMut.isPending ? "Salvando..." : "Adicionar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 flex items-center justify-between">
          <div><p className="text-xs text-muted-foreground uppercase">Funcionários Ativos</p><p className="text-xl font-bold mt-1">{activeEmployees.length}</p></div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div>
        </CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground uppercase">Total Salários</p><p className="text-xl font-bold mt-1">{formatCurrency(totalSalaries)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground uppercase">Custo Total Folha</p><p className="text-xl font-bold mt-1 text-destructive">{formatCurrency(totalPayroll)}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead className="text-right">Salário</TableHead>
                <TableHead className="text-right">FGTS</TableHead>
                <TableHead className="text-right">13º Prov.</TableHead>
                <TableHead className="text-right">Férias Prov.</TableHead>
                <TableHead className="text-right">Custo Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhum funcionário cadastrado</TableCell></TableRow>
              ) : items.map(item => (
                <TableRow key={item.id} className={item.status === "inativo" ? "opacity-50" : ""}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.role}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.salary)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.fgtsAmount)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.thirteenthProvision)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.vacationProvision)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.totalCost)}</TableCell>
                  <TableCell><button onClick={() => toggleStatus(item)}><StatusBadge status={item.status} /></button></TableCell>
                  <TableCell><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMut.mutate({ id: item.id })}><Trash2 className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
