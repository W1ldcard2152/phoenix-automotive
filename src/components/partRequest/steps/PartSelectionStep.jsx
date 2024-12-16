import { useState, useEffect } from 'react';
import { 
  PART_CATEGORIES, 
  getSubcategories, 
  getParts,
  hasSubcategoryParts,
  isValidPartSelection 
} from '@/config/partCategories';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import SearchAutocomplete from '../ui/SearchAutocomplete';
import CascadingSelect from '../ui/CascadingSelect';
import FormNavigation from '../ui/FormNavigation';

const PartSelectionStep = ({
  selectedCategory,
  selectedSubcategory,
  selectedPart,
  onCategoryChange,
  onSubcategoryChange,
  onPartChange,
  searchResults = [], // Add default value
  onSearch,
  onSearchSelect,
  vehicleInfo,
  error,
  onNextStep,
  onBack,
  isSubmitting
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [availableSubcategories, setAvailableSubcategories] = useState({});
  const [availableParts, setAvailableParts] = useState([]);
  const [localSearchResults, setLocalSearchResults] = useState(searchResults);

  // Update local search results when prop changes
  useEffect(() => {
    setLocalSearchResults(searchResults);
  }, [searchResults]);

  // Update available subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      const subcategories = getSubcategories(selectedCategory);
      setAvailableSubcategories(subcategories);
    } else {
      setAvailableSubcategories({});
    }
  }, [selectedCategory]);

  // Update available parts when subcategory changes
  useEffect(() => {
    if (selectedCategory && selectedSubcategory) {
      const parts = getParts(selectedCategory, selectedSubcategory);
      setAvailableParts(parts);
    } else {
      setAvailableParts([]);
    }
  }, [selectedCategory, selectedSubcategory]);

  const handleSearchChange = async (query) => {
    try {
      setIsSearching(true);
      await onSearch(query);
    } catch (error) {
      console.error('Search error:', error);
      setLocalSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSelect = (result) => {
    try {
      onSearchSelect(result);
      setIsSearching(false);
      
      // Automatically set category and subcategory based on search result
      if (result.category) {
        handleCategoryChange(result.category);
        if (result.subcategory) {
          handleSubcategoryChange(result.subcategory);
          if (result.part) {
            handlePartChange(result.part);
          }
        }
      }
    } catch (error) {
      console.error('Error selecting search result:', error);
    }
  };

  const handleCategoryChange = (category) => {
    onCategoryChange(category);
    onSubcategoryChange(null);
    onPartChange(null);
  };

  const handleSubcategoryChange = (subcategory) => {
    onSubcategoryChange(subcategory);
    onPartChange(null);
  };

  const handlePartChange = (part) => {
    onPartChange(part);
  };

  const canProceed = () => {
    if (!selectedCategory || !selectedSubcategory) return false;
    return isValidPartSelection(selectedCategory, selectedSubcategory, selectedPart);
  };

  return (
    <div className="space-y-6">
      {/* Vehicle Info Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Year:</span> {vehicleInfo.year}
            </div>
            <div>
              <span className="font-medium">Make:</span> {vehicleInfo.make}
            </div>
            <div>
              <span className="font-medium">Model:</span> {vehicleInfo.model}
            </div>
            <div>
              <span className="font-medium">VIN:</span> {vehicleInfo.vin}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="space-y-2">
        <SearchAutocomplete
          onSearch={handleSearchChange}
          results={localSearchResults}
          onSelect={handleSearchSelect}
          isLoading={isSearching}
          placeholder="Search for parts (e.g., 'door panel', 'headlight')"
        />
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            or select from categories
          </span>
        </div>
      </div>

      {/* Category Selection */}
      <CascadingSelect
        category={selectedCategory}
        subcategory={selectedSubcategory}
        part={selectedPart}
        categories={PART_CATEGORIES}
        subcategories={availableSubcategories}
        parts={availableParts}
        onCategoryChange={handleCategoryChange}
        onSubcategoryChange={handleSubcategoryChange}
        onPartChange={handlePartChange}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <FormNavigation
        onNext={onNextStep}
        onBack={onBack}
        canGoNext={canProceed()}
        nextLabel="Continue"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default PartSelectionStep;