// src/components/DismantledVehiclesPage.jsx
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Clock, Wrench, Calendar } from 'lucide-react';
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

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        console.log('Starting fetch request...');
        
        // Log the full URL being requested
        const fullUrl = `${import.meta.env.VITE_API_BASE_URL}/dismantled-vehicles`;
        console.log('Requesting URL:', fullUrl);
        
        const response = await apiClient.dismantledVehicles.getAll();
        console.log('Response received:', {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        console.log('Raw response text:', text);
        
        let data;
        try {
          data = JSON.parse(text);
          console.log('Parsed data:', data);
        } catch (e) {
          console.error('JSON parse error:', e);
          throw new Error('Failed to parse response as JSON');
        }
        
        setVehicles(data);
      } catch (err) {
        console.error('Fetch error details:', {
          name: err.name,
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

  // Debug log for vehicles state updates
  useEffect(() => {
    console.log('Vehicles state updated:', {
      count: vehicles.length,
      loading,
      error,
      firstVehicle: vehicles[0]
    });
  }, [vehicles, loading, error]);

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
    {/* Keeping the existing content */}
    <div className="container mx-auto px-4 text-center">
      <h1 className="text-4xl font-bold text-white mb-4">Used OEM Parts</h1>
      <p className="text-xl text-white/90 max-w-2xl mx-auto">
        Quality recycled auto parts from late model vehicles. All parts are thoroughly inspected and tested.
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

          {/* eBay Store Section - Right 1/3 */}
          <div className="w-1/3">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Shop Our eBay Store</h2>
              <div className="space-y-4">
                {/* eBay Store Preview */}
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <div className="bg-red-600 p-4 text-white">
                    <img 
                      src="/images/ebay-white-logo.png" 
                      alt="eBay" 
                      className="h-8"
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-gray-600">
                      Browse thousands of quality used auto parts in our eBay store
                    </p>
                    <a 
                      href="https://www.ebay.com/str/Phoenix-Automotive"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-red-600 text-white text-center py-3 px-4 rounded-md hover:bg-red-700 transition-colors"
                    >
                      Visit Our eBay Store
                    </a>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold mb-2">Contact Us</h3>
                  <div className="space-y-2 text-gray-600">
                    <p>Phone: (315) 830-0008</p>
                    <p>Text: (315) 404-0570</p>
                    <p>Hours: Mon-Fri 8am-5pm</p>
                    <p>Sat-Sun: Text Only</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold mb-2">Can&apos;t find what you need?</h3>
                  <p className="text-gray-600">
                    We&apos;re constantly adding new inventory. Contact us directly for the most up-to-date availability or to request specific parts.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DismantledVehiclesPage;