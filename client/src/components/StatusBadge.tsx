import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

const statusMap: Record<string, { label: string; className: string }> = {
  pago: { label: "Pago", className: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  pendente: { label: "Pendente", className: "bg-rose-50 text-rose-600 border-rose-100" },
  atrasado: { label: "Atrasado", className: "bg-orange-50 text-orange-600 border-orange-100" },
  recebido: { label: "Recebido", className: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  ativo: { label: "Ativo", className: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  inativo: { label: "Inativo", className: "bg-zinc-100 text-zinc-500 border-zinc-200" },
  ativa: { label: "Ativa", className: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  atrasada: { label: "Atrasada", className: "bg-rose-50 text-rose-600 border-rose-100" },
  quitada: { label: "Quitada", className: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  renegociada: { label: "Renegociada", className: "bg-orange-50 text-orange-600 border-orange-100" },
  alta: { label: "Alta", className: "bg-orange-50 text-orange-600 border-orange-100" },
  media: { label: "Média", className: "bg-amber-50 text-amber-600 border-amber-100" },
  baixa: { label: "Baixa", className: "bg-emerald-50 text-emerald-600 border-emerald-100" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusMap[status] || { label: status, className: "" };
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full border px-3 py-1 text-xs font-medium", config.className)}
    >
      {config.label}
    </Badge>
  );
}
