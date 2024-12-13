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
  onCategoryChange,
  onSubcategoryChange,
  onPartChange,
  disabled = false
}) => {
  console.log('CascadingSelect received:', {
    category,
    subcategories: JSON.stringify(subcategories, null, 2)
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={category || ""}
          onValueChange={(value) => {
            console.log('Category selected:', value);
            onCategoryChange(value);
          }}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(categories).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {category && (
        <div className="space-y-2">
          <Label>Subcategory</Label>
          <Select
            value={subcategory || ""}
            onValueChange={onSubcategoryChange}
            disabled={disabled || !category}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a subcategory" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(subcategories).map(([key, value]) => {
                console.log('Rendering subcategory:', key, value);
                return (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default CascadingSelect;