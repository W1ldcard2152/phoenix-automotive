// src/config/partCategories.js

export const PART_CATEGORIES = {
  'Brakes, Wheels, & Tires': {
    label: 'Brakes, Wheels, & Tires',
    subcategories: {
      'Anti-Lock Brake Pump': { label: 'Anti-Lock Brake Pump' },
      'Brake Booster': { label: 'Brake Booster' },
      'Brake Caliper': { label: 'Brake Caliper' },
      'Brake Master Cylinder': { label: 'Brake Master Cylinder' },
      'Hub Cap/Center Cap': { label: 'Hub Cap/Center Cap' },
      'Spare Tire/Roadside Kit': { label: 'Spare Tire/Roadside Kit' },
      'Tire': { label: 'Tire' },
      'Wheel': { label: 'Wheel' },
      'Other Brake/Wheel/Tire Part': { label: 'Other Brake/Wheel/Tire Part' }
    }
  },
  'Door Components & Glass': {
    label: 'Door Components & Glass',
    subcategories: {
      'Door Latch Actuator': { label: 'Door Latch Actuator' },
      'Door Panel': { label: 'Door Panel' },
      'Exterior Door Handle': { label: 'Exterior Door Handle' },
      'Interior Door Handle': { label: 'Interior Door Handle' },
      'Speaker': { label: 'Speaker' },
      'Sunroof Glass': { label: 'Sunroof Glass' },
      'Vent/Quarter Glass': { label: 'Vent/Quarter Glass' },
      'Window Glass': { label: 'Window Glass' },
      'Window Regulator/Motor': { label: 'Window Regulator/Motor' },
      'Other Door/Glass Part': { label: 'Other Door/Glass Part' }
    }
  },
  'Electrical (Exterior/Engine/Drivetrain)': {
    label: 'Electrical (Exterior/Engine/Drivetrain)',
    subcategories: {
      'Alternator': { label: 'Alternator' },
      'Battery': { label: 'Battery' },
      'Computer': {
        label: 'Computer',
        parts: [
          'ABS Module',
          'Body Control Module',
          'Communication Module (Bluetooth, Onstar, etc.)',
          'Driver Assist Module',
          'Engine Computer/Powertrain Control Module',
          'Suspension Module (Yaw rate, roll, etc.)',
          'Theft-Locking Module',
          'Transmission/Drivetrain Module',
          'Other Computer Module'
        ]
      },
      'Engine Fuse Box': { label: 'Engine Fuse Box' },
      'Exterior Camera/Projector': { label: 'Exterior Camera/Projector' },
      'Heater/AC Controller': { label: 'Heater/AC Controller' },
      'Starter Motor': { label: 'Starter Motor' },
      'Other Electrical Part': { label: 'Other Electrical Part' }
    }
  },
  // ... Similar pattern for other main categories ...
};

// Helper function to get subcategories for a category
export const getSubcategories = (category) => {
  if (!category || !PART_CATEGORIES[category]) return {};
  return Object.entries(PART_CATEGORIES[category].subcategories).reduce((acc, [key, value]) => {
    acc[key] = key; // Use subcategory name as both key and display value
    return acc;
  }, {});
};
// Helper function to get parts for a subcategory
export const getParts = (category, subcategory) => {
  if (!category || !subcategory || !PART_CATEGORIES[category]?.subcategories[subcategory]) return [];
  
  const subcategoryData = PART_CATEGORIES[category].subcategories[subcategory];
  
  // Only return parts array if it exists and has items
  if (Array.isArray(subcategoryData.parts) && subcategoryData.parts.length > 0) {
    return subcategoryData.parts;
  }
  return [];
};
// Flatten categories for search
export const flattenedParts = [];

// Build flattened parts array for search
Object.entries(PART_CATEGORIES).forEach(([category, categoryData]) => {
  Object.entries(categoryData.subcategories).forEach(([subcategory, subcategoryData]) => {
    // If subcategory has specific parts, add each part
    if (subcategoryData.parts && subcategoryData.parts.length > 0) {
      subcategoryData.parts.forEach(part => {
        flattenedParts.push({
          id: `${category}-${subcategory}-${part}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: part,
          category,
          subcategory,
          searchTerms: `${category} ${subcategory} ${part}`.toLowerCase()
        });
      });
    } else {
      // Add the subcategory itself as a part
      flattenedParts.push({
        id: `${category}-${subcategory}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: subcategoryData.label || subcategory,
        category,
        subcategory,
        searchTerms: `${category} ${subcategory}`.toLowerCase()
      });
    }
  });
});

// Search function with fuzzy matching
export const searchParts = (query) => {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase()
    .replace(/[\/\s-]+/g, '')
    .replace(/^ac/, 'airconditioning');

  return flattenedParts.filter(part => {
    const normalizedSearch = part.searchTerms
      .replace(/[\/\s-]+/g, '')
      .replace(/^ac/, 'airconditioning');

    // Exact match check
    if (normalizedSearch.includes(normalizedQuery)) return true;

    // Fuzzy match check
    let queryIndex = 0;
    for (let searchIndex = 0; searchIndex < normalizedSearch.length && queryIndex < normalizedQuery.length; searchIndex++) {
      if (normalizedQuery[queryIndex] === normalizedSearch[searchIndex]) {
        queryIndex++;
      }
    }
    return queryIndex === normalizedQuery.length;
  }).slice(0, 10); // Limit to 10 results
};

