import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const ContactInfoStep = ({
  customerInfo,
  onCustomerInfoChange,
  formatPhoneNumber,
  onNext,
  onBack,
  errors
}) => {
  const handleInputChange = (field) => (e) => {
    onCustomerInfoChange({ [field]: e.target.value });
  };
  
  const handleAddressChange = (field) => (e) => {
    onCustomerInfoChange({
      address: {
        ...customerInfo.address,
        [field]: e.target.value
      }
    });
  };
  
  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    onCustomerInfoChange({ phone: formatted });
  };

  const getFieldError = (field) => {
    return errors[`customerInfo.${field}`];
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Contact Information</h2>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={customerInfo.name}
          onChange={handleInputChange('name')}
          placeholder="Enter your full name"
          required
        />
        {getFieldError('name') && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{getFieldError('name')}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Phone & Email */}
      <div className="space-y-2 mb-4">
        <p className="text-sm text-muted-foreground">
          Please provide at least one contact method (phone or email) so we can reach you.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={customerInfo.phone}
            onChange={handlePhoneChange}
            placeholder="(555) 555-5555"
          />
          {getFieldError('phone') && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{getFieldError('phone')}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={customerInfo.email}
            onChange={handleInputChange('email')}
            placeholder="your.email@example.com"
          />
          {getFieldError('email') && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{getFieldError('email')}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Optional Address section - Collapsible */}
      <div className="pt-2">
        <p className="text-sm text-muted-foreground mb-3">
          Address is optional but helps us better serve you
        </p>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              value={customerInfo.address.street}
              onChange={handleAddressChange('street')}
              placeholder="Street address"
            />
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={customerInfo.address.city}
                onChange={handleAddressChange('city')}
                placeholder="City"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={customerInfo.address.state}
                onChange={handleAddressChange('state')}
                placeholder="State"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={customerInfo.address.zipCode}
                onChange={handleAddressChange('zipCode')}
                placeholder="ZIP Code"
              />
            </div>
          </div>
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
          Review Request
        </Button>
      </div>
    </div>
  );
};

export default ContactInfoStep;