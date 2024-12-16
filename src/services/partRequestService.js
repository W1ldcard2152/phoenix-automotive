// src/services/partRequestService.js

/**
 * Service for handling part request related API calls
 * Centralizes all API interaction logic for part requests
 */
export const partRequestService = {
  /**
   * Submits a new part request to the API
   * @param {Object} formData - The complete form data from the request form
   * @returns {Promise} - Response from the API
   */
  submitRequest: async (formData) => {
    try {
      const response = await fetch('/api/part-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vin: formData.vin,
          vehicleInfo: {
            year: formData.year,
            make: formData.make,
            model: formData.model,
            trim: formData.trim,
            engineSize: formData.engineSize
          },
          partDetails: {
            system: formData.system,
            category: formData.category,
            subcategory: formData.subcategory,
            component: formData.component,
            otherComponent: formData.otherComponent,
            additionalInfo: formData.additionalInfo
          },
          customerInfo: {
            name: formData.customerName,
            phone: formData.phone,
            email: formData.email
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Server response error:', error);
        throw new Error(error.message || 'Failed to submit request');
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting part request:', error);
      throw error;
    }
  },

  /**
   * Retrieves a specific part request by ID
   * @param {string} id - The request ID
   * @returns {Promise} - Response from the API
   */
  getRequest: async (id) => {
    try {
      const response = await fetch(`/api/part-requests/${id}`);
      if (!response.ok) throw new Error('Failed to fetch request');
      return await response.json();
    } catch (error) {
      console.error('Error fetching part request:', error);
      throw error;
    }
  }
};