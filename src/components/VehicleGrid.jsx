import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Wrench, CircleDot } from 'lucide-react';

const STATUS_COLORS = {
  'Parts Available': 'bg-green-500',
  'Awaiting Dismantle': 'bg-yellow-500',
  'Scrapped': 'bg-red-500',
  'available': 'bg-green-500',
  'pending': 'bg-yellow-500',
  'sold': 'bg-red-500'
};

const VehicleGrid = ({ vehicles }) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((vehicle) => (
        <Card key={vehicle._id} className="overflow-hidden">
          <Link to={`/inventory/${vehicle._id}`} className="block">
            <div className="relative h-56"> {/* Increased from h-48 to h-56 */}
              <img 
                src={vehicle.imageUrl || "/api/placeholder/400/300"} 
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
              <Badge 
                className={`absolute top-2 right-2 ${
                  STATUS_COLORS[vehicle.status] || 'bg-gray-500'
                }`}
              >
                {vehicle.status || "Unknown Status"}
              </Badge>
            </div>
          </Link>
          
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">
                <Link to={`/inventory/${vehicle._id}`} className="hover:text-red-700">
                  {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                </Link>
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                Stock #{vehicle.stockNumber}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              VIN: {vehicle.vin}
              {vehicle.exteriorColor && (
                <div className="mt-1">Color: {vehicle.exteriorColor}</div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{vehicle.mileage?.toLocaleString()} miles</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>
                    {new Date(vehicle.dateAcquired).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {(vehicle.engineType || vehicle.transmission) && (
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  {vehicle.engineType && (
                    <div className="flex items-center">
                      <Wrench className="mr-2 h-4 w-4" />
                      <span>{vehicle.engineType}</span>
                    </div>
                  )}
                  {vehicle.transmission && (
                    <div className="flex items-center">
                      <CircleDot className="mr-2 h-4 w-4" />
                      <span>{vehicle.transmission}</span>
                    </div>
                  )}
                </div>
              )}

              {(vehicle.driveType || vehicle.wheelSize) && (
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  {vehicle.driveType && <div>Drive: {vehicle.driveType}</div>}
                  {vehicle.wheelSize && <div>Wheels: {vehicle.wheelSize}</div>}
                </div>
              )}

              {vehicle.notes && (
                <div className="text-sm text-muted-foreground mt-2 border-t pt-2">
                  <span className="font-semibold">Notes:</span> {vehicle.notes}
                </div>
              )}

              {vehicle.partsAvailable && vehicle.partsAvailable.length > 0 && (
                <div className="text-sm text-muted-foreground border-t pt-2">
                  <span className="font-semibold">Available Parts:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {vehicle.partsAvailable.map((part, index) => (
                      <Badge key={index} variant="secondary">
                        {part}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const VehiclePropType = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  make: PropTypes.string.isRequired,
  model: PropTypes.string.isRequired,
  year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  vin: PropTypes.string.isRequired,
  mileage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  status: PropTypes.oneOf(['Parts Available', 'Awaiting Dismantle', 'Scrapped', '']),
  stockNumber: PropTypes.string,
  trim: PropTypes.string,
  imageUrl: PropTypes.string,
  dateAcquired: PropTypes.string,
  exteriorColor: PropTypes.string,
  engineType: PropTypes.string,
  transmission: PropTypes.string,
  driveType: PropTypes.string,
  wheelSize: PropTypes.string,
  notes: PropTypes.string,
  partsAvailable: PropTypes.arrayOf(PropTypes.string)
});

VehicleGrid.propTypes = {
  vehicles: PropTypes.arrayOf(VehiclePropType).isRequired
};

VehicleGrid.defaultProps = {
  vehicles: []
};

export default VehicleGrid;