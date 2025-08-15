// src/lib/utils.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Existing utility function
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// New image utility functions
export function defineImagePath(imagePath) {
  // Base path for vehicle images
  const baseImagePath = '/images/vehicles/';
  
  // If no image is provided, return a proper placeholder
  if (!imagePath) {
    return '/images/placeholder-vehicle.svg';
  }
  
  // Return the full path
  return `${baseImagePath}${imagePath}`;
}

export function generateVehicleId(make, year, sequence) {
  // Create a consistent ID format: MAKE-YEAR-SEQUENCE
  // Example: RAV4-2024-001
  return `${make.replace(/\s+/g, '')}-${year}-${sequence.toString().padStart(3, '0')}`;
}