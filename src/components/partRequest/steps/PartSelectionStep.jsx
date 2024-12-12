import { useState } from 'react';
import { PART_CATEGORIES } from '@/config/partCategories';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SearchAutocomplete from '../ui/SearchAutocomplete';
import CascadingSelect from '../ui/CascadingSelect';

const PartSelectionStep = ({
  selectedCategory,
  selectedSubcategory,
  selectedPart,
  onCategoryChange,
  onSubcategoryChange,
  onPartChange,
  searchResults,
  onSearch,
  onSearchSelect,
  availableSubcategories,
  availableParts,
  vehicleInfo,
  error
}) => {
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchChange = (query) => {
    setIsSearching(query.length >= 2);
    onSearch(query);
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
          results={searchResults}
          onSelect={onSearchSelect}
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
        onCategoryChange={onCategoryChange}
        onSubcategoryChange={onSubcategoryChange}
        onPartChange={onPartChange}
      />

      {error && (
        <div className="text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
};

export default PartSelectionStep;