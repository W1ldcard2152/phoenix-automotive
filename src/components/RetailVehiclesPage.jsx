// src/components/RetailVehiclesPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, ResponsiveGrid } from '@/components/layout';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, GaugeCircle, Car, Cog, Phone, MessageSquare } from 'lucide-react';

const RetailVehiclesPage = () => {
  const { isMobile } = useBreakpoint();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    // Create an AbortController for fetch cancelation
    const controller = new AbortController();
    
    const fetchVehicles = async () => {
      if (retryCount >= MAX_RETRIES) {
        setError("Maximum retry attempts reached. Please try again later.");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching retail vehicles data...');
        
        // Use the new batched endpoint
        const response = await fetch('/api/vehicle-data/batched', {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'max-age=30'
          }
        });
        
        if (!response.ok) {
          // Check for rate limiting
          if (response.status === 429) {
            const retryAfter = parseInt(response.headers.get('Retry-After') || '5');
            console.warn(`Rate limited. Retrying after ${retryAfter} seconds...`);
            
            // Increment retry count
            setRetryCount(prev => prev + 1);
            
            // Wait and retry
            setTimeout(() => fetchVehicles(), retryAfter * 1000);
            return;
          }
          
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received vehicle data:', data.retailVehicles.length);
        
        // Only set retail vehicles from the batched response
        setVehicles(data.retailVehicles);
        setError(null);
      } catch (err) {
        // Don't set error for aborted requests
        if (err.name === 'AbortError') {
          console.log('Fetch aborted');
          return;
        }
        
        console.error('Fetch error:', err);
        setError(`Error: ${err.message}`);
        
        // Implement exponential backoff retry
        const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 30000);
        console.log(`Retrying in ${backoffTime/1000} seconds...`);
        
        // Increment retry count
        setRetryCount(prev => prev + 1);
        
        // Wait and retry
        setTimeout(() => fetchVehicles(), backoffTime);
      } finally {
        setLoading(false);
      }
    };
  
    fetchVehicles();
    
    // Cleanup function to abort fetch if component unmounts
    return () => {
      console.log('Aborting vehicle data fetch');
      controller.abort();
    };
  }, []); // Empty dependency array ensures it only runs once on mount

  const VehicleCard = ({ vehicle }) => (
    <Card className="overflow-hidden bg-white hover:shadow-lg transition-shadow">
      <Link to={`/inventory/${vehicle._id}`} className="block">
        <div className="relative aspect-w-16 aspect-h-12">
          <img 
            src={vehicle.imageUrl || "/api/placeholder/400/300"} 
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover cursor-pointer"
            loading="lazy"
          />
          {vehicle.status && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-sm px-2 py-1 rounded">
              {vehicle.status}
            </div>
          )}
        </div>
      </Link>
      <div className="p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-bold mb-3">
          <Link to={`/inventory/${vehicle._id}`} className="hover:text-red-700 transition-colors">
            {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
          </Link>
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

  const SidebarContent = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Contact Our Sales Team</h3>
        <div className="space-y-3 text-gray-600">
          <a href="tel:3158300008" className="flex items-center gap-2 hover:text-red-700 transition-colors">
            <Phone className="h-4 w-4 text-red-700" />
            <span>(315) 830-0008</span>
          </a>
          <a href="sms:coming-soon" className="flex items-center gap-2 hover:text-red-700 transition-colors">
            <MessageSquare className="h-4 w-4 text-red-700" />
            <span>Coming Soon</span>
          </a>
          <div className="border-t pt-3 mt-3">
            <p className="font-medium">Hours:</p>
            <p>Mon-Fri: 8am-5pm</p>
            <p>Sat-Sun: Text Only</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-[#1a1f2e] text-white">
        <h3 className="text-lg font-bold mb-4">Looking for Parts?</h3>
        <p className="text-white/90 mb-6">
          We also offer quality recycled auto parts for various makes and models.
        </p>
        <div className="space-y-3">
          <Button 
            className="w-full bg-red-700 hover:bg-red-800"
            asChild
          >
            <Link to="/parts" className="inline-flex items-center justify-center gap-2">
              Browse Parts Inventory
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button 
            variant="outline" 
            className="w-full border-white/20 hover:bg-white/10"
            asChild
          >
            <Link to="/partsrequest">Request Specific Part</Link>
          </Button>
        </div>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <ResponsiveContainer>
        <div className="text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded mx-auto"/>
            <div className="h-4 w-64 bg-gray-200 rounded mx-auto"/>
            <div className="h-64 w-full max-w-md bg-gray-200 rounded mx-auto mt-8"/>
          </div>
        </div>
      </ResponsiveContainer>
    );
  }

  if (error) {
    return (
      <ResponsiveContainer>
        <div className="text-center">
          <div className="text-red-600 space-y-4">
            <h3 className="text-xl font-bold">Error loading vehicles</h3>
            <p>{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setRetryCount(0);
                setError(null);
                window.location.reload();
              }}
            >
              Retry
            </Button>
          </div>
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Hero Banner */}
      <section className="relative bg-[#1a1f2e]">
        <div className="relative h-[400px] md:h-[400px] overflow-hidden">
          <img
            src="/images/retail-vehicle-bg.jpg"
            alt="Pre-Owned Vehicles"
            className="absolute inset-0 w-full h-full object-cover md:object-center opacity-40"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
          
          <ResponsiveContainer
            mobileClassName="absolute inset-0 flex items-start px-4 pt-12"
            desktopClassName="absolute inset-0 container mx-auto px-4 flex items-center"
          >
            <div className="w-full max-w-3xl mx-auto text-center">
              <div className="space-y-4 md:space-y-6">
                <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight">
                  Pre-Owned Vehicles
                </h1>
                <p className="text-sm md:text-xl text-white max-w-2xl mx-auto leading-relaxed">
                  Browse our selection of quality pre-owned vehicles. Each vehicle undergoes thorough inspection and comes with detailed service history.
                </p>
                
                {isMobile && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button 
                      className="w-full bg-red-700 hover:bg-red-800 text-white"
                      asChild
                    >
                      <a href="tel:3158300008" className="inline-flex items-center justify-center gap-2">
                        <Phone className="h-4 w-4" />
                        Contact Sales
                      </a>
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full border-white bg-white/5 hover:bg-white/10 text-white"
                      asChild
                    >
                      <Link to="/parts" className="inline-flex items-center justify-center gap-2">
                        Shop Parts
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Main Content */}
      <ResponsiveContainer>
        <div className="flex flex-col md:flex-row gap-8">
          <div className={isMobile ? "w-full" : "w-3/4"}>
            <ResponsiveGrid
              mobileClassName="grid grid-cols-1 gap-6"
              tabletClassName="grid grid-cols-2 gap-6"
              desktopClassName="grid grid-cols-2 gap-6"
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
          </div>

          {!isMobile && (
            <div className="w-1/4">
              <div className="sticky top-24">
                <SidebarContent />
              </div>
            </div>
          )}
        </div>
      </ResponsiveContainer>
    </div>
  );
};

export default RetailVehiclesPage;