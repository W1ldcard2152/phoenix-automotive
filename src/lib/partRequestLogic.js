// src/lib/partRequestLogic.js

import { isValidPartSelection } from '../config/partCategories';

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
  errors: {},
  isLoading: false,
  isSubmitting: false
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
  SELECT_SEARCH_RESULT: 'SELECT_SEARCH_RESULT',
  SET_LOADING: 'SET_LOADING',
  SET_SUBMITTING: 'SET_SUBMITTING'
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
        errors: { ...state.errors, part: null }
      };

    case ACTIONS.SELECT_SUBCATEGORY:
      return {
        ...state,
        selectedSubcategory: action.payload,
        selectedPart: null,
        errors: { ...state.errors, part: null }
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
      const { category, subcategory, name: part } = action.payload;
      return {
        ...state,
        selectedCategory: category,
        selectedSubcategory: subcategory,
        selectedPart: part,
        searchQuery: '',
        searchResults: [],
        errors: { ...state.errors, part: null }
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
        step: state.step + 1,
        errors: {} // Clear errors when moving to next step
      };

    case ACTIONS.PREV_STEP:
      return {
        ...state,
        step: Math.max(1, state.step - 1),
        errors: {} // Clear errors when moving to previous step
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

export const validateVin = (vin) => {
  if (!vin) return false;
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
  return vinRegex.test(vin);
};

// Form validation
export const validateStep = (state) => {
  const errors = {};

  switch (state.step) {
    case 1: // VIN
      if (!state.vin) {
        errors.vin = 'VIN is required';
      } else if (!validateVin(state.vin)) {
        errors.vin = 'Please enter a valid 17-character VIN';
      }
      break;

    case 2: // Part Selection
      if (!state.selectedCategory) {
        errors.part = 'Please select a category';
      } else if (!state.selectedSubcategory) {
        errors.part = 'Please select a subcategory';
      } else if (!isValidPartSelection(state.selectedCategory, state.selectedSubcategory, state.selectedPart)) {
        errors.part = 'Please complete your part selection';
      }
      break;

    case 3: // Contact Info
      if (!state.contactInfo.name) {
        errors.contactInfo = { ...errors.contactInfo, name: 'Name is required' };
      }
      if (!state.contactInfo.phone) {
        errors.contactInfo = { ...errors.contactInfo, phone: 'Phone number is required' };
      } else if (!validatePhone(state.contactInfo.phone)) {
        errors.contactInfo = { ...errors.contactInfo, phone: 'Please enter a valid 10-digit phone number' };
      }
      if (!state.contactInfo.email) {
        errors.contactInfo = { ...errors.contactInfo, email: 'Email address is required' };
      } else if (!validateEmail(state.contactInfo.email)) {
        errors.contactInfo = { ...errors.contactInfo, email: 'Please enter a valid email address' };
      }
      break;
  }

  return errors;
};