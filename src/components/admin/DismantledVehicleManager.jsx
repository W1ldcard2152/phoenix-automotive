import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { apiClient } from '../../utils/apiClient';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DismantledVehicleForm from './DismantledVehicleForm';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Calendar, Clock, Wrench, Car } from 'lucide-react';

const DismantledVehicleManager = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      console.log('Attempting to fetch dismantled vehicles from admin...');
      const data = await apiClient.dismantledVehicles.getAll({ limit: 50 }); // Get first 50
      
      // Data should now be an array (apiClient extracts it from pagination)
      console.log('Dismantled vehicles received:', data.length);
      setVehicles(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    
    try {
      console.log('Attempting to delete vehicle:', id);
      await apiClient.dismantledVehicles.delete(id);
      console.log('Vehicle deleted successfully');
      await fetchVehicles();
    } catch (err) {
      setError(err.message);
      console.error('Delete error:', err);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      console.log('Submitting vehicle data:', formData);
      
      if (editingVehicle) {
        await apiClient.dismantledVehicles.update(editingVehicle._id, formData);
        console.log('Vehicle updated successfully');
      } else {
        await apiClient.dismantledVehicles.create(formData);
        console.log('Vehicle created successfully');
      }
      
      await fetchVehicles();
      handleCancel();
    } catch (err) {
      setError(err.message);
      console.error('Submit error:', err);
      alert(err.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingVehicle(null);
  };

  const toggleRowExpanded = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <div className="p-6">Loading vehicles...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6 p-6">
      {showForm ? (
        <div className="bg-white rounded-lg shadow">
          <DismantledVehicleForm
            initialData={editingVehicle}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Dismantled Vehicle Inventory</h2>
            <Button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2"
            >
              <Plus size={20} />
              Add Vehicle
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Stock #</TableHead>
                  <TableHead>VIN</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Make</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <>
                    <TableRow key={vehicle._id}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleRowExpanded(vehicle._id)}
                        >
                          {expandedRows.has(vehicle._id) ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                          }
                        </Button>
                      </TableCell>
                      <TableCell>{vehicle.stockNumber}</TableCell>
                      <TableCell className="font-mono text-xs">{vehicle.vin}</TableCell>
                      <TableCell>{vehicle.year}</TableCell>
                      <TableCell>{vehicle.make}</TableCell>
                      <TableCell>{vehicle.model}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          vehicle.status === 'Parts Available' ? 'bg-green-100 text-green-800' :
                          vehicle.status === 'Awaiting Dismantle' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {vehicle.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(vehicle)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(vehicle._id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(vehicle._id) && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-gray-50 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              {/* Vehicle details */}
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Clock className="mr-2 h-4 w-4" />
                                  <span>{vehicle.mileage?.toLocaleString() || 'N/A'} miles</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="mr-2 h-4 w-4" />
                                  <span>Acquired: {formatDate(vehicle.dateAcquired)}</span>
                                </div>
                              </div>
                              
                              {/* Engine, Transmission, Drive Type */}
                              {(vehicle.engineType || vehicle.transmission || vehicle.driveType) && (
                                <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                                  {vehicle.engineType && (
                                    <div className="flex items-center">
                                      <Wrench className="mr-2 h-4 w-4" />
                                      <span>Engine: {vehicle.engineType}</span>
                                    </div>
                                  )}
                                  {vehicle.transmission && (
                                    <div className="flex items-center">
                                      <Car className="mr-2 h-4 w-4" />
                                      <span>Transmission: {vehicle.transmission}</span>
                                    </div>
                                  )}
                                  {vehicle.driveType && (
                                    <div className="flex items-center">
                                      <Car className="mr-2 h-4 w-4" />
                                      <span>Drive Type: {vehicle.driveType}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Colors */}
                              {(vehicle.exteriorColor || vehicle.interiorColor) && (
                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                  {vehicle.exteriorColor && (
                                    <div>Exterior: {vehicle.exteriorColor}</div>
                                  )}
                                  {vehicle.interiorColor && (
                                    <div>Interior: {vehicle.interiorColor}</div>
                                  )}
                                </div>
                              )}
                              
                              {/* Notes */}
                              {vehicle.notes && (
                                <div className="text-sm text-gray-600 pt-2">
                                  <span className="font-semibold">Notes:</span> {vehicle.notes}
                                </div>
                              )}
                            </div>
                            
                            {/* Vehicle Image */}
                            <div className="flex justify-center items-center">
                              {vehicle.imageUrl ? (
                                <img 
                                  src={vehicle.imageUrl} 
                                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                                  className="max-h-48 object-cover rounded-md border"
                                />
                              ) : (
                                <div className="text-sm text-gray-500">No image available</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
};

export default DismantledVehicleManager;