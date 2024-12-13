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
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={category || ""}
          onValueChange={onCategoryChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {Object.entries(categories)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([key, value]) => (
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
            <SelectContent className="bg-white">
            {Object.keys(subcategories)
  .sort()
  .map((key) => (
    <SelectItem key={key} value={key}>
      {key}
    </SelectItem>
  ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {category && subcategory && parts.length > 0 && (
        <div className="space-y-2">
          <Label>Part</Label>
          <Select
            value={part || ""}
            onValueChange={onPartChange}
            disabled={disabled || !subcategory}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a part" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {parts
                .sort()
                .map((part) => (
                  <SelectItem key={part} value={part}>
                    {part}
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