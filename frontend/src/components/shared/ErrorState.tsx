import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <AlertCircle className="mx-auto mb-3 h-7 w-7 text-red-600" />
      <p className="text-sm text-red-700">{message}</p>
      {onRetry ? (
        <div className="mt-4">
          <Button onClick={onRetry} variant="outline" className="border-red-300 text-red-700">
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default ErrorState;
