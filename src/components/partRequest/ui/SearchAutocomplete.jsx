import { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Loader2 } from "lucide-react";

const SearchAutocomplete = ({ 
  onSearch, 
  results, 
  onSelect, 
  placeholder = "Search for parts...",
  isLoading = false
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (value.length >= 2) {
      onSearch(value);
    }
  }, [value, onSearch]);

  const handleSelect = (result) => {
    onSelect(result);
    setValue("");
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder={placeholder}
            className="pl-10 pr-8"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </PopoverTrigger>
      {value.length >= 2 && (
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandEmpty>No parts found.</CommandEmpty>
            <CommandGroup>
              {results.map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => handleSelect(result)}
                  className="flex flex-col items-start"
                >
                  <span className="font-medium">{result.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {result.category} → {result.subcategory}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  );
};

export default SearchAutocomplete;