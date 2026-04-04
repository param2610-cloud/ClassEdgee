import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type LoadingVariant = "card" | "table" | "list" | "stat";

interface LoadingSkeletonProps {
  variant?: LoadingVariant;
  rows?: number;
  className?: string;
}

const LoadingSkeleton = ({
  variant = "card",
  rows = 3,
  className,
}: LoadingSkeletonProps) => {
  if (variant === "stat") {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader className="space-y-2 pb-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24" />
        </CardContent>
      </Card>
    );
  }

  if (variant === "table") {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-9 w-full" />
          {Array.from({ length: rows }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-3", className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
