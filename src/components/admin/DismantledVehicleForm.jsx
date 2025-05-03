// src/components/admin/DismantledVehicleForm.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Image, Loader2, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import ImageUpload from '../shared/ImageUpload';
import { handleVinDecode } from '@/utils/vinUtils';

const DismantledVehicleForm = ({ initialData, onSubmit, onCancel }) => {
  const [vehicle, setVehicle] = useState({
    stockNumber: '',
    year: '',
    make: '',
    model: '',
    trim: '',
    vin: '',
    mileage: '',
    dateAcquired: new Date().toISOString().split('T')[0],
    status: 'Awaiting Dismantle',
    imageUrl: '',
    exteriorColor: '',
    interiorColor: '',
    transmission: '',
    engineType: '',
    driveType: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDecodingVin, setIsDecodingVin] = useState(false);
  const [vinError, setVinError] = useState(null);

  useEffect(() => {
    if (initialData) {
      const formattedDate = initialData.dateAcquired 
        ? new Date(initialData.dateAcquired).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      setVehicle({
        ...initialData,
        dateAcquired: formattedDate,
        year: initialData.year?.toString() || '',
        mileage: initialData.mileage?.toString() || ''
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = {
        ...vehicle,
        year: parseInt(vehicle.year),
        mileage: parseInt(vehicle.mileage.toString().replace(/,/g, '')),
        dateAcquired: new Date(vehicle.dateAcquired).toISOString()
      };

      await onSubmit(formData);
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to save vehicle: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUploaded = (url) => {
    setVehicle(prev => ({ ...prev, imageUrl: url }));
  };

  const handleVinDecodeClick = async () => {
    if (!vehicle.vin || vehicle.vin.length !== 17) {
      setVinError('Please enter a valid 17-character VIN');
      return;
    }

    setIsDecodingVin(true);
    setVinError(null);

    try {
      // Use the existing handleVinDecode function from vinUtils.js
      const vehicleInfo = await handleVinDecode(vehicle.vin);
      
      if (vehicleInfo) {
        setVehicle(prev => ({
          ...prev,
          year: vehicleInfo.year?.toString() || prev.year,
          make: vehicleInfo.make || prev.make,
          model: vehicleInfo.model || prev.model,
          trim: vehicleInfo.trim || prev.trim,
          engineType: vehicleInfo.engineSize || prev.engineType,
          transmission: vehicleInfo.transmissionType || prev.transmission,
          driveType: vehicleInfo.driveType || prev.driveType
        }));
      }
    } catch (error) {
      console.error('VIN decode error:', error);
      setVinError(error.message || 'Unable to decode VIN');
    } finally {
      setIsDecodingVin(false);
    }
  };

  // Format date input
  const handleDateChange = (e) => {
    const value = e.target.value;
    
    // If it looks like MM/DD/YY or MM/DD/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(value)) {
      const [month, day, year] = value.split('/');
      let formattedYear = year;
      
      // Convert 2-digit year to 4-digit year
      if (year.length === 2) {
        const currentYear = new Date().getFullYear();
        const century = Math.floor(currentYear / 100) * 100;
        const twoDigitYear = parseInt(year, 10);
        
        // If the 2-digit year is greater than the current 2-digit year + 10, assume previous century
        const currentTwoDigitYear = currentYear % 100;
        formattedYear = twoDigitYear > currentTwoDigitYear + 10 
          ? (century - 100) + twoDigitYear 
          : century + twoDigitYear;
      }
      
      // Create a date string in YYYY-MM-DD format
      const formattedDate = `${formattedYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      setVehicle(prev => ({ ...prev, dateAcquired: formattedDate }));
    } else {
      // Otherwise just set the value as is (allows for direct date input)
      setVehicle(prev => ({ ...prev, dateAcquired: value }));
    }
  };

  // VIN input handler that removes non-alphanumeric characters
  const handleVinChange = (e) => {
    const input = e.target.value;
    // Remove any characters that aren't letters or numbers
    // Also convert to uppercase
    const cleanedVin = input.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    setVehicle(prev => ({ ...prev, vin: cleanedVin }));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        {initialData ? 'Edit Vehicle' : 'Add New Dismantled Vehicle'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stockNumber">Stock Number *</Label>
              <Input
                id="stockNumber"
                value={vehicle.stockNumber}
                onChange={e => setVehicle(prev => ({ ...prev, stockNumber: e.target.value }))}
                required
              />
            </div>
            
            {/* VIN with decode button */}
            <div className="space-y-2">
              <Label htmlFor="vin">VIN *</Label>
              <div className="flex space-x-2">
                <Input
                  id="vin"
                  value={vehicle.vin}
                  onChange={handleVinChange}
                  maxLength={17}
                  className="uppercase"
                  required
                />
                <Button 
                  type="button" 
                  onClick={handleVinDecodeClick}
                  disabled={isDecodingVin || !vehicle.vin || vehicle.vin.length !== 17}
                  className="border border-input"
                >
                  {isDecodingVin ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> 
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Decode
                </Button>
              </div>
              {vinError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{vinError}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                value={vehicle.year}
                onChange={e => setVehicle(prev => ({ ...prev, year: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="make">Make *</Label>
              <Input
                id="make"
                value={vehicle.make}
                onChange={e => setVehicle(prev => ({ ...prev, make: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={vehicle.model}
                onChange={e => setVehicle(prev => ({ ...prev, model: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="trim">Trim</Label>
              <Input
                id="trim"
                value={vehicle.trim}
                onChange={e => setVehicle(prev => ({ ...prev, trim: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mileage">Mileage *</Label>
              <Input
                id="mileage"
                value={vehicle.mileage}
                onChange={e => setVehicle(prev => ({ ...prev, mileage: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateAcquired">Date Acquired *</Label>
              <Input
                id="dateAcquired"
                type="date"
                value={vehicle.dateAcquired}
                onChange={handleDateChange}
                onKeyDown={(e) => {
                  // Allow typing directly by not preventing default behavior
                }}
                required
              />
              <p className="text-xs text-muted-foreground">
                You can type MM/DD/YY or MM/DD/YYYY format directly
              </p>
            </div>
          </div>
        </div>

        {/* Vehicle Details Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Vehicle Details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={vehicle.status}
                onValueChange={(value) => setVehicle(prev => ({ ...prev, status: value }))}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Awaiting Dismantle">Awaiting Dismantle</SelectItem>
                  <SelectItem value="Parts Available">Parts Available</SelectItem>
                  <SelectItem value="Scrapped">Scrapped</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="exteriorColor">Exterior Color</Label>
              <Input
                id="exteriorColor"
                value={vehicle.exteriorColor}
                onChange={e => setVehicle(prev => ({ ...prev, exteriorColor: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interiorColor">Interior Color</Label>
              <Input
                id="interiorColor"
                value={vehicle.interiorColor}
                onChange={e => setVehicle(prev => ({ ...prev, interiorColor: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transmission">Transmission</Label>
              <Select
                value={vehicle.transmission}
                onValueChange={(value) => setVehicle(prev => ({ ...prev, transmission: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select transmission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Automatic">Automatic</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="CVT">CVT</SelectItem>
                  <SelectItem value="Dual Clutch">Dual Clutch</SelectItem>
                  <SelectItem value="Single Clutch Automatic">Single Clutch Automatic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="engineType">Engine</Label>
              <Input
                id="engineType"
                value={vehicle.engineType}
                onChange={e => setVehicle(prev => ({ ...prev, engineType: e.target.value }))}
                placeholder="e.g. 2.5L 4-cylinder"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="driveType">Drive Type</Label>
              <Select
                value={vehicle.driveType}
                onValueChange={(value) => setVehicle(prev => ({ ...prev, driveType: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select drive type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FWD">Front Wheel Drive (FWD)</SelectItem>
                  <SelectItem value="RWD">Rear Wheel Drive (RWD)</SelectItem>
                  <SelectItem value="AWD">All Wheel Drive (AWD)</SelectItem>
                  <SelectItem value="4WD">Four Wheel Drive (4WD)</SelectItem>
                  <SelectItem value="4x4">4x4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Vehicle Image Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Vehicle Image</h3>
          <div className="space-y-2">
            <ImageUpload onImageUploaded={handleImageUploaded} />
            {vehicle.imageUrl && (
              <div className="mt-4">
                <img 
                  src={vehicle.imageUrl} 
                  alt="Vehicle preview" 
                  className="max-w-sm rounded-lg border"
                />
              </div>
            )}
          </div>
        </div>

        {/* Notes Section */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={vehicle.notes}
            onChange={e => setVehicle(prev => ({ ...prev, notes: e.target.value }))}
            className="min-h-[100px]"
            placeholder="Enter any additional information about the vehicle"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="border border-input"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : initialData ? 'Update Vehicle' : 'Add Vehicle'}
          </Button>
        </div>
      </form>
    </div>
  );
};

DismantledVehicleForm.propTypes = {
  initialData: PropTypes.shape({
    stockNumber: PropTypes.string,
    make: PropTypes.string,
    model: PropTypes.string,
    trim: PropTypes.string,
    year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    vin: PropTypes.string,
    mileage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
    dateAcquired: PropTypes.string,
    imageUrl: PropTypes.string,
    exteriorColor: PropTypes.string,
    interiorColor: PropTypes.string,
    transmission: PropTypes.string,
    engineType: PropTypes.string,
    driveType: PropTypes.string,
    notes: PropTypes.string
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

DismantledVehicleForm.defaultProps = {
  initialData: null
};

export default DismantledVehicleForm;