// src/lib/partRequestLogic.js

// Initial form state
export const initialFormState = {
    step: 1,
    vin: '',
    vehicleInfo: null,
    selectedCategory: null,
    selectedSubcategory: null,
    selectedPart: null,
    searchQuery: '',
    searchResults: [],
    contactInfo: {
      name: '',
      phone: '',
      email: '',
      additionalNotes: ''
    },
    errors: {}
  };
  
  // Action types
  export const ACTIONS = {
    SET_VIN: 'SET_VIN',
    SET_VEHICLE_INFO: 'SET_VEHICLE_INFO',
    SELECT_CATEGORY: 'SELECT_CATEGORY',
    SELECT_SUBCATEGORY: 'SELECT_SUBCATEGORY',
    SELECT_PART: 'SELECT_PART',
    SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
    SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
    SET_CONTACT_INFO: 'SET_CONTACT_INFO',
    SET_ADDITIONAL_NOTES: 'SET_ADDITIONAL_NOTES',
    NEXT_STEP: 'NEXT_STEP',
    PREV_STEP: 'PREV_STEP',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
    RESET_FORM: 'RESET_FORM',
    SELECT_SEARCH_RESULT: 'SELECT_SEARCH_RESULT'
  };
  
  // Reducer function
  export function formReducer(state, action) {
    switch (action.type) {
      case ACTIONS.SET_VIN:
        return {
          ...state,
          vin: action.payload,
          errors: { ...state.errors, vin: null }
        };
  
      case ACTIONS.SET_VEHICLE_INFO:
        return {
          ...state,
          vehicleInfo: action.payload,
          errors: { ...state.errors, vehicleInfo: null }
        };
  
      case ACTIONS.SELECT_CATEGORY:
        return {
          ...state,
          selectedCategory: action.payload,
          selectedSubcategory: null,
          selectedPart: null,
          errors: { ...state.errors, category: null }
        };
  
      case ACTIONS.SELECT_SUBCATEGORY:
        return {
          ...state,
          selectedSubcategory: action.payload,
          selectedPart: null,
          errors: { ...state.errors, subcategory: null }
        };
  
      case ACTIONS.SELECT_PART:
        return {
          ...state,
          selectedPart: action.payload,
          errors: { ...state.errors, part: null }
        };
  
      case ACTIONS.SET_SEARCH_QUERY:
        return {
          ...state,
          searchQuery: action.payload
        };
  
      case ACTIONS.SET_SEARCH_RESULTS:
        return {
          ...state,
          searchResults: action.payload
        };
  
      case ACTIONS.SELECT_SEARCH_RESULT:
        const { category, subcategory, part } = action.payload;
        return {
          ...state,
          selectedCategory: category,
          selectedSubcategory: subcategory,
          selectedPart: part,
          searchQuery: '',
          searchResults: []
        };
  
      case ACTIONS.SET_CONTACT_INFO:
        return {
          ...state,
          contactInfo: {
            ...state.contactInfo,
            [action.payload.field]: action.payload.value
          },
          errors: {
            ...state.errors,
            contactInfo: {
              ...state.errors.contactInfo,
              [action.payload.field]: null
            }
          }
        };
  
      case ACTIONS.SET_ADDITIONAL_NOTES:
        return {
          ...state,
          contactInfo: {
            ...state.contactInfo,
            additionalNotes: action.payload
          }
        };
  
      case ACTIONS.NEXT_STEP:
        return {
          ...state,
          step: state.step + 1
        };
  
      case ACTIONS.PREV_STEP:
        return {
          ...state,
          step: Math.max(1, state.step - 1)
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
  
      case ACTIONS.RESET_FORM:
        return initialFormState;
  
      default:
        return state;
    }
  }
  
  // Validation helpers
  export const validatePhone = (phone) => {
    const stripped = phone.replace(/\D/g, '');
    return stripped.length === 10;
  };
  
  export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Search helper
  export const fuzzySearch = (query, parts) => {
    if (query.length < 2) return [];
    
    // Normalize search query
    const normalizedQuery = query.toLowerCase()
      .replace(/[\/\s-]+/g, '') // Remove slashes, spaces, and hyphens
      .replace(/^ac/, 'airconditioning'); // Handle A/C special case
  
    return parts.filter(part => {
      const normalizedPart = part.name.toLowerCase()
        .replace(/[\/\s-]+/g, '')
        .replace(/^ac/, 'airconditioning');
  
      // Check for exact matches first
      if (normalizedPart.includes(normalizedQuery)) return true;
  
      // Then check for fuzzy matches
      let queryIndex = 0;
      for (let partIndex = 0; partIndex < normalizedPart.length && queryIndex < normalizedQuery.length; partIndex++) {
        if (normalizedQuery[queryIndex] === normalizedPart[partIndex]) {
          queryIndex++;
        }
      }
      return queryIndex === normalizedQuery.length;
    });
  };
  
  // Form validation
  export const validateStep = (state) => {
    const errors = {};
  
    switch (state.step) {
      case 1: // VIN
        if (!state.vin) {
          errors.vin = 'VIN is required';
        } else if (state.vin.length !== 17) {
          errors.vin = 'VIN must be exactly 17 characters';
        }
        break;
  
      case 2: // Part Selection
        if (!state.selectedCategory) {
          errors.category = 'Please select a category';
        }
        if (state.selectedCategory && !state.selectedPart) {
          errors.part = 'Please select a part';
        }
        break;
  
      case 3: // Contact Info
        if (!state.contactInfo.name) {
          errors.contactInfo = { ...errors.contactInfo, name: 'Name is required' };
        }
        if (!state.contactInfo.phone) {
          errors.contactInfo = { ...errors.contactInfo, phone: 'Phone is required' };
        } else if (!validatePhone(state.contactInfo.phone)) {
          errors.contactInfo = { ...errors.contactInfo, phone: 'Invalid phone number' };
        }
        if (!state.contactInfo.email) {
          errors.contactInfo = { ...errors.contactInfo, email: 'Email is required' };
        } else if (!validateEmail(state.contactInfo.email)) {
          errors.contactInfo = { ...errors.contactInfo, email: 'Invalid email address' };
        }
        break;
    }
  
    return errors;
  };