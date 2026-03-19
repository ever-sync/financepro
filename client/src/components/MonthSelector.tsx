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
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={onPrev} className="h-8 w-8">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium min-w-[140px] text-center">
        {monthName} {year}
      </span>
      <Button variant="outline" size="icon" onClick={onNext} className="h-8 w-8">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
