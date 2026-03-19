import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

const statusMap: Record<string, { label: string; className: string }> = {
  pago: { label: "Pago", className: "status-pago" },
  pendente: { label: "Pendente", className: "status-pendente" },
  atrasado: { label: "Atrasado", className: "status-atrasado" },
  recebido: { label: "Recebido", className: "status-recebido" },
  ativo: { label: "Ativo", className: "status-ativo" },
  inativo: { label: "Inativo", className: "status-inativo" },
  ativa: { label: "Ativa", className: "status-ativa" },
  quitada: { label: "Quitada", className: "status-quitada" },
  renegociada: { label: "Renegociada", className: "status-pendente" },
  alta: { label: "Alta", className: "status-atrasado" },
  media: { label: "Média", className: "status-pendente" },
  baixa: { label: "Baixa", className: "status-pago" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusMap[status] || { label: status, className: "" };
  return (
    <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
      {config.label}
    </Badge>
  );
}
