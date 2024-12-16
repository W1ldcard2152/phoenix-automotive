import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const CascadingSelect = ({
  category,
  subcategory,
  part,
  categories,
  subcategories,
  parts,
  onCategoryChange,
  onSubcategoryChange,
  onPartChange,
  disabled = false
}) => {
  // Helper function to get label from category object
  const getCategoryLabel = (categoryKey) => {
    return categories[categoryKey]?.label || categoryKey;
  };

  // Helper function to get label from subcategory object
  const getSubcategoryLabel = (subcategoryKey) => {
    return subcategories[subcategoryKey]?.label || subcategoryKey;
  };

  return (
    <div className="space-y-4">
      {/* Category Selection */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={category || ""}
          onValueChange={(value) => {
            onCategoryChange(value);
          }}
          disabled={disabled}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {Object.keys(categories).map((categoryKey) => (
              <SelectItem key={categoryKey} value={categoryKey}>
                {getCategoryLabel(categoryKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subcategory Selection */}
      {category && (
        <div className="space-y-2">
          <Label>Subcategory</Label>
          <Select
            value={subcategory || ""}
            onValueChange={(value) => {
              onSubcategoryChange(value);
            }}
            disabled={disabled || !category}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select a subcategory" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {Object.keys(subcategories).map((subcategoryKey) => (
                <SelectItem key={subcategoryKey} value={subcategoryKey}>
                  {getSubcategoryLabel(subcategoryKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Part Selection - Only show if subcategory has specific parts */}
      {category && subcategory && Array.isArray(parts) && parts.length > 0 && (
        <div className="space-y-2">
          <Label>Specific Part</Label>
          <Select
            value={part || ""}
            onValueChange={(value) => {
              onPartChange(value);
            }}
            disabled={disabled || !subcategory}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select a specific part" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {parts.map((partItem) => (
                <SelectItem key={partItem} value={partItem}>
                  {partItem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default CascadingSelect;