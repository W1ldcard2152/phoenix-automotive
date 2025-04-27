import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="relative mb-14">
      {/* Dominos-style tracker */}
      <div className="relative h-14 bg-[#1a1f2e] rounded-full overflow-hidden">
        {/* Progress fill */}
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#1a1f2e] to-red-700 transition-all duration-500 ease-in-out rounded-full"
          style={{ width: `${((currentStep / steps.length) * 100)}%` }}
        />

        <div className="absolute inset-0">
          {/* Connecting lines between circles - no gaps */}
          <div className="absolute top-1/2 h-1 bg-white transform -translate-y-1/2 z-0" 
               style={{ left: 'calc(0% + 24px)', right: 'calc(0% + 24px)' }} />

          {/* Step indicators */}
          <div className="absolute inset-0 flex items-center justify-between px-4">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isCompleted = currentStep > stepNumber;
              const isCurrent = currentStep === stepNumber;

              return (
                <div key={step.label} className="relative z-10 flex items-center">
                  {/* Step number or check icon */}
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm transition-colors shadow-md",
                      isCompleted ? "bg-green-600" : 
                      isCurrent ? "bg-red-700 ring-2 ring-white" : 
                      "bg-gray-500"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      stepNumber
                    )}
                  </div>

                  {/* Label under the step */}
                  <div 
                    className={cn(
                      "absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium text-center w-16 sm:w-auto",
                      isCompleted ? "text-green-700" :
                      isCurrent ? "text-red-700 font-bold" :
                      "text-gray-500"
                    )}
                  >
                    {step.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;