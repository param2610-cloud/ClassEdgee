import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";

interface StatCardProps {
  label: string;
  value?: string | number | null;
  trend?: number;
  trendLabel?: string;
  icon?: LucideIcon;
  variant?: "default" | "danger" | "warning" | "success";
}

const variantClasses: Record<NonNullable<StatCardProps["variant"]>, string> = {
  default: "",
  danger: "border-red-300",
  warning: "border-amber-300",
  success: "border-green-300",
};

const StatCard = ({
  label,
  value,
  trend,
  trendLabel,
  icon: Icon,
  variant = "default",
}: StatCardProps) => {
  if (value === undefined || value === null) {
    return <LoadingSkeleton variant="stat" />;
  }

  const isPositive = typeof trend === "number" && trend >= 0;

  return (
    <Card className={cn("h-full", variantClasses[variant])}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
          <span>{label}</span>
          {Icon ? <Icon className="h-4 w-4" /> : null}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        {typeof trend === "number" ? (
          <div
            className={cn(
              "mt-2 flex items-center gap-1 text-xs",
              isPositive ? "text-green-700" : "text-red-700"
            )}
          >
            {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            <span>{isPositive ? "+" : ""}{trend}%</span>
            {trendLabel ? <span className="text-muted-foreground">{trendLabel}</span> : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default StatCard;
