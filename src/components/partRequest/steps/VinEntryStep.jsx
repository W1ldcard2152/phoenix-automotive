import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { handleVinDecode, validateVinFormat } from '@/utils/vinUtils';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsChecking(true);
    setLocalError('');

    try {
      // Just pass the VIN string to the parent's onVinSubmit
      await onVinSubmit(localVin);
    } catch (err) {
      console.error('VIN submission error:', err);
      setLocalError(err.message || 'Failed to process VIN');
    } finally {
      setIsChecking(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value.toUpperCase();
    setLocalVin(value);
    onVinChange(value);
    setIsValid(validateVinFormat(value));
    setLocalError('');
  };

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
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{displayError}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        className="w-full"
        disabled={!isValid || isLoading || isChecking}
      >
        {isChecking ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Decoding VIN...
          </>
        ) : (
          'Continue'
        )}
      </Button>

      <div className="text-sm text-muted-foreground space-y-2">
        <p>Common VIN locations:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Driver's side dashboard (visible through windshield)</li>
          <li>Driver's side door jamb</li>
          <li>Vehicle registration document</li>
          <li>Insurance card</li>
        </ul>
      </div>
    </form>
  );
};

export default VinEntryStep;