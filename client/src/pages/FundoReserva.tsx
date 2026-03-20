import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, PiggyBank, Building2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function FundoReserva() {
  const utils = trpc.useUtils();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();

  const { data: companyItems = [] }   = trpc.reserveFunds.list.useQuery({ type: "empresa" });
  const { data: personalItems = [] }  = trpc.reserveFunds.list.useQuery({ type: "pessoal" });
  const { data: settings }            = trpc.settings.get.useQuery();
  const { data: companyFixed = [] }   = trpc.companyFixedCosts.list.useQuery({ month, year });
  const { data: personalFixed = [] }  = trpc.personalFixedCosts.list.useQuery({ month, year });

  const createMut = trpc.reserveFunds.create.useMutation({ onSuccess: () => { utils.reserveFunds.list.invalidate(); toast.success("Depósito adicionado"); setOpen(false); } });
  const deleteMut = trpc.reserveFunds.delete.useMutation({ onSuccess: () => { utils.reserveFunds.list.invalidate(); toast.success("Removido"); } });
  const [open, setOpen] = useState(false);
  const [fundType, setFundType] = useState<"empresa" | "pessoal">("empresa");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMut.mutate({
      type: fd.get("type") as "empresa" | "pessoal",
      depositAmount: (parseFloat(fd.get("depositAmount") as string) || 0).toFixed(2),
      date: fd.get("date") as string,
      description: (fd.get("description") as string) || undefined,
    });
  };

  const companyTotal    = companyItems.reduce((s, i) => s + parseFloat(i.depositAmount), 0);
  const personalTotal   = personalItems.reduce((s, i) => s + parseFloat(i.depositAmount), 0);

  // Meta = meses configurados × total mensal das contas fixas
  const companyMonthly  = companyFixed.reduce((s, i) => s + parseFloat(i.amount), 0);
  const personalMonthly = personalFixed.reduce((s, i) => s + parseFloat(i.amount), 0);
  const companyGoal     = companyMonthly  * (settings?.companyReserveMonths  || 3);
  const personalGoal    = personalMonthly * (settings?.personalReserveMonths || 6);

  const companyProgress  = companyGoal  > 0 ? Math.min((companyTotal  / companyGoal)  * 100, 100) : 0;
  const personalProgress = personalGoal > 0 ? Math.min((personalTotal / personalGoal) * 100, 100) : 0;

  const renderTable = (items: typeof companyItems) => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Nenhum depósito registrado</TableCell></TableRow>
            ) : items.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.description || "Depósito"}</TableCell>
                <TableCell className="text-right text-primary font-medium">{formatCurrency(item.depositAmount)}</TableCell>
                <TableCell>{formatDate(item.date)}</TableCell>
                <TableCell><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMut.mutate({ id: item.id })}><Trash2 className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fundo de Reserva</h1>
          <p className="text-sm text-muted-foreground">Construa sua reserva de emergência para empresa e vida pessoal</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Novo Depósito</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Depósito</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div><Label>Tipo</Label>
                  <Select name="type" defaultValue="empresa">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="empresa">Empresa</SelectItem>
                      <SelectItem value="pessoal">Pessoal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Valor (R$)</Label><Input name="depositAmount" type="number" step="0.01" required /></div>
                <div><Label>Data</Label><Input name="date" type="date" required /></div>
                <div><Label>Descrição</Label><Input name="description" /></div>
              </div>
              <Button type="submit" className="w-full" disabled={createMut.isPending}>
                {createMut.isPending ? "Salvando..." : "Adicionar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-primary/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Building2 className="h-4 w-4" /> Reserva Empresa</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{formatCurrency(companyTotal)}</p>
            <p className="text-xs text-muted-foreground mt-1">Meta: {formatCurrency(companyGoal)} ({settings?.companyReserveMonths || 3} meses de custos)</p>
            <Progress value={companyProgress} className="h-2 mt-3" />
            <p className="text-[10px] text-muted-foreground mt-1">{companyProgress.toFixed(0)}% da meta</p>
          </CardContent>
        </Card>
        <Card className="border-chart-2/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><User className="h-4 w-4" /> Reserva Pessoal</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-chart-2">{formatCurrency(personalTotal)}</p>
            <p className="text-xs text-muted-foreground mt-1">Meta: {formatCurrency(personalGoal)} ({settings?.personalReserveMonths || 6} meses de despesas)</p>
            <Progress value={personalProgress} className="h-2 mt-3" />
            <p className="text-[10px] text-muted-foreground mt-1">{personalProgress.toFixed(0)}% da meta</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="empresa">
        <TabsList>
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="pessoal">Pessoal</TabsTrigger>
        </TabsList>
        <TabsContent value="empresa" className="mt-4">{renderTable(companyItems)}</TabsContent>
        <TabsContent value="pessoal" className="mt-4">{renderTable(personalItems)}</TabsContent>
      </Tabs>
    </div>
  );
}
