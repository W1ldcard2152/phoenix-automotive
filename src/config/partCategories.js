// src/config/partCategories.js

export const PART_CATEGORIES = {
    'Brakes, Wheels, & Tires': {
      label: 'Brakes, Wheels, & Tires',
      subcategories: {
        'Anti-Lock Brake Pump': { parts: [] },
        'Brake Booster': { parts: [] },
        'Brake Caliper': { parts: [] },
        'Brake Master Cylinder': { parts: [] },
        'Hub Cap/Center Cap': { parts: [] },
        'Spare Tire/Roadside Kit': { parts: [] },
        'Tire': { parts: [] },
        'Wheel': { parts: [] },
        'Other Brake/Wheel/Tire Part': { parts: [] }
      }
    },
    'Door Components & Glass': {
      label: 'Door Components & Glass',
      subcategories: {
        'Door Latch Actuator': { parts: [] },
        'Door Panel': { parts: [] },
        'Exterior Door Handle': { parts: [] },
        'Interior Door Handle': { parts: [] },
        'Speaker': { parts: [] },
        'Sunroof Glass': { parts: [] },
        'Vent/Quarter Glass': { parts: [] },
        'Window Glass': { parts: [] },
        'Window Regulator/Motor': { parts: [] },
        'Other Door/Glass Part': { parts: [] }
      }
    },
    'Electrical (Exterior/Engine/Drivetrain)': {
      label: 'Electrical (Exterior/Engine/Drivetrain)',
      subcategories: {
        'Alternator': { parts: [] },
        'Battery': { parts: [] },
        'Computer': {
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
        'Engine Fuse Box': { parts: [] },
        'Exterior Camera/Projector': { parts: [] },
        'Heater/AC Controller': { parts: [] },
        'Starter Motor': { parts: [] },
        'Other Electrical Part': { parts: [] }
      }
    },
    'Electrical (Interior)': {
      label: 'Electrical (Interior)',
      subcategories: {
        'Cabin/Interior Fuse Box': { parts: [] },
        'Clockspring (Steering Wheel/Airbag Wiring)': { parts: [] },
        'Door Switches (Lock/Window)': { parts: [] },
        'Headlight Switch': { parts: [] },
        'Ignition Switch': { parts: [] },
        'Instrument Cluster/Speedometer': { parts: [] },
        'Sunroof Motor': { parts: [] },
        'Switch Panel': { parts: [] },
        'Other Interior Electrical Part': { parts: [] }
      }
    },
    'Engine': {
      label: 'Engine',
      subcategories: {
        'Air Injection Pump/Secondary Air Pump': { parts: [] },
        'Cam Phaser/VVT Actuator': { parts: [] },
        'Camshaft': { parts: [] },
        'Complete Engine Assembly': { parts: [] },
        'Connecting Rod & Piston': { parts: [] },
        'Crankshaft': { parts: [] },
        'Cylinder Head': { parts: [] },
        'Engine/Cylinder Block': { parts: [] },
        'Flywheel/Flexplate': { parts: [] },
        'Harmonic Balancer': { parts: [] },
        'Ignition Coil': { parts: [] },
        'Oil Pan': { parts: [] },
        'Oil Pump': { parts: [] },
        'Turbocharger/Supercharger': { parts: [] },
        'Valve Cover': { parts: [] },
        'Valvetrain Parts': { parts: [] },
        'Water Pump': { parts: [] },
        'Other Engine Part': { parts: [] }
      }
    },
    'Engine/Engine Bay Accessories': {
      label: 'Engine/Engine Bay Accessories',
      subcategories: {
        'A/C Compressor': { parts: [] },
        'Alternator': { parts: [] },
        'Battery': { parts: [] },
        'Battery Tray': { parts: [] },
        'Engine Cooling Fan (Electric)': { parts: [] },
        'Engine Cradle/Subframe': { parts: [] },
        'Engine Driven Fans, Clutches, & Fan Shrouds': { parts: [] },
        'Radiators & Coolers': {
          parts: [
            'A/C Condenser',
            'Engine Oil Cooler',
            'Intercooler',
            'Power Steering Cooler',
            'Radiator',
            'Transmission Oil Cooler',
            'Other Cooler'
          ]
        },
        'Starter Motor': { parts: [] },
        'Washer Bottle': { parts: [] },
        'Other Engine Accessory Part': { parts: [] }
      }
    },
    'Exterior': {
      label: 'Exterior',
      subcategories: {
        'Bumpers & Parts': {
          parts: [
            'Front Bumper',
            'Front Bumper Reinforcements',
            'Rear Bumper',
            'Rear Bumper Reinforcement',
            'Bumper End Caps/Shocks',
            'Other Bumper Part'
          ]
        },
        'Convertible Top Parts': {
          parts: [
            'Convertible Top',
            'Convertible Top Motor/Pump',
            'Convertible Top Module/Computer',
            'Convertible Flaps/Trim',
            'Other Convertible Part'
          ]
        },
        'Engine Cradle/Subframe': { parts: [] },
        'Fenders & Parts': {
          parts: [
            'Fender',
            'Fender Liner',
            'Fender Moulding/Overfender/Trim',
            'Other Fender Part'
          ]
        },
        'Grille': { parts: [] },
        'Header Panel/Radiator Core Support': { parts: [] },
        'Hood': {
          parts: [
            'Hood',
            'Hood Emblem',
            'Hood Hinge',
            'Hood Latch',
            'Other Hood Part'
          ]
        },
        'Luggage/Roof Rack': { parts: [] },
        'Running Board': { parts: [] },
        'Side View Door Mirror': { parts: [] },
        'Wiper Motors & Arms': {
          parts: [
            'Front Wiper Arm',
            'Front Wiper Motor',
            'Rear Wiper Arm',
            'Rear Wiper Motor',
            'Other Wiper Part'
          ]
        },
        'Other Exterior Part': { parts: [] }
      }
    },
    'Interior': {
      label: 'Interior',
      subcategories: {
        'Armrest': { parts: [] },
        'Brake/Clutch Pedal': { parts: [] },
        'Cargo Cover': { parts: [] },
        'Console': {
          parts: [
            'Front Center Consoles & Parts',
            'Overhead Consoles & Dome Lights',
            'Rear Center Consoles & Parts',
            'Other Console Part'
          ]
        },
        'Dash Assembly': { parts: [] },
        'Dash Pad/Top Panel': { parts: [] },
        'Defroster Vent Panel': { parts: [] },
        'Floor Mats': { parts: [] },
        'Gas/Accelerator Pedal': { parts: [] },
        'Glove Box': { parts: [] },
        'Instrument Cluster/Speedometer': { parts: [] },
        'Rearview Mirror': { parts: [] },
        'Seat Belt': { parts: [] },
        'Shifter': { parts: [] },
        'Steering Wheel': { parts: [] },
        'Other Interior Part': { parts: [] }
      }
    },
    'Intake, Exhaust, & Fuel': {
      label: 'Intake, Exhaust, & Fuel',
      subcategories: {
        'Air Cleaner': { parts: [] },
        'Air Intake Tube/Resonator': { parts: [] },
        'Air Shutter/Splitter/Guide': { parts: [] },
        'Evaporator/Charcoal Vapor Canister': { parts: [] },
        'Exhaust Manifold': { parts: [] },
        'Fuel Injector': { parts: [] },
        'Fuel Line': { parts: [] },
        'Fuel Pump': {
          parts: [
            'High Pressure (Engine Driven)',
            'Low Pressure (In Tank)',
            'Other Fuel Pump Part'
          ]
        },
        'Fuel Rail': { parts: [] },
        'Fuel/Gas Cap': { parts: [] },
        'Fuel/Water Separator': { parts: [] },
        'Intake Manifold': { parts: [] },
        'Mass Air Meter': { parts: [] },
        'Muffler': { parts: [] },
        'Resonator': { parts: [] },
        'Throttle Body': { parts: [] },
        'Other Exhaust Part': { parts: [] },
        'Other Fuel Part': { parts: [] },
        'Other Intake Part': { parts: [] }
      }
    },
    'Lights & Lamps': {
      label: 'Lights & Lamps',
      subcategories: {
        '3rd Brake Light': { parts: [] },
        'Fog/Driving Light': { parts: [] },
        'Headlight': { parts: [] },
        'Rear Lamp/Backup Light': { parts: [] },
        'Tail Light': { parts: [] },
        'Trunk Finish Panel': { parts: [] },
        'Other Light/Lamp Part': { parts: [] }
      }
    },
    'Radio/Infotainment': {
      label: 'Radio/Infotainment',
      subcategories: {
        'Amplifier': { parts: [] },
        'Radio Receiver/CD-Player': { parts: [] },
        'Radio/Infotainment Faceplate': { parts: [] },
        'Speaker': { parts: [] },
        'Other Radio/Infotainment Part': { parts: [] }
      }
    },
    'Steering & Suspension': {
      label: 'Steering & Suspension',
      subcategories: {
        'Air Suspension Compressor': { parts: [] },
        'Coil Spring': { parts: [] },
        'Control Arms': {
          parts: [
            'Front Lower',
            'Front Upper',
            'Rear Lower',
            'Rear Upper'
          ]
        },
        'Engine Cradle/Subframe': { parts: [] },
        'Stabilizer Bar/Sway bar': { parts: [] },
        'Steering Column': { parts: [] },
        'Steering Column Intermediate Link': { parts: [] },
        'Steering Knuckle/Hub': { parts: [] },
        'Steering Rack/Gear': { parts: [] },
        'Steering Wheel': { parts: [] },
        'Strut (Loaded Shock)': { parts: [] },
        'Strut Tower Brace': { parts: [] },
        'Other Steering/Suspension Part': { parts: [] }
      }
    },
    'Transmission & Drivetrain': {
      label: 'Transmission & Drivetrain',
      subcategories: {
        'Axle/Half/Drive/Prop Shaft': { parts: [] },
        'Front Carrier/Differential/Axle': { parts: [] },
        'Front Driveshaft': { parts: [] },
        'Rear Carrier/Differential/Axle': { parts: [] },
        'Rear Driveshaft': { parts: [] },
        'Torque Converter': { parts: [] },
        'Transfer Case': { parts: [] },
        'Transmission': { parts: [] },
        'Other Transmission/Drivetrain Part': { parts: [] }
      }
    },
    'Miscellaneous': {
      label: 'Miscellaneous',
      subcategories: {
        'Key Fob': { parts: [] },
        'Owner\'s Manual': { parts: [] },
        'Plow Parts': { parts: [] },
        'Towing Parts': { parts: [] },
        'Other Miscellaneous Part': { parts: [] }
      }
    }
  };
  
  // Flatten categories for search
  export const flattenedParts = [];
  Object.entries(PART_CATEGORIES).forEach(([category, categoryData]) => {
    Object.entries(categoryData.subcategories).forEach(([subcategory, subcategoryData]) => {
      if (subcategoryData.parts && subcategoryData.parts.length > 0) {
        // Handle nested parts
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
        // Handle direct subcategories
        flattenedParts.push({
          id: `${category}-${subcategory}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: subcategory,
          category,
          subcategory,
          searchTerms: `${category} ${subcategory}`.toLowerCase()
        });
      }
    });
  });
  
  // Helper function to get subcategories for a category
  export const getSubcategories = (category) => {
    return category ? PART_CATEGORIES[category]?.subcategories || {} : {};
  };
  
  // Helper function to get parts for a subcategory
  export const getParts = (category, subcategory) => {
    return category && subcategory ? 
      PART_CATEGORIES[category]?.subcategories[subcategory]?.parts || [] : 
      [];
  };
  
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