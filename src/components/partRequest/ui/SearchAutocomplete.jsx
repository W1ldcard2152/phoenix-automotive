import { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Loader2 } from "lucide-react";

const SearchAutocomplete = ({ 
  onSearch, 
  results = [], 
  onSelect, 
  placeholder = "Search for parts...",
  isLoading = false
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (value.length >= 2) {
      onSearch(value.toLowerCase());
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [value, onSearch]);

  const handleSelect = (result) => {
    if (result && onSelect) {
      onSelect(result);
      setValue("");
      setOpen(false);
    }
  };

  // Simple substring matching
  const matchesSearch = (partName, searchTerm) => {
    if (!partName || !searchTerm) return false;
    return partName.toLowerCase().includes(searchTerm.toLowerCase());
  };

  // Filter and sort results based on the search value
  const filteredResults = Array.isArray(results) 
    ? results
        .filter(result => matchesSearch(result?.name, value))
        .sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          const searchTerm = value.toLowerCase();
          
          // Exact matches first
          if (aName === searchTerm && bName !== searchTerm) return -1;
          if (bName === searchTerm && aName !== searchTerm) return 1;
          
          // Starts with matches second
          if (aName.startsWith(searchTerm) && !bName.startsWith(searchTerm)) return -1;
          if (bName.startsWith(searchTerm) && !aName.startsWith(searchTerm)) return 1;
          
          // Alphabetical sort for equal matches
          return aName.localeCompare(bName);
        })
    : [];

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
            onKeyDown={(e) => {
              if (e.key === "Enter" && filteredResults.length > 0) {
                handleSelect(filteredResults[0]);
              }
            }}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </PopoverTrigger>
      {value.length >= 2 && (
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-0" 
          align="start"
          onOpenAutoFocus={(e) => {
            // Prevent auto-focus of the Command menu
            e.preventDefault();
          }}
        >
          <Command 
            className="bg-white"
            shouldFilter={false}
          >
            <CommandList>
              {filteredResults.length === 0 ? (
                <CommandEmpty>No parts found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredResults.map((result) => {
                    if (!result) return null;
                    const key = result.id || `${result.category}-${result.name}` || String(Math.random());
                    return (
                      <CommandItem
                        key={key}
                        value={result.name || ''}
                        onSelect={() => handleSelect(result)}
                        className="flex flex-col items-start py-2"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{result.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {result.category}
                            {result.subcategory ? ` → ${result.subcategory}` : ''}
                          </span>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  );
};

export default SearchAutocomplete;