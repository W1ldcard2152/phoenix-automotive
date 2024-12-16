// src/hooks/usePartsRequest.js

import { useReducer, useCallback, useEffect } from 'react';
import { formReducer, initialFormState, ACTIONS, validateStep } from '../lib/partRequestLogic';
import { 
  searchParts, 
  getSubcategories, 
  getParts, 
  isValidPartSelection 
} from '../config/partCategories';
import { showToast } from '@/utils/toastUtils';

export const usePartsRequest = () => {
  const [state, dispatch] = useReducer(formReducer, initialFormState);

  // Handle search as user types with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (state.searchQuery.length >= 2) {
        const results = searchParts(state.searchQuery);
        dispatch({ type: ACTIONS.SET_SEARCH_RESULTS, payload: results });
      } else {
        dispatch({ type: ACTIONS.SET_SEARCH_RESULTS, payload: [] });
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [state.searchQuery]);

  // Navigation handlers with validation
  const nextStep = useCallback(() => {
    const errors = validateStep(state);
    if (Object.keys(errors).length === 0) {
      dispatch({ type: ACTIONS.NEXT_STEP });
      return true;
    } else {
      Object.entries(errors).forEach(([field, message]) => {
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: { field, message }
        });
      });
      return false;
    }
  }, [state]);

  const prevStep = useCallback(() => {
    dispatch({ type: ACTIONS.PREV_STEP });
  }, []);

  // VIN handling
  const setVin = useCallback((vin) => {
    dispatch({ type: ACTIONS.SET_VIN, payload: vin.toUpperCase() });
    // Clear any previous VIN-related errors
    dispatch({ type: ACTIONS.CLEAR_ERROR, payload: 'vin' });
  }, []);

  const setVehicleInfo = useCallback((info) => {
    dispatch({ type: ACTIONS.SET_VEHICLE_INFO, payload: info });
  }, []);

  // Part selection handlers with validation
  const selectCategory = useCallback((category) => {
    dispatch({ type: ACTIONS.SELECT_CATEGORY, payload: category });
    // Clear any previous part selection errors
    dispatch({ type: ACTIONS.CLEAR_ERROR, payload: 'part' });
  }, []);

  const selectSubcategory = useCallback((subcategory) => {
    dispatch({ type: ACTIONS.SELECT_SUBCATEGORY, payload: subcategory });
  }, []);

  const selectPart = useCallback((part) => {
    dispatch({ type: ACTIONS.SELECT_PART, payload: part });
  }, []);

  // Search handlers
  const setSearchQuery = useCallback((query) => {
    dispatch({ type: ACTIONS.SET_SEARCH_QUERY, payload: query });
  }, []);

  const selectSearchResult = useCallback((result) => {
    try {
      dispatch({ type: ACTIONS.SELECT_SEARCH_RESULT, payload: result });
      showToast.success('Part selected successfully');
    } catch (error) {
      showToast.error('Failed to select part', error.message);
    }
  }, []);

  // Contact info handlers with validation
  const setContactInfo = useCallback((field, value) => {
    dispatch({
      type: ACTIONS.SET_CONTACT_INFO,
      payload: { field, value }
    });
    // Clear field-specific error when user starts typing
    dispatch({
      type: ACTIONS.CLEAR_ERROR,
      payload: `contactInfo.${field}`
    });
  }, []);

  const setAdditionalNotes = useCallback((notes) => {
    dispatch({ type: ACTIONS.SET_ADDITIONAL_NOTES, payload: notes });
  }, []);

  // Phone number formatting
  const formatPhoneNumber = useCallback((value) => {
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
  }, []);

  // Get available options based on current selection
  const getAvailableSubcategories = useCallback(() => {
    if (!state.selectedCategory) return {};
    return getSubcategories(state.selectedCategory);
  }, [state.selectedCategory]);

  const getAvailableParts = useCallback(() => {
    if (!state.selectedCategory || !state.selectedSubcategory) return [];
    return getParts(state.selectedCategory, state.selectedSubcategory);
  }, [state.selectedCategory, state.selectedSubcategory]);

  // Validate current part selection
  const validatePartSelection = useCallback(() => {
    if (!state.selectedCategory || !state.selectedSubcategory) return false;
    return isValidPartSelection(
      state.selectedCategory,
      state.selectedSubcategory,
      state.selectedPart
    );
  }, [state.selectedCategory, state.selectedSubcategory, state.selectedPart]);

  // Reset form with confirmation
  const resetForm = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_FORM });
  }, []);

  return {
    // State
    state,
    
    // Step navigation
    nextStep,
    prevStep,
    
    // VIN handlers
    setVin,
    setVehicleInfo,
    
    // Part selection
    selectCategory,
    selectSubcategory,
    selectPart,
    getAvailableSubcategories,
    getAvailableParts,
    validatePartSelection,
    
    // Search
    setSearchQuery,
    selectSearchResult,
    
    // Contact info
    setContactInfo,
    setAdditionalNotes,
    formatPhoneNumber,
    
    // Form management
    resetForm
  };
};