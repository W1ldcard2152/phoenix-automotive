import { Button } from "@/components/ui/button";

const FormNavigation = ({
  onNext,
  onBack,
  canGoNext = true,
  canGoBack = true,
  nextLabel = "Continue",
  backLabel = "Back",
  isLoading = false,
  nextIcon = null
}) => {
  return (
    <div className="flex justify-between pt-6 mt-6 border-t">
      {canGoBack && (
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
        >
          {backLabel}
        </Button>
      )}
      <Button
        onClick={onNext}
        disabled={!canGoNext || isLoading}
        className={`border border-primary ${canGoBack ? "" : "ml-auto"}`}
      >
        {nextIcon}
        {nextLabel}
      </Button>
    </div>
  );
};

export default FormNavigation;