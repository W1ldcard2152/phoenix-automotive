import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Wrench, Calendar, ArrowRight } from 'lucide-react';
import { apiClient } from '../utils/apiClient';

const DismantledVehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await apiClient.dismantledVehicles.getAll();
        
        if (!response.ok) throw new Error('Failed to fetch vehicles');
        
        const data = await response.json();
        console.log(`Loaded ${data.length} vehicles successfully`);
        setVehicles(data);
      } catch (err) {
        console.error('Error loading vehicles:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading vehicles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center text-red-600">Error loading vehicles: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative bg-[#1a1f2e] py-16">
        <div className="absolute inset-0">
          <img
            src="/images/parts-page-bg.jpg"
            alt="Used OEM Parts Background"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black/30 to-transparent" />
        </div>
        <div className="relative">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Used OEM Parts</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Quality recycled auto parts from late model vehicles.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4">
        <div className="flex gap-8">
          {/* Vehicle List - Left 2/3 */}
          <div className="w-2/3 grid grid-cols-2 gap-6">
            <h2 className="text-2xl font-bold col-span-2">Recently Dismantled Vehicles</h2>
            {vehicles.length > 0 ? (
              vehicles.map((vehicle) => (
                <Card key={vehicle._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Vehicle Image */}
                  <div className="h-48 relative">
                    <img 
                      src={vehicle.imageUrl || "/api/placeholder/400/300"} 
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <h3 className="text-lg font-bold text-white">
                        {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                      </h3>
                    </div>
                  </div>
                  {/* Vehicle Details */}
                  <div className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{vehicle.mileage?.toLocaleString()} miles</span>
                      </div>
                      {vehicle.engineType && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Wrench className="h-4 w-4" />
                          <span>{vehicle.engineType}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
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
              ))
            ) : (
              <p className="col-span-2">No vehicles currently available for parts</p>
            )}
          </div>

          {/* Sidebar - Right 1/3 */}
          <div className="w-1/3">
            <div className="space-y-6 sticky top-24">
              {/* eBay Store Card */}
              <Card className="overflow-hidden">
                <div className="bg-[#1a1f2e] p-6">
                  <h2 className="text-xl font-bold mb-4 text-white">Shop Our eBay Store</h2>
                  <p className="text-gray-300 mb-6">
                    Browse thousands of quality used auto parts in our eBay store
                  </p>
                  <a 
                    href="https://www.ebay.com/str/Phoenix-Automotive"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors gap-2"
                  >
                    Visit Our eBay Store
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </Card>

              {/* Contact Card */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Contact Us</h3>
                <div className="space-y-3 text-gray-600">
                  <p className="flex justify-between">
                    <span>Phone:</span>
                    <span className="font-medium">(315) 830-0008</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Text:</span>
                    <span className="font-medium">(315) 404-0570</span>
                  </p>
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
                    size="lg"
                  >
                    Submit Parts Request
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DismantledVehiclesPage;