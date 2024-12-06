import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiClient } from '../utils/apiClient';

const VEHICLE_SYSTEMS = {
  'Interior': [
    'Seats', 'Dashboard', 'Console', 'Door Panels', 'Carpet',
    'Headliner', 'Mirror', 'Radio/Navigation', 'Climate Control',
    'Other Interior Part'
  ],
  'Exterior': [
    'Hood', 'Front Bumper', 'Rear Bumper', 'Front Door', 'Rear Door',
    'Fender', 'Quarter Panel', 'Trunk/Hatch', 'Grille', 'Headlight',
    'Tail Light', 'Side Mirror', 'Other Exterior Part'
  ],
  'Electrical': [
    'Battery', 'Alternator', 'Starter', 'Window Motor', 'Door Lock',
    'ECU/Computer', 'Wiring Harness', 'Sensors', 'Other Electrical Part'
  ],
  'Steering/Suspension': [
    'Power Steering Pump', 'Rack and Pinion', 'Control Arm',
    'Strut/Shock', 'Steering Wheel', 'Ball Joint', 'Tie Rod',
    'Sway Bar', 'Other Steering/Suspension Part'
  ],
  'Engine/Accessories': [
    'Engine Assembly', 'Cylinder Head', 'Engine Block', 'Valve Cover',
    'Intake Manifold', 'Exhaust Manifold', 'Turbocharger',
    'Fuel Injector', 'Fuel Pump', 'Water Pump', 'Other Engine Part'
  ],
  'Transmission/Drivetrain': [
    'Transmission Assembly', 'Transfer Case', 'Differential',
    'Axle Assembly', 'CV Axle', 'Flywheel', 'Torque Converter',
    'Other Drivetrain Part'
  ],
  'Wheels/Tires': [
    'Wheel/Rim', 'Tire', 'TPMS Sensor', 'Hub/Bearing Assembly',
    'Center Cap', 'Other Wheel Part'
  ],
  'Other': ['Other Vehicle Part']
};

const PartsRequest = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    vin: '',
    vehicleInfo: {
      year: '',
      make: '',
      model: '',
      trim: '',
      engineSize: ''
    },
    partDetails: {
      system: '',
      component: '',
      otherComponent: '',
      additionalInfo: ''
    },
    customerInfo: {
      name: '',
      phone: '',
      email: ''
    }
  });

  const decodeVin = async (vin) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
      );
      const data = await response.json();
      
      if (data.Results) {
        const year = data.Results.find(item => item.Variable === "Model Year")?.Value;
        const make = data.Results.find(item => item.Variable === "Make")?.Value;
        const model = data.Results.find(item => item.Variable === "Model")?.Value;
        const trim = data.Results.find(item => item.Variable === "Trim")?.Value;
        const displacement = data.Results.find(item => item.Variable === "Displacement (L)")?.Value;
        const cylinders = data.Results.find(item => item.Variable === "Engine Number of Cylinders")?.Value;
        const engineSize = displacement && cylinders 
          ? `${Number(displacement).toFixed(1)}L ${cylinders}-Cylinder` 
          : 'Not Available';

        setFormData(prev => ({
          ...prev,
          vin,
          vehicleInfo: {
            year,
            make,
            model,
            trim: trim || '',
            engineSize
          }
        }));

        return true;
      }
      return false;
    } catch (err) {
      setError("Error decoding VIN: " + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleVinSubmit = async () => {
    if (formData.vin.length !== 17) {
      setError("Please enter a valid 17-character VIN");
      return;
    }
    
    const success = await decodeVin(formData.vin);
    if (success) {
      nextStep();
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.partRequests.create(formData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit request');
      }
      
      setSuccess(true);
      // Could redirect or show success message here
    } catch (err) {
      setError(err.message);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, section) => (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSelectChange = (value, field, section) => {
    if (field === 'system') {
      setFormData(prev => ({
        ...prev,
        partDetails: {
          ...prev.partDetails,
          system: value,
          component: '',
          otherComponent: ''
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <CardHeader>
              <CardTitle>Enter Vehicle VIN</CardTitle>
              <CardDescription>
                Please enter your Vehicle Identification Number (VIN).
                This can be found on your registration, dashboard, or driver&apos;s door frame.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vin">Vehicle VIN</Label>
                  <Input
                    id="vin"
                    name="vin"
                    value={formData.vin}
                    onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value }))}
                    placeholder="17-character VIN"
                    maxLength={17}
                    className="uppercase"
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                disabled={true}
              >
                Previous
              </Button>
              <Button 
                onClick={handleVinSubmit}
                disabled={loading || formData.vin.length !== 17}
              >
                {loading ? 'Checking VIN...' : 'Next'}
              </Button>
            </CardFooter>
          </>
        );

      case 2:
        return (
          <>
            <CardHeader>
              <CardTitle>Verify Vehicle Information</CardTitle>
              <CardDescription>
                Please verify the information decoded from your VIN is correct.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Year</Label>
                    <p className="mt-1 text-gray-600">{formData.vehicleInfo.year}</p>
                  </div>
                  <div>
                    <Label>Make</Label>
                    <p className="mt-1 text-gray-600">{formData.vehicleInfo.make}</p>
                  </div>
                  <div>
                    <Label>Model</Label>
                    <p className="mt-1 text-gray-600">{formData.vehicleInfo.model}</p>
                  </div>
                  <div>
                    <Label>Trim</Label>
                    <p className="mt-1 text-gray-600">{formData.vehicleInfo.trim || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <Label>Engine</Label>
                    <p className="mt-1 text-gray-600">{formData.vehicleInfo.engineSize}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>Previous</Button>
              <Button onClick={nextStep}>Next</Button>
            </CardFooter>
          </>
        );

      case 3:
        return (
          <>
            <CardHeader>
              <CardTitle>Select Part Category</CardTitle>
              <CardDescription>
                Choose the system and specific component you need.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>System</Label>
                  <Select
                    value={formData.partDetails.system}
                    onValueChange={(value) => handleSelectChange(value, 'system', 'partDetails')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select system" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {Object.keys(VEHICLE_SYSTEMS).map(system => (
                        <SelectItem key={system} value={system}>
                          {system}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.partDetails.system && (
                  <div className="space-y-2">
                    <Label>Component</Label>
                    <Select
                      value={formData.partDetails.component}
                      onValueChange={(value) => handleSelectChange(value, 'component', 'partDetails')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select component" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {VEHICLE_SYSTEMS[formData.partDetails.system].map(component => (
                          <SelectItem key={component} value={component}>
                            {component}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.partDetails.component?.includes('Other') && (
                  <div className="space-y-2">
                    <Label>Specify Component</Label>
                    <Input
                      name="otherComponent"
                      value={formData.partDetails.otherComponent}
                      onChange={handleInputChange('otherComponent', 'partDetails')}
                      placeholder="Enter component name"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Additional Information</Label>
                  <Textarea
                    name="additionalInfo"
                    value={formData.partDetails.additionalInfo}
                    onChange={handleInputChange('additionalInfo', 'partDetails')}
                    placeholder="Any additional details about the part you need..."
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>Previous</Button>
              <Button 
                onClick={nextStep}
                disabled={!formData.partDetails.system || !formData.partDetails.component || 
                  (formData.partDetails.component?.includes('Other') && !formData.partDetails.otherComponent)}
              >
                Next
              </Button>
            </CardFooter>
          </>
        );

      case 4:
        return (
          <>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Please provide your contact details so we can reach you about this part.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Full Name</Label>
                  <Input
                    id="customerName"
                    name="name"
                    value={formData.customerInfo.name}
                    onChange={handleInputChange('name', 'customerInfo')}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.customerInfo.phone}
                    onChange={handleInputChange('phone', 'customerInfo')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.customerInfo.email}
                    onChange={handleInputChange('email', 'customerInfo')}
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <AlertDescription>
                      Your part request has been submitted successfully. We will contact you shortly.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>Previous</Button>
              <Button 
                onClick={handleSubmit}
                disabled={loading || !formData.customerInfo.name || 
                  !formData.customerInfo.phone || !formData.customerInfo.email}
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </CardFooter>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative bg-[#1a1f2e] py-16">
        <div className="absolute inset-0">
          <img
            src="/images/parts-request-bg.jpg"
            alt="Parts Request Background"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        </div>
        <div className="relative">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Request Parts</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Looking for a specific part? Fill out our request form below and our team will check availability and contact you with pricing.
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto shadow-xl">
          {renderStep()}
        </Card>
      </div>
    </div>
  );
};

export default PartsRequest;
