import { trpc } from "@/lib/trpc";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type ContractType = "clt" | "pj";

export default function Funcionarios() {
  const utils = trpc.useUtils();
  const { data: items = [], isLoading } = trpc.employees.list.useQuery();
  const createMut = trpc.employees.create.useMutation({
    onSuccess: () => {
      utils.employees.list.invalidate();
      toast.success("Funcionario adicionado");
      setOpen(false);
      resetForm();
    },
  });
  const updateMut = trpc.employees.update.useMutation({
    onSuccess: () => {
      utils.employees.list.invalidate();
      toast.success("Atualizado");
    },
  });
  const deleteMut = trpc.employees.delete.useMutation({
    onSuccess: () => {
      utils.employees.list.invalidate();
      toast.success("Removido");
    },
  });

  const [open, setOpen] = useState(false);
  const [salary, setSalary] = useState("");
  const [contractType, setContractType] = useState<ContractType>("clt");

  const resetForm = () => {
    setSalary("");
    setContractType("clt");
  };

  const salaryNum = parseFloat(salary) || 0;
  const isCLT = contractType === "clt";

  const fgts = isCLT ? salaryNum * 0.08 : 0;
  const thirteenth = isCLT ? salaryNum / 12 : 0;
  const vacation = isCLT ? (salaryNum * 1.3333) / 12 : 0;
  const totalCost = isCLT ? salaryNum + fgts + thirteenth + vacation : salaryNum;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMut.mutate({
      name: fd.get("name") as string,
      role: fd.get("role") as string,
      contractType,
      salary: salaryNum.toFixed(2),
      fgtsAmount: fgts.toFixed(2),
      thirteenthProvision: thirteenth.toFixed(2),
      vacationProvision: vacation.toFixed(2),
      totalCost: totalCost.toFixed(2),
      paymentDay: parseInt(fd.get("paymentDay") as string) || 5,
      admissionDate: (fd.get("admissionDate") as string) || undefined,
    });
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Funcionarios</h1>
          <p className="text-sm text-muted-foreground">Folha de pagamento com calculos automaticos de encargos</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> Novo Funcionario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Funcionario</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Tipo de Contrato</Label>
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setContractType("clt")}
                    className={`flex-1 rounded-md border py-2 text-sm font-medium transition-colors ${
                      contractType === "clt"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    CLT
                  </button>
                  <button
                    type="button"
                    onClick={() => setContractType("pj")}
                    className={`flex-1 rounded-md border py-2 text-sm font-medium transition-colors ${
                      contractType === "pj"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    PJ / CNPJ
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label>Nome</Label>
                  <Input name="name" required />
                </div>
                <div>
                  <Label>Cargo</Label>
                  <Input name="role" required />
                </div>
                <div>
                  <Label>{isCLT ? "Salario (R$)" : "Valor do Contrato (R$)"}</Label>
                  <Input
                    name="salary"
                    type="number"
                    step="0.01"
                    required
                    value={salary}
                    onChange={e => setSalary(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Dia do Pagamento</Label>
                  <Input name="paymentDay" type="number" min="1" max="31" defaultValue={5} required />
                </div>
                <div>
                  <Label>Data Admissao</Label>
                  <Input name="admissionDate" type="date" />
                </div>
              </div>

              {salaryNum > 0 && (
                <Card className="bg-muted/50">
                  <CardContent className="pb-4 pt-4">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      {isCLT ? "Calculo Automatico (CLT)" : "Resumo PJ"}
                    </p>
                    {isCLT ? (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">FGTS (8%):</span>
                        <span className="text-right">{formatCurrency(fgts)}</span>
                        <span className="text-muted-foreground">Provision 13o:</span>
                        <span className="text-right">{formatCurrency(thirteenth)}</span>
                        <span className="text-muted-foreground">Provision Ferias:</span>
                        <span className="text-right">{formatCurrency(vacation)}</span>
                        <span className="border-t pt-1 font-medium">Custo Total:</span>
                        <span className="border-t pt-1 text-right font-bold text-primary">{formatCurrency(totalCost)}</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">Sem FGTS / encargos</span>
                        <span className="text-right text-muted-foreground">-</span>
                        <span className="border-t pt-1 font-medium">Valor do Contrato:</span>
                        <span className="border-t pt-1 text-right font-bold text-primary">{formatCurrency(salaryNum)}</span>
                      </div>
                    )}
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Funcionarios Ativos</p>
              <p className="mt-1 text-xl font-bold">{activeEmployees.length}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase text-muted-foreground">Total Salarios / Contratos</p>
            <p className="mt-1 text-xl font-bold">{formatCurrency(totalSalaries)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase text-muted-foreground">Custo Total Folha</p>
            <p className="mt-1 text-xl font-bold text-destructive">{formatCurrency(totalPayroll)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-right">Salario / Contrato</TableHead>
                <TableHead className="text-right">FGTS</TableHead>
                <TableHead className="text-right">13o Prov.</TableHead>
                <TableHead className="text-right">Ferias Prov.</TableHead>
                <TableHead className="text-right">Custo Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-15"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={11} className="py-8 text-center text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="py-8 text-center text-muted-foreground">
                    Nenhum funcionario cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                items.map(item => (
                  <TableRow key={item.id} className={item.status === "inativo" ? "opacity-50" : ""}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.role}</TableCell>
                    <TableCell>
                      <Badge variant={item.contractType === "pj" ? "outline" : "secondary"} className="text-xs">
                        {item.contractType === "pj" ? "PJ" : "CLT"}
                      </Badge>
                    </TableCell>
                    <TableCell>Dia {item.paymentDay || 5}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.salary)}</TableCell>
                    <TableCell className="text-right">
                      {item.contractType === "pj" ? <span className="text-muted-foreground">-</span> : formatCurrency(item.fgtsAmount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.contractType === "pj" ? <span className="text-muted-foreground">-</span> : formatCurrency(item.thirteenthProvision)}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.contractType === "pj" ? <span className="text-muted-foreground">-</span> : formatCurrency(item.vacationProvision)}
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(item.totalCost)}</TableCell>
                    <TableCell>
                      <button onClick={() => toggleStatus(item)}>
                        <StatusBadge status={item.status} />
                      </button>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        aria-label="Remover funcionario"
                        onClick={() => deleteMut.mutate({ id: item.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
