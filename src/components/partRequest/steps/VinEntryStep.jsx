import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { validateVinFormat } from '@/utils/vinUtils';
import FormNavigation from '../ui/FormNavigation';

const VinEntryStep = ({
  vin,
  onVinChange,
  onVinSubmit,
  isLoading,
  error
}) => {
  const [localVin, setLocalVin] = useState(vin || '');
  const [isValid, setIsValid] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [localError, setLocalError] = useState('');
  const [showRetryButton, setShowRetryButton] = useState(false);
  const [submitAttempts, setSubmitAttempts] = useState(0);

  // Update local state when prop changes
  useEffect(() => {
    if (vin !== localVin) {
      setLocalVin(vin || '');
      setIsValid(validateVinFormat(vin));
    }
  }, [vin]);

  // Reset error state when user makes changes
  useEffect(() => {
    setLocalError('');
    setShowRetryButton(false);
  }, [localVin]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsChecking(true);
    setLocalError('');
    setShowRetryButton(false);

    try {
      // Update attempts counter
      setSubmitAttempts(prev => prev + 1);
      
      // Extra validation before submission
      if (!validateVinFormat(localVin)) {
        throw new Error('Please enter a valid 17-character VIN');
      }
      
      console.log(`Submitting VIN: ${localVin} (Attempt #${submitAttempts + 1})`);
      await onVinSubmit(localVin);
    } catch (err) {
      console.error('VIN submission error:', err);
      
      // Provide more user-friendly error messages
      let userMessage = err.message || 'Failed to process VIN';
      let shouldShowRetry = false;
      
      // Handle specific error types
      if (userMessage.includes('JSON.parse') || 
          userMessage.includes('HTML content') || 
          userMessage.includes('network') ||
          userMessage.includes('timed out')) {
        userMessage = 'Vehicle database service is temporarily unavailable. Please try again later.';
        shouldShowRetry = true;
      }
      
      setLocalError(userMessage);
      setShowRetryButton(shouldShowRetry);
    } finally {
      setIsChecking(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value.toUpperCase();
    setLocalVin(value);
    onVinChange(value);
    setIsValid(validateVinFormat(value));
  };

  // Combine local and prop errors
  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="vin">Vehicle Identification Number (VIN)</Label>
        <div className="relative">
          <Input
            id="vin"
            placeholder="Enter 17-character VIN"
            value={localVin}
            onChange={handleChange}
            maxLength={17}
            className={`font-mono uppercase pr-10 ${
              localVin.length === 17 ? (isValid ? 'border-green-500' : 'border-red-500') : ''
            }`}
            aria-invalid={localVin.length === 17 && !isValid}
            aria-describedby={displayError ? "vin-error" : undefined}
            disabled={isLoading || isChecking}
          />
          {localVin.length === 17 && (
            <div className="absolute right-3 top-2.5">
              {isValid ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Your VIN can be found on your registration, insurance card, or driver's side door frame
        </p>
      </div>

      {displayError && (
        <Alert variant="destructive" id="vin-error">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{displayError}</AlertDescription>
          {showRetryButton && submitAttempts > 0 && (
            <div className="mt-2">
              <button
                type="button"
                className="text-sm underline hover:no-underline"
                onClick={handleSubmit}
              >
                Try again
              </button>
            </div>
          )}
        </Alert>
      )}

      <div className="text-sm text-muted-foreground space-y-2">
        <p>Common VIN locations:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Driver's side dashboard (visible through windshield)</li>
          <li>Driver's side door jamb</li>
          <li>Vehicle registration document</li>
          <li>Insurance card</li>
        </ul>
      </div>

      <FormNavigation
        onNext={handleSubmit}
        canGoBack={false}
        canGoNext={isValid && !isLoading && !isChecking}
        nextLabel={isChecking ? "Decoding VIN..." : "Continue"}
        isLoading={isChecking}
        nextIcon={isChecking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : undefined}
      />
    </form>
  );
};

export default VinEntryStep;