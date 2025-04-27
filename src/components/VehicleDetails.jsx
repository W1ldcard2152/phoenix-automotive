import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  ChevronLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '../utils/apiClient';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        console.log('Fetching vehicle with ID:', id);
        
        // Validate ID format before making request
        if (!id || id.length < 10) {
          throw new Error('Invalid vehicle ID format');
        }
        
        const response = await fetch(`/api/retail-vehicles/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Vehicle not found');
          } else {
            const errorText = await response.text();
            throw new Error(`API error: ${response.status} - ${errorText}`);
          }
        }
        
        const data = await response.json();
        console.log('Received vehicle data:', data);
        setVehicle(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching vehicle:', err);
        setError(err.message || 'Failed to load vehicle details');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  if (loading) return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-red-700" />
        <p>Loading vehicle details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center space-y-6">
        <AlertCircle className="h-16 w-16 text-red-600 mx-auto" />
        <div className="text-xl font-bold text-red-600">Error loading vehicle</div>
        <p>{error}</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/inventory')}
          className="mx-auto mt-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Return to Inventory
        </Button>
      </div>
    </div>
  );

  if (!vehicle) return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center">
        <p>Vehicle not found</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/inventory')}
          className="mx-auto mt-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Return to Inventory
        </Button>
      </div>
    </div>
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Invalid date';
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'Price not available';
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    } catch (e) {
      console.error('Price formatting error:', e);
      return `${price}`;
    }
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
                <span>Mileage: {vehicle.mileage?.toLocaleString() || 'N/A'} miles</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Car className="h-4 w-4 mr-2" />
                <span>Condition: {vehicle.condition || 'Not specified'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Cog className="h-4 w-4 mr-2" />
                <span>Transmission: {vehicle.transmission || 'Not specified'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Fuel className="h-4 w-4 mr-2" />
                <span>Fuel Type: {vehicle.fuelType || 'Not specified'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <PaintBucket className="h-4 w-4 mr-2" />
                <span>Color: {vehicle.exteriorColor || 'Not specified'}</span>
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
                <span>{vehicle.engineType || 'Not specified'}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 py-2 border-b">
  <span className="font-medium">Drive Type</span>
  <span>{vehicle.driveType ? vehicle.driveType.toUpperCase() : 'Not Specified'}</span>
</div>
              <div className="grid grid-cols-2 gap-x-4 py-2 border-b">
                <span className="font-medium">Exterior Color</span>
                <span>{vehicle.exteriorColor || 'Not specified'}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 py-2 border-b">
                <span className="font-medium">Interior Color</span>
                <span>{vehicle.interiorColor || 'Not specified'}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 py-2 border-b">
                <span className="font-medium">Status</span>
                <span className="capitalize">{vehicle.status || 'Not specified'}</span>
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