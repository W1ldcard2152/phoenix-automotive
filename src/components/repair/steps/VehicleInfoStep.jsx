import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Search } from "lucide-react";
import { useBreakpoint } from '@/hooks/useBreakpoint';

const VehicleInfoStep = ({
  vehicleInfo,
  onVehicleInfoChange,
  onVinLookup,
  onNext,
  onCancel,
  errors,
  isLoading
}) => {
  const { isMobile } = useBreakpoint();
  const [localVin, setLocalVin] = useState(vehicleInfo.vin || '');

  // Update local state when VIN prop changes
  useEffect(() => {
    setLocalVin(vehicleInfo.vin || '');
  }, [vehicleInfo.vin]);

  const handleChange = (field) => (e) => {
    onVehicleInfoChange({ [field]: e.target.value });
  };

  const handleVinChange = (e) => {
    const value = e.target.value.toUpperCase();
    setLocalVin(value);
    onVehicleInfoChange({ vin: value });
  };

  const handleVinLookup = async () => {
    if (localVin && localVin.length === 17) {
      await onVinLookup(localVin);
    }
  };

  const getFieldError = (field) => {
    return errors?.[`vehicleInfo.${field}`];
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Vehicle Information</h2>

      {/* VIN with lookup feature */}
      <div className="space-y-2">
        <Label htmlFor="vin">Vehicle Identification Number (VIN)</Label>
        <div className={`${isMobile ? 'flex flex-col space-y-2' : 'flex space-x-2'}`}>
          <Input
            id="vin"
            value={localVin}
            onChange={handleVinChange}
            placeholder="Enter 17-character VIN"
            className="font-sans uppercase"
            maxLength={17}
          />
          <Button
            type="button"
            variant="default"
            className={`bg-red-600 hover:bg-red-700 text-white font-medium relative overflow-hidden transition-all ${isMobile ? 'w-full' : 'min-w-[140px]'}`}
            disabled={!localVin || localVin.length !== 17 || isLoading}
            onClick={handleVinLookup}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-5 w-5 mr-2" />
                Decode VIN
              </>
            )}
            {localVin.length === 17 && !isLoading && (
              <span className="absolute inset-0 bg-green-500/10 animate-pulse rounded-md"></span>
            )}
          </Button>
        </div>
        {getFieldError('vin') && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{getFieldError('vin')}</AlertDescription>
          </Alert>
        )}
        <p className="text-sm text-muted-foreground">
          Your VIN can be found on your registration, insurance card, or driver's side door jamb
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Year */}
        <div className="space-y-2">
          <Label htmlFor="year">Year *</Label>
          <Input
            id="year"
            value={vehicleInfo.year}
            onChange={handleChange('year')}
            placeholder="e.g. 2020"
            required
          />
          {getFieldError('year') && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{getFieldError('year')}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Make */}
        <div className="space-y-2">
          <Label htmlFor="make">Make *</Label>
          <Input
            id="make"
            value={vehicleInfo.make}
            onChange={handleChange('make')}
            placeholder="e.g. Toyota"
            required
          />
          {getFieldError('make') && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{getFieldError('make')}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Model */}
        <div className="space-y-2">
          <Label htmlFor="model">Model *</Label>
          <Input
            id="model"
            value={vehicleInfo.model}
            onChange={handleChange('model')}
            placeholder="e.g. Camry"
            required
          />
          {getFieldError('model') && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{getFieldError('model')}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Trim */}
        <div className="space-y-2">
          <Label htmlFor="trim">Trim</Label>
          <Input
            id="trim"
            value={vehicleInfo.trim}
            onChange={handleChange('trim')}
            placeholder="e.g. SE, Limited, etc."
          />
        </div>

        {/* Mileage */}
        <div className="space-y-2">
          <Label htmlFor="mileage">Current Mileage</Label>
          <Input
            id="mileage"
            value={vehicleInfo.mileage}
            onChange={handleChange('mileage')}
            placeholder="e.g. 45000"
          />
          {getFieldError('mileage') && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{getFieldError('mileage')}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Engine Type */}
        <div className="space-y-2">
          <Label htmlFor="engineSize">Engine Type</Label>
          <Input
            id="engineSize"
            value={vehicleInfo.engineSize}
            onChange={handleChange('engineSize')}
            placeholder="e.g. 2.5L 4-cylinder"
          />
        </div>
      </div>

      {/* Required field legend */}
      <p className="text-sm text-muted-foreground mt-4">
        * Required fields
      </p>

      <div className="flex justify-between pt-6 mt-6 border-t">
        <Button
          type="button" 
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          type="button"
          onClick={onNext}
          className="border border-primary"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default VehicleInfoStep;