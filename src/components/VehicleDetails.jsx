import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Car, 
  Calendar, 
  Hash, 
  Gauge, 
  Fuel, 
  Cog, 
  PaintBucket,
  ChevronLeft
} from 'lucide-react';
import { apiClient } from '../utils/apiClient';

const VehicleDetails = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        console.log('Fetching vehicle with ID:', id);
        const data = await apiClient.retailVehicles.getById(id);
        console.log('Received vehicle data:', data);
        setVehicle(data);
      } catch (err) {
        console.error('Error fetching vehicle:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  if (loading) return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center">Loading vehicle details...</div>
    </div>
  );

  if (error) return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center text-red-600">Error loading vehicle: {error}</div>
    </div>
  );

  if (!vehicle) return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center">Vehicle not found</div>
    </div>
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Link 
        to="/inventory" 
        className="inline-flex items-center text-red-700 hover:text-red-800 mb-6"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Inventory
      </Link>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="space-y-6">
          <img
            src={vehicle.imageUrl || "/api/placeholder/800/600"}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="w-full rounded-lg shadow-lg"
          />
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
            </div>
            <div className="space-y-4">
              <Button className="w-full" size="lg">
                Contact About This Vehicle
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                Schedule Test Drive
              </Button>
            </div>
          </Card>
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
            </h1>
            <p className="text-3xl font-bold text-red-700 mb-4">
              {formatPrice(vehicle.price)}
            </p>
            <div className="flex items-center text-gray-600">
              <Hash className="h-4 w-4 mr-2" />
              <span>Stock #: {vehicle.stockNumber}</span>
            </div>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Vehicle Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Year: {vehicle.year}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Gauge className="h-4 w-4 mr-2" />
                <span>Mileage: {vehicle.mileage.toLocaleString()}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Car className="h-4 w-4 mr-2" />
                <span>Condition: {vehicle.condition}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Cog className="h-4 w-4 mr-2" />
                <span>Transmission: {vehicle.transmission}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Fuel className="h-4 w-4 mr-2" />
                <span>Fuel Type: {vehicle.fuelType}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <PaintBucket className="h-4 w-4 mr-2" />
                <span>Color: {vehicle.exteriorColor}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Detailed Specifications</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-x-4 py-2 border-b">
                <span className="font-medium">VIN</span>
                <span>{vehicle.vin}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 py-2 border-b">
                <span className="font-medium">Engine</span>
                <span>{vehicle.engineType}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 py-2 border-b">
                <span className="font-medium">Drive Type</span>
                <span>{vehicle.driveType.toUpperCase()}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 py-2 border-b">
                <span className="font-medium">Exterior Color</span>
                <span>{vehicle.exteriorColor}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 py-2 border-b">
                <span className="font-medium">Interior Color</span>
                <span>{vehicle.interiorColor}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 py-2 border-b">
                <span className="font-medium">Status</span>
                <span className="capitalize">{vehicle.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 py-2">
                <span className="font-medium">Added Date</span>
                <span>{formatDate(vehicle.createdAt)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;