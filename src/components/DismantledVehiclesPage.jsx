import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Wrench, Calendar, ArrowRight } from 'lucide-react';
import { apiClient } from '../utils/apiClient';
import { ResponsiveContainer, MobileDrawer } from '@/components/layout';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const DismantledVehiclesPage = () => {
  const { isMobile } = useBreakpoint();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any existing errors
        
        console.log('Starting vehicle fetch...');
        const data = await apiClient.dismantledVehicles.getAll();
        console.log('Received vehicle data:', data);
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format');
        }
        
        setVehicles(data);
      } catch (err) {
        console.error('Failed to fetch vehicles:', {
          message: err.message,
          stack: err.stack
        });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchVehicles();
  }, []);

  const SidebarContent = () => (
    <div className="space-y-6">
      {/* eBay Store Card - UPDATED */}
      <Card className="overflow-hidden">
        <a 
          href="https://www.ebay.com/str/Phoenix-Automotive"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <img 
            src="/images/ebay.jpg" 
            alt="Phoenix Automotive eBay Store" 
            className="w-full h-auto"
          />
          <div className="p-4 text-center bg-white">
            <p className="text-lg font-semibold text-gray-800">Click to visit our eBay Store!</p>
          </div>
        </a>
      </Card>

      {/* Contact Card */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Contact Us</h3>
        <div className="space-y-3 text-gray-600">
          <a href="tel:3158300008" className="flex justify-between hover:text-red-700">
            <span>Phone:</span>
            <span className="font-medium">(315) 830-0008</span>
          </a>
          <a href="sms:coming-soon" className="flex justify-between hover:text-red-700">
            <span>Text:</span>
            <span className="font-medium">Coming Soon</span>
          </a>
          <div className="border-t pt-3">
            <p className="flex justify-between">
              <span>Mon-Fri:</span>
              <span className="font-medium">8am-5pm</span>
            </p>
            <p className="flex justify-between">
              <span>Sat-Sun:</span>
              <span className="font-medium">Text Only</span>
            </p>
          </div>
        </div>
      </Card>

      {/* Parts Request Card */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-3">Can't find what you need?</h3>
        <p className="text-gray-600 mb-4">
          We're constantly adding new inventory. Submit a parts request and we'll help you find what you're looking for.
        </p>
        <Link to="/partsrequest">
          <Button 
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            size={isMobile ? "default" : "lg"}
          >
            Submit Parts Request
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </Card>
    </div>
  );

  const VehicleCard = ({ vehicle }) => (
    <Card key={vehicle._id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 relative">
        <img 
          src={vehicle.imageUrl || "/api/placeholder/400/300"} 
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="text-lg font-bold text-white">
            {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
          </h3>
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>{vehicle.mileage?.toLocaleString()} miles</span>
          </div>
          {vehicle.engineType && (
            <div className="flex items-center gap-2 text-gray-600">
              <Wrench className="h-4 w-4 flex-shrink-0" />
              <span>{vehicle.engineType}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{new Date(vehicle.dateAcquired).toLocaleDateString()}</span>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-semibold">VIN:</span> {vehicle.vin}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-semibold">Status:</span> {vehicle.status}
          </div>
        </div>
      </div>
    </Card>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="text-center text-gray-600">Loading vehicles...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="text-center text-red-600">
            <p className="font-semibold mb-2">Error loading vehicles</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      );
    }

    return isMobile ? (
      // Mobile Layout
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-4">Recently Dismantled Vehicles</h2>
          <div className="grid grid-cols-1 gap-4">
            {vehicles.length > 0 ? (
              vehicles.map((vehicle) => (
                <VehicleCard key={vehicle._id} vehicle={vehicle} />
              ))
            ) : (
              <p>No vehicles currently available for parts</p>
            )}
          </div>
        </div>

        <div className="fixed bottom-4 right-4">
          <MobileDrawer
            isOpen={isDrawerOpen}
            onClose={setIsDrawerOpen}
            trigger={
              <Button size="lg" className="rounded-full shadow-lg bg-red-600 hover:bg-red-700 text-white">
                Contact & Info
              </Button>
            }
          >
            <SidebarContent />
          </MobileDrawer>
        </div>
      </div>
    ) : (
      // Desktop Layout
      <div className="flex gap-8">
        <div className="w-2/3">
          <h2 className="text-2xl font-bold mb-6">Recently Dismantled Vehicles</h2>
          <div className="grid grid-cols-2 gap-6">
            {vehicles.length > 0 ? (
              vehicles.map((vehicle) => (
                <VehicleCard key={vehicle._id} vehicle={vehicle} />
              ))
            ) : (
              <p>No vehicles currently available for parts</p>
            )}
          </div>
        </div>
        <div className="w-1/3">
          <div className="sticky top-24">
            <SidebarContent />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      {/* Hero Banner */}
      <section className="relative bg-[#1a1f2e]">
        <div className="relative h-[400px] md:h-[400px] overflow-hidden">
          <img
            src="/images/parts-page-bg.jpg"
            alt="Phoenix Automotive Parts"
            className="absolute inset-0 w-full h-full object-cover md:object-center opacity-40"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/60" />
          
          <ResponsiveContainer
            mobileClassName="absolute inset-0 flex items-center justify-center px-4"
            desktopClassName="absolute inset-0 container mx-auto px-4 flex items-center"
          >
            <div className="w-full max-w-3xl mx-auto text-center">
              <div className="space-y-4 md:space-y-6">
                <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight">
                  Quality Used Auto Parts
                </h1>
                <p className="text-sm md:text-xl text-white max-w-2xl mx-auto leading-relaxed">
                  Browse our selection of thousands of recycled OEM parts guaranteed to fit and work in your car. All parts are inspected and guaranteed to be in excellent working condition unless otherwise noted.
                </p>
                
                <div className="pt-4">
                  <Button 
                    className="bg-red-700 hover:bg-red-800 text-white px-8 py-6 text-lg shadow-lg"
                    asChild
                  >
                    <a 
                      href="https://www.ebay.com/str/Phoenix-Automotive"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2"
                    >
                      Visit Our eBay Store
                      <ArrowRight className="h-5 w-5" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Main Content */}
      <ResponsiveContainer>
        {renderContent()}
      </ResponsiveContainer>
    </div>
  );
};

export default DismantledVehiclesPage;