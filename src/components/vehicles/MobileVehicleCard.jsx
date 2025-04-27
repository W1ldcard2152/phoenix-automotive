// src/components/vehicles/MobileVehicleCard.jsx
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from 'lucide-react';

export const MobileVehicleCard = ({ vehicle }) => {
  return (
    <Card className="overflow-hidden">
      <Link to={`/inventory/${vehicle._id}`} className="block">
        <div className="relative h-48">
          <img 
            src={vehicle.imageUrl || "/api/placeholder/400/300"} 
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover cursor-pointer"
          />
          {vehicle.status && (
            <Badge 
              className="absolute top-2 right-2"
              variant={vehicle.status === 'Parts Available' ? 'success' : 'secondary'}
            >
              {vehicle.status}
            </Badge>
          )}
        </div>
      </Link>
      
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">
          <Link to={`/inventory/${vehicle._id}`} className="hover:text-red-700 transition-colors">
            {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
          </Link>
        </h3>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {vehicle.mileage?.toLocaleString()} mi
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(vehicle.dateAcquired).toLocaleDateString()}
            </div>
          </div>
          
          {vehicle.engineType && (
            <div className="border-t pt-2">
              Engine: {vehicle.engineType}
            </div>
          )}
          
          {vehicle.vin && (
            <div className="font-mono text-xs">
              VIN: {vehicle.vin}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// src/components/vehicles/VehicleGrid.jsx
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { MobileVehicleCard } from './MobileVehicleCard';

const VehicleGrid = ({ vehicles }) => {
  const { isMobile } = useBreakpoint();
  
  return (
    <ResponsiveGrid>
      {vehicles.map((vehicle) => (
        isMobile ? (
          <MobileVehicleCard key={vehicle._id} vehicle={vehicle} />
        ) : (
          <DesktopVehicleCard key={vehicle._id} vehicle={vehicle} />
        )
      ))}
    </ResponsiveGrid>
  );
};