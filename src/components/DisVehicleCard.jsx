import PropTypes from 'prop-types';
import { Calendar, Clock, Wrench, CircleDot } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DisVehicleCard = ({ 
  stockNumber,
  year, 
  make, 
  model, 
  trim,
  vin, 
  mileage,
  dateAcquired,
  status,
  imageUrl,
  exteriorColor,
  interiorColor,
  transmission,
  engineType,
  driveType,
  wheelSize,
  notes
}) => {
  const statusColors = {
    'Pre-Dismantle': 'bg-yellow-500',  // Waiting to be dismantled
    'Dismantled': 'bg-green-500',      // Parts available
    'Scrapped': 'bg-red-500'           // No longer available
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <img 
          src={imageUrl || "/api/placeholder/400/300"} 
          alt={`${year} ${make} ${model}`}
          className="w-full h-full object-cover"
        />
        <Badge 
          className={`absolute top-2 right-2 ${statusColors[status] || 'bg-gray-500'}`}
        >
          {status}
        </Badge>
      </div>
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{`${year} ${make} ${model} ${trim || ''}`}</CardTitle>
          <span className="text-sm text-muted-foreground">#{stockNumber}</span>
        </div>
        <CardDescription className="space-y-1">
          <div>VIN: {vin}</div>
          <div className="grid grid-cols-2 gap-2">
            {exteriorColor && <div>Exterior: {exteriorColor}</div>}
            {interiorColor && <div>Interior: {interiorColor}</div>}
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-2 h-4 w-4" />
              <span>{mileage?.toLocaleString()} miles</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              <span>{new Date(dateAcquired).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            {engineType && (
              <div className="flex items-center">
                <Wrench className="mr-2 h-4 w-4" />
                <span>{engineType}</span>
              </div>
            )}
            {transmission && (
              <div className="flex items-center">
                <CircleDot className="mr-2 h-4 w-4" />
                <span>{transmission}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            {driveType && (
              <div>Drive Type: {driveType}</div>
            )}
            {wheelSize && (
              <div>Wheel Size: {wheelSize}</div>
            )}
          </div>

          {notes && (
            <div className="text-sm text-muted-foreground mt-2">
              <span className="font-semibold">Notes:</span> {notes}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

DisVehicleCard.propTypes = {
  stockNumber: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  make: PropTypes.string.isRequired,
  model: PropTypes.string.isRequired,
  trim: PropTypes.string,
  vin: PropTypes.string.isRequired,
  mileage: PropTypes.number.isRequired,
  dateAcquired: PropTypes.string.isRequired, // Expects ISO date string
  status: PropTypes.oneOf(['Pre-Dismantle', 'Dismantled', 'Scrapped']),
  imageUrl: PropTypes.string,
  exteriorColor: PropTypes.string,
  interiorColor: PropTypes.string,
  transmission: PropTypes.string,
  engineType: PropTypes.string,
  driveType: PropTypes.string,
  wheelSize: PropTypes.string,
  notes: PropTypes.string
};

DisVehicleCard.defaultProps = {
  status: 'Pre-Dismantle',
  trim: '',
  imageUrl: '',
  exteriorColor: '',
  interiorColor: '',
  transmission: '',
  engineType: '',
  driveType: '',
  wheelSize: '',
  notes: ''
};

export default DisVehicleCard;