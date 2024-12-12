// src/hooks/usePartsRequest.js

import { useReducer, useCallback, useEffect } from 'react';
import { formReducer, initialFormState, ACTIONS, validateStep } from '../lib/partRequestLogic';
import { searchParts, getSubcategories, getParts } from '../config/partCategories';

export const usePartsRequest = () => {
  const [state, dispatch] = useReducer(formReducer, initialFormState);

  // Handle search as user types
  useEffect(() => {
    if (state.searchQuery.length >= 2) {
      const results = searchParts(state.searchQuery);
      dispatch({ type: ACTIONS.SET_SEARCH_RESULTS, payload: results });
    } else {
      dispatch({ type: ACTIONS.SET_SEARCH_RESULTS, payload: [] });
    }
  }, [state.searchQuery]);

  // Navigation handlers
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
  }, []);

  const setVehicleInfo = useCallback((info) => {
    dispatch({ type: ACTIONS.SET_VEHICLE_INFO, payload: info });
  }, []);

  // Part selection handlers
  const selectCategory = useCallback((category) => {
    dispatch({ type: ACTIONS.SELECT_CATEGORY, payload: category });
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
    dispatch({ type: ACTIONS.SELECT_SEARCH_RESULT, payload: result });
  }, []);

  // Contact info handlers
  const setContactInfo = useCallback((field, value) => {
    dispatch({
      type: ACTIONS.SET_CONTACT_INFO,
      payload: { field, value }
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
    return state.selectedCategory ? 
      Object.keys(getSubcategories(state.selectedCategory)) : 
      [];
  }, [state.selectedCategory]);

  const getAvailableParts = useCallback(() => {
    return state.selectedCategory && state.selectedSubcategory ? 
      getParts(state.selectedCategory, state.selectedSubcategory) : 
      [];
  }, [state.selectedCategory, state.selectedSubcategory]);

  // Reset form
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