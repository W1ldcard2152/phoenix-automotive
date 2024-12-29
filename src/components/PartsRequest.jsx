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
import { ResponsiveContainer } from '@/components/layout';
import { useBreakpoint } from '@/hooks/useBreakpoint';
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
  const { isMobile } = useBreakpoint();
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

  // VIN Decoding Function
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

  // Form Submission Handler
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const requestData = {
        vin: formData.vin,
        vehicleInfo: {
          year: parseInt(formData.vehicleInfo.year),
          make: formData.vehicleInfo.make,
          model: formData.vehicleInfo.model,
          trim: formData.vehicleInfo.trim,
          engineSize: formData.vehicleInfo.engineSize
        },
        partDetails: {
          system: formData.partDetails.system,
          component: formData.partDetails.component,
          otherComponent: formData.partDetails.component?.includes('Other') 
            ? formData.partDetails.otherComponent 
            : undefined,
          additionalInfo: formData.partDetails.additionalInfo
        },
        customerInfo: {
          name: formData.customerInfo.name,
          phone: formData.customerInfo.phone,
          email: formData.customerInfo.email.toLowerCase()
        }
      };

      const response = await apiClient.partRequests.create(requestData);
      
      if (!response.ok) {
        throw new Error('Failed to submit part request');
      }
      
      setSuccess(true);
      setFormData({
        vin: '',
        vehicleInfo: { year: '', make: '', model: '', trim: '', engineSize: '' },
        partDetails: { system: '', component: '', otherComponent: '', additionalInfo: '' },
        customerInfo: { name: '', phone: '', email: '' }
      });
      
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Form Input Handlers
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

  // Navigation Handlers
  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  // Step Renderer
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <CardHeader>
              <CardTitle>Enter Vehicle VIN</CardTitle>
              <CardDescription>
                Please enter your Vehicle Identification Number (VIN).
                This can be found on your registration, dashboard, or driver's door frame.
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
                    onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value.toUpperCase() }))}
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

      // ... [Rest of the step cases remain the same]
    }
  };

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Hero Banner */}
      <div className="relative bg-[#1a1f2e]">
        <div className="relative h-[400px] md:h-[400px] overflow-hidden">
          <img
            src="/images/parts-page-bg.jpg"
            alt="Parts Request Background"
            className="absolute inset-0 w-full h-full object-cover md:object-center opacity-40"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
          
          <ResponsiveContainer
            mobileClassName="absolute inset-0 flex items-start px-4 pt-12"
            desktopClassName="absolute inset-0 container mx-auto px-4 flex items-center"
          >
            <div className="w-full max-w-3xl mx-auto text-center">
              <div className="space-y-4 md:space-y-6">
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
                  Request Parts
                </h1>
                <p className="text-base md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                  Looking for a specific part? Fill out our request form below and our team will check availability and contact you with pricing.
                </p>
              </div>
            </div>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Form Section */}
      <ResponsiveContainer
        mobileClassName="px-4 py-6"
        desktopClassName="container mx-auto px-4 py-12"
      >
        <Card className="max-w-2xl mx-auto">
          {renderStep()}
        </Card>
      </ResponsiveContainer>
    </div>
  );
};

export default PartsRequest;