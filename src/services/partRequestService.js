// src/services/partRequestService.js

/**
 * Maps form categories to API system enum values
 */
const SYSTEM_MAP = {
  'Door Components & Glass': 'Exterior',
  'Interior': 'Interior',
  'Electrical (Interior)': 'Electrical',
  'Radio/Infotainment': 'Electrical',
  'Electrical (Exterior/Engine/Drivetrain)': 'Electrical',
  'Exterior': 'Exterior',
  'Engine': 'Engine/Accessories',
  'Intake, Exhaust, & Fuel': 'Engine/Accessories',
  'Engine/Engine Bay Accessories': 'Engine/Accessories',
  'Transmission & Drivetrain': 'Transmission/Drivetrain',
  'Steering & Suspension': 'Steering/Suspension',
  'Lights and Lamps': 'Electrical',
  'Wheels, Tires, & Brakes': 'Wheels/Tires',
  'Misc': 'Other'
};

/**
 * Service for handling part request related API calls
 */
export const partRequestService = {
  /**
   * Transforms the form state into the API expected format
   * @param {Object} formData - Raw form data from the request form
   * @returns {Object} - Transformed data matching API schema
   */
  transformFormData(formData) {
    console.log('Starting data transformation:', formData);

    // Get the system category by mapping the selected category
    const system = SYSTEM_MAP[formData.selectedCategory] || 'Other';
    console.log('Mapped system category:', {
      from: formData.selectedCategory,
      to: system
    });

    // Build the component description
    let component = formData.selectedPart || formData.selectedSubcategory;
    if (formData.selectedPart && formData.selectedSubcategory) {
      component = `${formData.selectedSubcategory} - ${formData.selectedPart}`;
    }

    const transformedData = {
      vin: formData.vin,
      vehicleInfo: {
        year: formData.vehicleInfo.year,
        make: formData.vehicleInfo.make,
        model: formData.vehicleInfo.model,
        trim: formData.vehicleInfo.trim || '',
        engineSize: formData.vehicleInfo.engineSize || ''
      },
      partDetails: {
        system,
        component,
        additionalInfo: formData.contactInfo.additionalNotes || ''
      },
      customerInfo: {
        name: formData.contactInfo.name,
        phone: formData.contactInfo.phone,
        email: formData.contactInfo.email
      }
    };

    console.log('Transformation complete:', transformedData);
    return transformedData;
  },

  /**
   * Submits a new part request to the API
   * @param {Object} formData - The complete form data from the request form
   * @returns {Promise} - Response from the API
   */
  async submitRequest(formData) {
    try {
      console.log('Starting part request submission...');
      
      const transformedData = this.transformFormData(formData);
      console.log('Sending request to:', '/api/part-requests');
      console.log('Request payload:', transformedData);

      const response = await fetch('/api/part-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const contentType = response.headers.get('content-type');
      let responseData;

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
        console.log('Response data:', responseData);
      } else {
        const textResponse = await response.text();
        console.log('Non-JSON response:', textResponse);
        throw new Error('Received non-JSON response from server');
      }

      if (!response.ok) {
        console.error('Server error response:', responseData);
        throw new Error(responseData.error || 'Failed to submit request');
      }

      console.log('Request submitted successfully:', responseData);
      return responseData;
    } catch (error) {
      console.error('Part request submission failed:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
};

export default partRequestService;