// src/components/RetailVehiclesPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';

const RetailVehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await apiClient.retailVehicles.getAll();
        console.log('Raw response:', response);
        
        if (!response.ok) throw new Error('Failed to fetch vehicles');
        
        const text = await response.text();
        console.log('Response text:', text);
        
        let data;
        try {
          data = JSON.parse(text);
          console.log('Parsed data:', data);
        } catch (err) {
          console.error('JSON parse error:', err);
          throw new Error('Failed to parse vehicle data');
        }
        
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

  if (loading) return <div>Loading vehicles...</div>;
  if (error) return <div>Error loading vehicles: {error}</div>;

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative bg-[#1a1f2e] py-16">
        <div className="absolute inset-0">
          <img
            src="/images/retail-vehicle-bg.jpg"
            alt="Pre-Owned Vehicles"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        </div>
        <div className="relative">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Pre-Owned Vehicles</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Browse our selection of quality pre-owned vehicles. Each vehicle undergoes thorough inspection and comes with detailed service history.
            </p>
          </div>
        </div>
      </div>

      {/* Vehicle Grid */}
  
      <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {vehicles.length > 0 ? (
    vehicles.map((vehicle) => (
      <div key={vehicle._id} className="bg-white rounded-lg shadow-md overflow-hidden">
  <img 
    src={vehicle.imageUrl || "/api/placeholder/400/300"} 
    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
    className="w-full h-64 object-cover"
  />
  <div className="p-6">
    <h3 className="text-xl font-bold mb-3">
      {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
    </h3>
    <div className="space-y-2 mb-6">
      {vehicle.mileage && (
        <p className="text-gray-600">
          <span className="font-semibold">Mileage:</span> {vehicle.mileage.toLocaleString()} miles
        </p>
      )}
      {vehicle.price && (
        <p className="text-gray-600">
          <span className="font-semibold">Price:</span> ${vehicle.price.toLocaleString()}
        </p>
      )}
      {vehicle.trim && (
        <p className="text-gray-600">
          <span className="font-semibold">Trim:</span> {vehicle.trim}
        </p>
      )}
    </div>
    <Link 
  to={`/inventory/${vehicle._id}`}
  className="bg-red-700 text-white px-6 py-3 rounded hover:bg-red-800 transition-colors inline-block"
>
  View Details
</Link>
  </div>
</div>
    ))
  ) : (
    <p className="col-span-3">No vehicles currently available</p>
  )}
</div>
      </div>
    </div>
  );
};

export default RetailVehiclesPage;