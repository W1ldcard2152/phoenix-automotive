import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from 'lucide-react';
import RetailVehicleForm from './RetailVehicleForm';
import { apiClient } from '../../utils/apiClient';

const RetailVehicleManager = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await apiClient.retailVehicles.getAll();
      if (!response.ok) throw new Error('Failed to fetch retail vehicles');
      const data = await response.json();
      setVehicles(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this retail vehicle?')) return;
    
    try {
      const response = await apiClient.retailVehicles.delete(id);
      if (!response.ok) throw new Error('Failed to delete retail vehicle');
      await fetchVehicles();
    } catch (err) {
      setError(err.message);
      console.error('Delete error:', err);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      console.log('Submitting vehicle data:', formData);
      let response;
      
      if (editingVehicle) {
        response = await apiClient.retailVehicles.update(editingVehicle._id, formData);
      } else {
        response = await apiClient.retailVehicles.create(formData);
      }

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = 'Failed to save retail vehicle';
        
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          const errorText = await response.text();
          console.error('Error response text:', errorText);
        }
        
        throw new Error(errorMessage);
      }

      await fetchVehicles();
      setIsAddingVehicle(false);
      setEditingVehicle(null);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setIsAddingVehicle(false);
    setEditingVehicle(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading vehicles...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {(isAddingVehicle || editingVehicle) ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">
            {editingVehicle ? 'Edit Retail Vehicle' : 'Add New Retail Vehicle'}
          </h2>
          <RetailVehicleForm 
            initialData={editingVehicle}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <Button 
          onClick={() => setIsAddingVehicle(true)}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Add Retail Vehicle
        </Button>
      )}

      {vehicles.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stock Number</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Make</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle._id}>
                <TableCell>{vehicle.stockNumber}</TableCell>
                <TableCell>{vehicle.year}</TableCell>
                <TableCell>{vehicle.make}</TableCell>
                <TableCell>{vehicle.model}</TableCell>
                <TableCell>${vehicle.price?.toLocaleString()}</TableCell>
                <TableCell>{vehicle.condition}</TableCell>
                <TableCell>{vehicle.status}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingVehicle(vehicle)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(vehicle._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No retail vehicles found. Add one to get started.
        </div>
      )}
    </div>
  );
};

export default RetailVehicleManager;