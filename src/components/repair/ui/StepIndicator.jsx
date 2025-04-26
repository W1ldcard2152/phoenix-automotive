import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="relative flex justify-between">
      {/* Progress Bar */}
      <div className="absolute top-5 left-0 h-0.5 w-full bg-muted">
        <div
          className="absolute h-full bg-primary transition-all duration-500 ease-in-out"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="relative flex w-full justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > index + 1;
          const isCurrent = currentStep === index + 1;

          return (
            <div
              key={step.label}
              className={cn(
                "flex flex-col items-center space-y-2",
                (isCompleted || isCurrent) ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative bg-background p-1">
                {isCompleted ? (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                ) : (
                  <Circle
                    className={cn(
                      "h-6 w-6",
                      isCurrent ? "text-primary" : "text-muted-foreground"
                    )}
                    fill={isCurrent ? "currentColor" : "none"}
                  />
                )}
              </div>
              <span className="text-sm font-medium">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;