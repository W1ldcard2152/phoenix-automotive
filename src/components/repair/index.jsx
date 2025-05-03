import { useReducer, useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { showToast } from '@/utils/toastUtils';
import StepIndicator from './ui/StepIndicator';
import VehicleInfoStep from './steps/VehicleInfoStep';
import ServiceInfoStep from './steps/ServiceInfoStep';
import ContactInfoStep from './steps/ContactInfoStep';
import ReviewStep from './steps/ReviewStep';
import { handleVinDecode } from '@/utils/vinUtils';
import { apiClient } from '@/utils/apiClient';

// Initial form state
const initialState = {
  step: 1,
  vehicleInfo: {
    year: '',
    make: '',
    model: '',
    trim: '',
    vin: '',
    mileage: '',
    engineSize: ''
  },
  serviceInfo: {
    serviceType: '',
    otherServiceType: '',
    description: '',
    preferredDate: '',
    urgency: 'Medium'
  },
  customerInfo: {
    name: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  },
  errors: {},
  isLoading: false,
  isSubmitting: false
};

// Actions for the reducer
const ACTIONS = {
  SET_VEHICLE_INFO: 'SET_VEHICLE_INFO',
  SET_SERVICE_INFO: 'SET_SERVICE_INFO',
  SET_CUSTOMER_INFO: 'SET_CUSTOMER_INFO',
  NEXT_STEP: 'NEXT_STEP',
  PREV_STEP: 'PREV_STEP',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
  SET_SUBMITTING: 'SET_SUBMITTING',
  RESET_FORM: 'RESET_FORM'
};

// Reducer function
function formReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_VEHICLE_INFO:
      return {
        ...state,
        vehicleInfo: {
          ...state.vehicleInfo,
          ...action.payload
        },
        errors: { 
          ...state.errors,
          vehicleInfo: null 
        }
      };

    case ACTIONS.SET_SERVICE_INFO:
      return {
        ...state,
        serviceInfo: {
          ...state.serviceInfo,
          ...action.payload
        },
        errors: { 
          ...state.errors,
          serviceInfo: null 
        }
      };

    case ACTIONS.SET_CUSTOMER_INFO:
      return {
        ...state,
        customerInfo: {
          ...state.customerInfo,
          ...action.payload
        },
        errors: { 
          ...state.errors,
          customerInfo: null 
        }
      };

    case ACTIONS.NEXT_STEP:
      return {
        ...state,
        step: state.step + 1,
        errors: {}
      };

    case ACTIONS.PREV_STEP:
      return {
        ...state,
        step: Math.max(1, state.step - 1),
        errors: {}
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.field]: action.payload.message
        }
      };

    case ACTIONS.CLEAR_ERROR:
      const newErrors = { ...state.errors };
      delete newErrors[action.payload];
      return {
        ...state,
        errors: newErrors
      };

    case ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case ACTIONS.SET_SUBMITTING:
      return {
        ...state,
        isSubmitting: action.payload
      };

    case ACTIONS.RESET_FORM:
      return initialState;

    default:
      return state;
  }
}

// Form validation helpers
const validateVehicleInfo = (vehicleInfo) => {
  const errors = {};
  
  if (!vehicleInfo.year) errors.year = 'Year is required';
  else if (isNaN(vehicleInfo.year) || parseInt(vehicleInfo.year) < 1900 || parseInt(vehicleInfo.year) > new Date().getFullYear() + 1) {
    errors.year = 'Please enter a valid year';
  }
  
  if (!vehicleInfo.make) errors.make = 'Make is required';
  if (!vehicleInfo.model) errors.model = 'Model is required';
  
  // Remove these VIN validation checks
  // if (!vehicleInfo.vin) errors.vin = 'VIN is required';
  // else if (vehicleInfo.vin.length !== 17) errors.vin = 'VIN must be 17 characters';
  
  // Remove these mileage validation checks
  // if (!vehicleInfo.mileage) errors.mileage = 'Mileage is required';
  // else if (isNaN(vehicleInfo.mileage) || parseInt(vehicleInfo.mileage) < 0) {
  //   errors.mileage = 'Please enter a valid mileage';
  // }
  
  return errors;
};

const validateServiceInfo = (serviceInfo) => {
  const errors = {};
  
  if (!serviceInfo.serviceType) errors.serviceType = 'Service type is required';
  if (serviceInfo.serviceType === 'Other' && !serviceInfo.otherServiceType) {
    errors.otherServiceType = 'Please specify the service type';
  }
  
  if (!serviceInfo.description) errors.description = 'Please describe the service needed';
  
  return errors;
};

const validateContactInfo = (customerInfo) => {
  const errors = {};
  
  if (!customerInfo.name) errors.name = 'Name is required';
  
  if (!customerInfo.phone) errors.phone = 'Phone number is required';
  else if (!/^\(\d{3}\) \d{3}-\d{4}$/.test(customerInfo.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }
  
  if (!customerInfo.email) errors.email = 'Email is required';
  else if (!/^\S+@\S+\.\S+$/.test(customerInfo.email)) {
    errors.email = 'Please enter a valid email';
  }
  
  return errors;
};

const STEPS = [
  { label: 'Vehicle Info' },
  { label: 'Service Details' },
  { label: 'Contact Info' },
  { label: 'Review' }
];

const RepairRequestForm = ({ onCancel }) => {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Phone number formatting
  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (cleaned.length >= 3) {
      formatted = `(${cleaned.slice(0, 3)}`;
      if (cleaned.length >= 6) {
        formatted += `) ${cleaned.slice(3, 6)}`;
        if (cleaned.length >= 10) {
          formatted += `-${cleaned.slice(6, 10)}`;
        } else if (cleaned.length > 6) {
          formatted += `-${cleaned.slice(6)}`;
        }
      } else if (cleaned.length > 3) {
        formatted += `) ${cleaned.slice(3)}`;
      }
    }
    
    return formatted;
  };

  // Handle VIN lookup
  const handleVinLookup = async (vin) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      const vehicleInfo = await handleVinDecode(vin);
      
      if (!vehicleInfo.year || !vehicleInfo.make || !vehicleInfo.model) {
        throw new Error('Could not decode essential vehicle information');
      }
      
      dispatch({
        type: ACTIONS.SET_VEHICLE_INFO,
        payload: {
          year: vehicleInfo.year,
          make: vehicleInfo.make,
          model: vehicleInfo.model,
          trim: vehicleInfo.trim || '',
          vin: vehicleInfo.vin,
          engineSize: vehicleInfo.engineSize || ''
        }
      });
      
      showToast.success('Vehicle information retrieved', 'VIN decoded successfully');
      return vehicleInfo;
    } catch (error) {
      showToast.error('VIN Lookup Failed', error.message);
      return null;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Form navigation handlers
  const handleNext = (stepData) => {
    let isValid = false;
    let errors = {};
    
    switch (state.step) {
      case 1: // Vehicle info validation
        errors = validateVehicleInfo(state.vehicleInfo);
        if (Object.keys(errors).length === 0) {
          isValid = true;
        } else {
          // Set errors for any invalid fields
          Object.entries(errors).forEach(([field, message]) => {
            dispatch({
              type: ACTIONS.SET_ERROR,
              payload: { field: `vehicleInfo.${field}`, message }
            });
          });
        }
        break;
        
      case 2: // Service info validation
        errors = validateServiceInfo(state.serviceInfo);
        if (Object.keys(errors).length === 0) {
          isValid = true;
        } else {
          Object.entries(errors).forEach(([field, message]) => {
            dispatch({
              type: ACTIONS.SET_ERROR,
              payload: { field: `serviceInfo.${field}`, message }
            });
          });
        }
        break;
        
      case 3: // Contact info validation
        errors = validateContactInfo(state.customerInfo);
        if (Object.keys(errors).length === 0) {
          isValid = true;
        } else {
          Object.entries(errors).forEach(([field, message]) => {
            dispatch({
              type: ACTIONS.SET_ERROR,
              payload: { field: `customerInfo.${field}`, message }
            });
          });
        }
        break;
        
      default:
        isValid = true;
    }
    
    if (isValid) {
      dispatch({ type: ACTIONS.NEXT_STEP });
    }
  };

  const handleBack = () => {
    dispatch({ type: ACTIONS.PREV_STEP });
  };

  // Form submission
  const handleSubmit = async () => {
    try {
      dispatch({ type: ACTIONS.SET_SUBMITTING, payload: true });
      
      const { vehicleInfo, serviceInfo, customerInfo } = state;
      
      // Prepare data for API
      const formattedData = {
        customerInfo: {
          ...customerInfo
        },
        vehicleInfo: {
          ...vehicleInfo,
          year: parseInt(vehicleInfo.year),
          mileage: vehicleInfo.mileage ? parseInt(vehicleInfo.mileage) : 0  // Add a default or condition here
        },
        serviceInfo: {
          ...serviceInfo
        }
      };
      
      // Submit to API
      await apiClient.repairRequests.create(formattedData);
      
      // Show success message
      showToast.success(
        'Request Submitted Successfully',
        'We will contact you shortly to confirm your appointment'
      );
      
      // Reset form and show success message
      setFormSubmitted(true);
      
      // Reset form after delay
      setTimeout(() => {
        dispatch({ type: ACTIONS.RESET_FORM });
        setFormSubmitted(false);
      }, 5000);
      
    } catch (error) {
      console.error('Form submission error:', error);
      showToast.error(
        'Submission Failed',
        error.message || 'Please try again or contact us directly'
      );
    } finally {
      dispatch({ type: ACTIONS.SET_SUBMITTING, payload: false });
    }
  };

  // Update form fields
  const setVehicleInfo = (data) => {
    dispatch({ type: ACTIONS.SET_VEHICLE_INFO, payload: data });
  };

  const setServiceInfo = (data) => {
    dispatch({ type: ACTIONS.SET_SERVICE_INFO, payload: data });
  };

  const setCustomerInfo = (data) => {
    dispatch({ type: ACTIONS.SET_CUSTOMER_INFO, payload: data });
  };

  // Render current step
  const renderStep = () => {
    if (formSubmitted) {
      return (
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Request Submitted Successfully!</h2>
          <p className="mb-4">Thank you for your repair request. We will contact you shortly to confirm your appointment.</p>
          <Button onClick={onCancel}>Return to Services</Button>
        </div>
      );
    }
    
    switch (state.step) {
      case 1:
        return (
          <VehicleInfoStep
            vehicleInfo={state.vehicleInfo}
            onVehicleInfoChange={setVehicleInfo}
            onVinLookup={handleVinLookup}
            onNext={handleNext}
            onCancel={onCancel}
            errors={state.errors}
            isLoading={state.isLoading}
          />
        );
      case 2:
        return (
          <ServiceInfoStep
            serviceInfo={state.serviceInfo}
            onServiceInfoChange={setServiceInfo}
            onNext={handleNext}
            onBack={handleBack}
            errors={state.errors}
          />
        );
      case 3:
        return (
          <ContactInfoStep
            customerInfo={state.customerInfo}
            onCustomerInfoChange={setCustomerInfo}
            formatPhoneNumber={formatPhoneNumber}
            onNext={handleNext}
            onBack={handleBack}
            errors={state.errors}
          />
        );
      case 4:
        return (
          <ReviewStep
            vehicleInfo={state.vehicleInfo}
            serviceInfo={state.serviceInfo}
            customerInfo={state.customerInfo}
            onSubmit={handleSubmit}
            onBack={handleBack}
            isSubmitting={state.isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 w-full max-w-2xl mx-auto">
      <StepIndicator steps={STEPS} currentStep={state.step} />
      <Card>
        <CardContent className="pt-6">
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
};

export default RepairRequestForm;