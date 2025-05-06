import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const serviceTypes = [
  'Diagnostic',
  'Engine Repair',
  'Transmission Repair',
  'Brake Service',
  'Suspension Work',
  'Electrical Repair',
  'AC/Heating Service',
  'Scheduled Maintenance',
  'State Inspection',
  'Other'
];

const urgencyLevels = [
  { value: 'Low', label: 'Low - No rush, schedule when convenient' },
  { value: 'Medium', label: 'Medium - Schedule within the next week' },
  { value: 'High', label: 'High - Need service as soon as possible' },
  { value: 'Emergency', label: 'Emergency - Vehicle not drivable' }
];

const ServiceInfoStep = ({
  serviceInfo,
  onServiceInfoChange,
  onNext,
  onBack,
  errors
}) => {
  const [showOtherService, setShowOtherService] = useState(serviceInfo.serviceType === 'Other');

  const handleInputChange = (field) => (e) => {
    onServiceInfoChange({ [field]: e.target.value });
  };

  const handleSelectChange = (field, value) => {
    onServiceInfoChange({ [field]: value });
    
    if (field === 'serviceType') {
      setShowOtherService(value === 'Other');
    }
  };

  const getFieldError = (field) => {
    return errors[`serviceInfo.${field}`];
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Service Information</h2>

      {/* Service Type */}
      <div className="space-y-2">
        <Label htmlFor="serviceType">Service Type</Label>
        <Select
          value={serviceInfo.serviceType}
          onValueChange={(value) => handleSelectChange('serviceType', value)}
        >
          <SelectTrigger id="serviceType">
            <SelectValue placeholder="Select a service type" />
          </SelectTrigger>
          <SelectContent>
            {serviceTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {getFieldError('serviceType') && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{getFieldError('serviceType')}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Other Service Type (conditional) */}
      {showOtherService && (
        <div className="space-y-2">
          <Label htmlFor="otherServiceType">Specify Service Type</Label>
          <Input
            id="otherServiceType"
            value={serviceInfo.otherServiceType}
            onChange={handleInputChange('otherServiceType')}
            placeholder="Please specify the service you need"
          />
          {getFieldError('otherServiceType') && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{getFieldError('otherServiceType')}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Service Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Describe the service needed or issue you're experiencing</Label>
        <Textarea
          id="description"
          value={serviceInfo.description}
          onChange={handleInputChange('description')}
          placeholder="Please provide details about the issue or service needed..."
          className="min-h-[100px]"
        />
        {getFieldError('description') && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{getFieldError('description')}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Date and Urgency Fields with adjusted layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-12"> {/* Add a fixed-height container for the label */}
            <Label htmlFor="preferredDate">Preferred Service Date (Leave blank for soonest available)</Label>
          </div>
          <Input
            id="preferredDate"
            type="date"
            value={formatDate(serviceInfo.preferredDate)}
            onChange={handleInputChange('preferredDate')}
            min={formatDate(new Date())}
          />
        </div>

        <div className="space-y-2">
          <div className="h-12"> {/* Add a fixed-height container for the label */}
            <Label htmlFor="urgency">Service Urgency</Label>
          </div>
          <Select
            value={serviceInfo.urgency}
            onValueChange={(value) => handleSelectChange('urgency', value)}
          >
            <SelectTrigger id="urgency">
              <SelectValue placeholder="Select urgency level" />
            </SelectTrigger>
            <SelectContent>
              {urgencyLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between pt-6 mt-6 border-t">
        <Button
          type="button" 
          variant="outline"
          onClick={onBack}
        >
          Back
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

export default ServiceInfoStep;