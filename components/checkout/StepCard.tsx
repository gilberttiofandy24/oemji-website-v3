import { ChevronDown } from "lucide-react";

interface StepCardProps {
  step: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const StepCard = ({ step, title, subtitle, children, isOpen, onOpenChange }: StepCardProps) => {
  const isCollapsible = onOpenChange !== undefined;

  return (
    <section className="overflow-hidden rounded-xl border border-border">
      <div
        className={`flex items-stretch justify-between bg-card ${isCollapsible ? "cursor-pointer hover:bg-card/80" : ""}`}
        onClick={() => isCollapsible && onOpenChange?.(!isOpen)}
      >
        <div className="flex items-stretch flex-1">
          <div className="flex w-10 min-h-10 shrink-0 items-center justify-center text-sm font-semibold text-primary-foreground bg-secondary-gradient">
            {step}
          </div>
          <div className="w-full min-w-0 py-2 pl-4">
            <h2 className="truncate text-sm font-semibold">{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {isCollapsible && (
          <div className="flex items-center pr-4">
            <ChevronDown
              className="h-4 w-4 transition-transform"
              style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </div>
        )}
      </div>
      {(!isCollapsible || isOpen) && <div className="p-4 bg-card-secondary">{children}</div>}
    </section>
  );
};

export default StepCard;
