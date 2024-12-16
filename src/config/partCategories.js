// src/config/partCategories.js

export const PART_CATEGORIES = {
  'Door Components & Glass': {
    label: 'Door Components & Glass',
    subcategories: {
      'Door Panel': { label: 'Door Panel' },
      'Window Glass': { label: 'Window Glass' },
      'Vent/Quarter Glass': { label: 'Vent/Quarter Glass' },
      'Window Regulator/Motor': { label: 'Window Regulator/Motor' },
      'Door Latch Actuator': { label: 'Door Latch Actuator' },
      'Exterior Door Handle': { label: 'Exterior Door Handle' },
      'Interior Door Handle': { label: 'Interior Door Handle' },
      'Speaker': { label: 'Speaker' },
      'Sunroof Glass': { label: 'Sunroof Glass' },
      'Other Door/Glass Part': { label: 'Other Door/Glass Part' }
    }
  },
  'Interior': {
    label: 'Interior',
    subcategories: {
      'Cargo Cover': { label: 'Cargo Cover' },
      'Defroster Vent Panel': { label: 'Defroster Vent Panel' },
      'Dash Pad/Top Panel': { label: 'Dash Pad/Top Panel' },
      'Dash Assembly': { label: 'Dash Assembly' },
      'Instrument Cluster/Speedometer': { label: 'Instrument Cluster/Speedometer' },
      'Rearview Mirror': { label: 'Rearview Mirror' },
      'Steering Wheel': { label: 'Steering Wheel' },
      'Armrest': { label: 'Armrest' },
      'Floor Mats': { label: 'Floor Mats' },
      'Glove Box': { label: 'Glove Box' },
      'Console': {
        label: 'Console',
        parts: [
          'Front Center Consoles & Parts',
          'Rear Center Consoles & Parts',
          'Overhead Consoles & Dome Lights',
          'Other Console Part'
        ]
      },
      'Seat Belt': { label: 'Seat Belt' },
      'Shifter': { label: 'Shifter' },
      'Brake/Clutch Pedal': { label: 'Brake/Clutch Pedal' },
      'Gas/Accelerator Pedal': { label: 'Gas/Accelerator Pedal' },
      'Other Interior Part': { label: 'Other Interior Part' }
    }
  },
  'Electrical (Interior)': {
    label: 'Electrical (Interior)',
    subcategories: {
      'Clockspring': { label: 'Clockspring (Steering Wheel/Airbag Wiring)' },
      'Door Switches': { label: 'Door Switches (Lock/Window)' },
      'Cabin/Interior Fuse Box': { label: 'Cabin/Interior Fuse Box' },
      'Ignition Switch': { label: 'Ignition Switch' },
      'Headlight Switch': { label: 'Headlight Switch' },
      'Switch Panel': { label: 'Switch Panel' },
      'Sunroof Motor': { label: 'Sunroof Motor' },
      'Instrument Cluster/Speedometer': { label: 'Instrument Cluster/Speedometer' },
      'Other Interior Electrical Part': { label: 'Other Interior Electrical Part' }
    }
  },
  'Radio/Infotainment': {
    label: 'Radio/Infotainment',
    subcategories: {
      'Radio Receiver/CD-Player': { label: 'Radio Receiver/CD-Player' },
      'Radio/Infotainment Faceplate': { label: 'Radio/Infotainment Faceplate' },
      'Amplifier': { label: 'Amplifier' },
      'Speaker': { label: 'Speaker' },
      'Other Radio/Infotainment Part': { label: 'Other Radio/Infotainment Part' }
    }
  },
  'Electrical (Exterior/Engine/Drivetrain)': {
    label: 'Electrical (Exterior/Engine/Drivetrain)',
    subcategories: {
      'Battery': { label: 'Battery' },
      'Alternator': { label: 'Alternator' },
      'Exterior Camera/Projector': { label: 'Exterior Camera/Projector' },
      'Engine Fuse Box': { label: 'Engine Fuse Box' },
      'Computers/Modules': {
        label: 'Computer',
        parts: [
          'Engine Computer/Powertrain Control Module',
          'ABS Module',
          'Transmission/Drivetrain Module',
          'Body Control Module',
          'Communication Module (Bluetooth, Onstar, etc.)',
          'Driver Assist Module',
          'Suspension Module (Yaw rate, roll, etc.)',
          'Theft-Locking Module',
          'Other Computer/Module'
        ]
      },
      'Heater/AC Controller': { label: 'Heater/AC Controller' },
      'Starter Motor': { label: 'Starter Motor' },
      'Other Electrical Part': { label: 'Other Electrical Part' }
    }
  },
  'Exterior': {
    label: 'Exterior',
    subcategories: {
      'Wiper Motors & Arms': {
        label: 'Wiper Motors & Arms',
        parts: [
          'Front Wiper Motor',
          'Rear Wiper Motor',
          'Front Wiper Arm',
          'Rear Wiper Arm',
          'Other Wiper Part'
        ]
      },
      'Side View Door Mirror': { label: 'Side View Door Mirror' },
      'Running Board': { label: 'Running Board' },
      'Luggage/Roof Rack': { label: 'Luggage/Roof Rack' },
      'Bumpers & Parts': {
        label: 'Bumpers & Parts',
        parts: [
          'Front Bumper',
          'Rear Bumper',
          'Front Bumper Reinforcements',
          'Rear Bumper Reinforcement',
          'Bumper End Caps/Shocks',
          'Other Bumper Part'
        ]
      },
      'Grille': { label: 'Grille' },
      'Header Panel/Radiator Core Support': { label: 'Header Panel/Radiator Core Support' },
      'Hood': {
        label: 'Hood',
        parts: [
          'Hood',
          'Hood Latch',
          'Hood Hinge',
          'Hood Emblem',
          'Other Hood Part'
        ]
      },
      'Fenders & Parts': {
        label: 'Fenders & Parts',
        parts: [
          'Fender',
          'Fender Liner',
          'Fender Moulding/Overfender/Trim',
          'Other Fender Part'
        ]
      },
      'Engine Cradle/Subframe': { label: 'Engine Cradle/Subframe' },
      'Convertible Top Parts': {
        label: 'Convertible Top Parts',
        parts: [
          'Convertible Top',
          'Convertible Top Motor/Pump',
          'Convertible Top Module/Computer',
          'Convertible Flaps/Trim',
          'Other Convertible Part'
        ],
      'Other Exterior Part': { label: 'Other Exterior Part' }
      }
    }
  },
  'Engine': {
    label: 'Engine',
    subcategories: {
      'Complete Engine Assembly': { label: 'Complete Engine Assembly' },
      'Ignition Coil': { label: 'Ignition Coil' },
      'Air Injection Pump/Secondary Air Pump': { label: 'Air Injection Pump/Secondary Air Pump' },
      'Camshaft': { label: 'Camshaft' },
      'Cam Phaser/VVT Actuator': { label: 'Cam Phaser/VVT Actuator' },
      'Crankshaft': { label: 'Crankshaft' },
      'Cylinder Head': { label: 'Cylinder Head' },
      'Connecting Rod & Piston': { label: 'Connecting Rod & Piston' },
      'Oil Pan': { label: 'Oil Pan' },
      'Oil Pump': { label: 'Oil Pump' },
      'Engine/Cylinder Block': { label: 'Engine/Cylinder Block' },
      'Flywheel/Flexplate': { label: 'Flywheel/Flexplate' },
      'Valvetrain Parts': { label: 'Valvetrain Parts' },
      'Harmonic Balancer': { label: 'Harmonic Balancer' },
      'Turbocharger/Supercharger': { label: 'Turbocharger/Supercharger' },
      'Valve Cover': { label: 'Valve Cover' },
      'Water Pump': { label: 'Water Pump' },
      'Other Engine Part': { label: 'Other Engine Part' }
    }
  },
  'Intake, Exhaust, & Fuel': {
    label: 'Intake, Exhaust, & Fuel',
    subcategories: {
      'Muffler': { label: 'Muffler' },
      'Resonator': { label: 'Resonator' },
      'Exhaust Manifold': { label: 'Exhaust Manifold' },
      'Intake Manifold': { label: 'Intake Manifold' },
      'Throttle Body': { label: 'Throttle Body' },
      'Air Intake Tube/Resonator': { label: 'Air Intake Tube/Resonator' },
      'Air Cleaner': { label: 'Air Cleaner' },
      'Air Shutter/Splitter/Guide': { label: 'Air Shutter/Splitter/Guide' },
      'Mass Air Meter': { label: 'Mass Air Meter' },
      'Evaporator/Charcoal Vapor Canister': { label: 'Evaporator/Charcoal Vapor Canister' },
      'Fuel/Water Separator': { label: 'Fuel/Water Separator' },
      'Fuel/Gas Cap': { label: 'Fuel/Gas Cap' },
      'Fuel Pump': {
        label: 'Fuel Pump',
        parts: [
          'Low Pressure (In Tank)',
          'High Pressure (Engine Driven)',
          'Other'
        ]
      },
      'Fuel Line': { label: 'Fuel Line' },
      'Fuel Rail': { label: 'Fuel Rail' },
      'Fuel Injector': { label: 'Fuel Injector' },
      'Other Intake Part': { label: 'Other Intake Part' },
      'Other Exhaust Part': { label: 'Other Exhaust Part' },
      'Other Fuel Part': { label: 'Other Fuel Part' }
    }
  },
  'Engine/Engine Bay Accessories': {
    label: 'Engine/Engine Bay Accessories',
    subcategories: {
      'Alternator': { label: 'Alternator' },
      'Battery': { label: 'Battery' },
      'A/C Compressor': { label: 'A/C Compressor' },
      'Engine Cooling Fan (Electric)': { label: 'Engine Cooling Fan (Electric)' },
      'Engine Driven Fans, Clutches, & Fan Shrouds': { label: 'Engine Driven Fans, Clutches, & Fan Shrouds' },
      'Washer Bottle': { label: 'Washer Bottle' },
      'Starter Motor': { label: 'Starter Motor' },
      'Engine Cradle/Subframe': { label: 'Engine Cradle/Subframe' },
      'Battery Tray': { label: 'Battery Tray' },
      'Radiators & Coolers': {
        label: 'Radiators & Coolers',
        parts: [
          'Radiator',
          'A/C Condenser',
          'Intercooler',
          'Engine Oil Cooler',
          'Transmission Oil Cooler',
          'Power Steering Cooler',
          'Other Cooler Part'
        ]
      },
      'Other Engine Accessory Part': { label: 'Other Engine Accessory Part' }
    }
  },
  'Transmission & Drivetrain': {
    label: 'Transmission & Drivetrain',
    subcategories: {
      'Transmission': { label: 'Transmission' },
      'Transfer Case': { label: 'Transfer Case' },
      'Torque Converter': { label: 'Torque Converter' },
      'Front Carrier/Differential/Axle': { label: 'Front Carrier/Differential/Axle' },
      'Rear Carrier/Differential/Axle': { label: 'Rear Carrier/Differential/Axle' },
      'Axle/Half/Drive/Prop Shaft': { label: 'Axle/Half/Drive/Prop Shaft' },
      'Front Driveshaft': { label: 'Front Driveshaft' },
      'Rear Driveshaft': { label: 'Rear Driveshaft' },
      'Other Transmission/Drivetrain part': { label: 'Other Transmission/Drivetrain Part' }
    }
  },
  'Steering & Suspension': {
    label: 'Steering & Suspension',
    subcategories: {
      'Steering Wheel': { label: 'Steering Wheel' },
      'Steering Column': { label: 'Steering Column' },
      'Steering Column Intermediate Link': { label: 'Steering Column Intermediate Link' },
      'Steering Rack/Gear': { label: 'Steering Rack/Gear' },
      'Engine Cradle/Subframe': { label: 'Engine Cradle/Subframe' },
      'Coil Spring': { label: 'Coil Spring' },
      'Strut (Loaded Shock)': { label: 'Strut (Loaded Shock)' },
      'Steering Knuckle/Hub': { label: 'Steering Knuckle/Hub' },
      'Control Arms': {
        label: 'Control Arms',
        parts: [
          'Front Upper',
          'Front Lower',
          'Rear Upper',
          'Rear Lower',
          'Other Control Arm Part',
        ]
      },
      'Stabilizer Bar/Sway bar': { label: 'Stabilizer Bar/Sway bar' },
      'Strut Tower Brace': { label: 'Strut Tower Brace' },
      'Air Suspension Compressor': { label: 'Air Suspension Compressor' },
      'Other Steering/Suspension Part': { label: 'Other Steering/Suspension Part' }
    }
  },
  'Lights and Lamps': {
    label: 'Lights and Lamps',
    subcategories: {
      'Headlight': { label: 'Headlight' },
      'Tail Light': { label: 'Tail Light' },
      'Fog/Driving Light': { label: 'Fog/Driving Light' },
      '3rd Brake Light': { label: '3rd Brake Light' },
      'Trunk Finish Panel': { label: 'Trunk Finish Panel' },
      'Rear Lamp/Backup Light': { label: 'Rear Lamp/Backup Light' },
      'Other Light/Lamp Part': { label: 'Other Light/Lamp Part' }
    }
  },
  'Wheels, Tires, & Brakes': {
    label: 'Wheels, Tires, & Brakes',
    subcategories: {
      'Anti-Lock Brake Pump': { label: 'Anti-Lock Brake Pump' },
      'Spare Tire/Roadside Kit': { label: 'Spare Tire/Roadside Kit' },
      'Brake Caliper': { label: 'Brake Caliper' },
      'Tire': { label: 'Tire' },
      'Wheel': { label: 'Wheel' },
      'Hub Cap/Center Cap': { label: 'Hub Cap/Center Cap' },
      'Brake Master Cylinder': { label: 'Brake Master Cylinder' },
      'Brake Booster': { label: 'Brake Booster' },
      'Other Wheel/Tire/Brake Part': { label: 'Other Wheel/Tire/Brake Part' }
    }
  },
  'Misc': {
    label: 'Misc',
    subcategories: {
      'Key Fob': { label: 'Key Fob' },
      'Owner\'s Manual': { label: 'Owner\'s Manual' },
      'Plow Parts': { label: 'Plow Parts' },
      'Towing Parts': { label: 'Towing Parts' },
      'Other Misc Part': { label: 'Other Misc Part' }
    }
  }
};

// Helper function to get subcategories for a category
export const getSubcategories = (category) => {
  if (!category || !PART_CATEGORIES[category]) {
    console.log('getSubcategories: Invalid category or not found:', category);
    return {};
  }

  const subcategories = PART_CATEGORIES[category].subcategories;
  console.log('getSubcategories: Found subcategories for', category, ':', subcategories);
  return subcategories;
};

// Helper function to get parts for a specific subcategory
export const getParts = (category, subcategory) => {
  if (!category || !subcategory) {
    console.log('getParts: Missing category or subcategory');
    return [];
  }

  const subcategoryData = PART_CATEGORIES[category]?.subcategories[subcategory];
  console.log('getParts: Found subcategory data:', subcategoryData);

  if (!subcategoryData) {
    console.log('getParts: Subcategory not found');
    return [];
  }

  return subcategoryData.parts || [];
};

// Helper function to check if a subcategory has parts
export const hasSubcategoryParts = (category, subcategory) => {
  const subcategoryData = PART_CATEGORIES[category]?.subcategories[subcategory];
  return Array.isArray(subcategoryData?.parts) && subcategoryData.parts.length > 0;
};

// Flatten categories for search functionality
export const flattenedParts = Object.entries(PART_CATEGORIES).reduce((acc, [category, categoryData]) => {
  Object.entries(categoryData.subcategories).forEach(([subcategory, subcategoryData]) => {
    if (subcategoryData.parts) {
      // Add each specific part
      subcategoryData.parts.forEach(part => {
        acc.push({
          id: `${category}-${subcategory}-${part}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: part,
          category,
          subcategory,
          searchTerms: `${category} ${subcategory} ${part}`.toLowerCase()
        });
      });
    } else {
      // Add the subcategory itself as a part
      acc.push({
        id: `${category}-${subcategory}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: subcategoryData.label,
        category,
        subcategory,
        searchTerms: `${category} ${subcategory}`.toLowerCase()
      });
    }
  });
  return acc;
}, []);

// Enhanced search function with fuzzy matching
export const searchParts = (query) => {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase()
    .replace(/[\/\s-]+/g, '')
    .replace(/^ac/, 'airconditioning');

  return flattenedParts
    .filter(part => {
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
    })
    .slice(0, 10); // Limit to 10 results
};

// Validation helper
export const isValidPartSelection = (category, subcategory, part = null) => {
  const subcategoryData = PART_CATEGORIES[category]?.subcategories[subcategory];
  
  if (!subcategoryData) return false;
  
  // If subcategory has parts array, require a part selection
  if (subcategoryData.parts) {
    return part && subcategoryData.parts.includes(part);
  }
  
  // If no parts array, subcategory selection is sufficient
  return true;
};