import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';
import { ResponsiveContainer, ResponsiveGrid } from '@/components/layout';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, GaugeCircle, Car, Cog } from 'lucide-react';

const RetailVehiclesPage = () => {
  const { isMobile } = useBreakpoint();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await apiClient.retailVehicles.getAll();
        
        if (!response.ok) throw new Error('Failed to fetch vehicles');
        
        const text = await response.text();
        const data = JSON.parse(text);
        setVehicles(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchVehicles();
  }, []);

  const VehicleCard = ({ vehicle }) => (
    <Card className="overflow-hidden bg-white">
      <div className="aspect-w-16 aspect-h-12">
        <img 
          src={vehicle.imageUrl || "/api/placeholder/400/300"} 
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-bold mb-3">
          {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
        </h3>
        <div className="space-y-3 mb-6">
          {vehicle.price && (
            <p className="text-2xl font-bold text-red-700">
              ${vehicle.price.toLocaleString()}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            {vehicle.mileage && (
              <div className="flex items-center gap-2">
                <GaugeCircle className="h-4 w-4 flex-shrink-0" />
                <span>{vehicle.mileage.toLocaleString()} mi</span>
              </div>
            )}
            {vehicle.engineType && (
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 flex-shrink-0" />
                <span>{vehicle.engineType}</span>
              </div>
            )}
            {vehicle.transmission && (
              <div className="flex items-center gap-2">
                <Cog className="h-4 w-4 flex-shrink-0" />
                <span>{vehicle.transmission}</span>
              </div>
            )}
          </div>
        </div>
        <Button 
          className="w-full bg-red-700 hover:bg-red-800 text-white"
          size={isMobile ? "default" : "lg"}
          asChild
        >
          <Link to={`/inventory/${vehicle._id}`} className="inline-flex items-center justify-center gap-2">
            View Details
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );

  if (loading || error) {
    return (
      <ResponsiveContainer>
        <div className="text-center">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 bg-gray-200 rounded mx-auto"/>
              <div className="h-4 w-64 bg-gray-200 rounded mx-auto"/>
            </div>
          ) : (
            <div className="text-red-600">Error loading vehicles: {error}</div>
          )}
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Hero Banner */}
      <div className="relative bg-[#1a1f2e] py-8 md:py-16">
        <div className="absolute inset-0">
          <img
            src="/images/retail-vehicle-bg.jpg"
            alt="Pre-Owned Vehicles"
            className="w-full h-full object-cover opacity-40"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        </div>
        <ResponsiveContainer>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pre-Owned Vehicles
            </h1>
            <p className="text-base md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Browse our selection of quality pre-owned vehicles. Each vehicle undergoes thorough inspection and comes with detailed service history.
            </p>
          </div>
        </ResponsiveContainer>
      </div>

      {/* Vehicle Grid */}
      <ResponsiveContainer>
        <ResponsiveGrid
          mobileClassName="grid grid-cols-1 gap-6"
          tabletClassName="grid grid-cols-2 gap-6"
          desktopClassName="grid grid-cols-3 gap-6"
        >
          {vehicles.length > 0 ? (
            vehicles.map((vehicle) => (
              <VehicleCard key={vehicle._id} vehicle={vehicle} />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-600">
              No vehicles currently available
            </div>
          )}
        </ResponsiveGrid>
      </ResponsiveContainer>
    </div>
  );
};

export default RetailVehiclesPage;