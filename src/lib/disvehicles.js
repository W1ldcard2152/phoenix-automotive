// src/lib/disvehicles.js

export const VehicleStatus = {
  AVAILABLE: 'Available',
  PENDING: 'Pending',
  PARTED: 'Parted Out',
};

// Example of how to structure a real vehicle entry
export const vehicles = [
  {
    stockNumber: 'CA0400', // Using your inventory system format
    year: 2019,
    make: 'Toyota',
    model: 'RAV4',
    trim: 'XLE',
    vin: '2T3H1RFV4KW123456',
    mileage: 89432,
    dateAcquired: '2024-02-15',
    status: VehicleStatus.AVAILABLE,
    engineSize: '2.5L 4-cylinder',
    transmission: 'Automatic',
    color: 'Silver',
    driveType: 'AWD',
    imageUrl: 'CA0400.jpg', // Simplified to single image for now
    damages: ['Front end collision', 'Deployed airbags'],
    availableParts: ['Engine assembly', 'Transmission', 'Rear doors', 'Tailgate'],
    notes: 'Clean title, engine and transmission excellent condition'
  }
];

export const getVehicleByStock = (stockNumber) => {
  return vehicles.find(vehicle => vehicle.stockNumber === stockNumber);
};

export const getVehiclesByStatus = (status) => {
  return vehicles.filter(vehicle => vehicle.status === status);
};

export const getRecentVehicles = (limit = 5) => {
  return [...vehicles]
    .sort((a, b) => new Date(b.dateAcquired) - new Date(a.dateAcquired))
    .slice(0, limit);
};

export const searchVehicles = (query) => {
  const searchTerm = query.toLowerCase();
  return vehicles.filter(vehicle => 
    vehicle.stockNumber.toLowerCase().includes(searchTerm) ||
    vehicle.make.toLowerCase().includes(searchTerm) ||
    vehicle.model.toLowerCase().includes(searchTerm) ||
    vehicle.vin.toLowerCase().includes(searchTerm)
  );
};