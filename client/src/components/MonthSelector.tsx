import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthSelectorProps {
  monthName: string;
  year: number;
  onPrev: () => void;
  onNext: () => void;
}

export function MonthSelector({ monthName, year, onPrev, onNext }: MonthSelectorProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-2 py-1 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <Button variant="ghost" size="icon-sm" onClick={onPrev} className="size-8 rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900">
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-[140px] px-2 text-center text-sm font-medium text-zinc-700">
        {monthName} {year}
      </span>
      <Button variant="ghost" size="icon-sm" onClick={onNext} className="size-8 rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900">
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
