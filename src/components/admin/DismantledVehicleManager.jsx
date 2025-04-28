import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { apiClient } from '../../utils/apiClient';
import { 
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import DismantledVehicleForm from './DismantledVehicleForm';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

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
      const data = await apiClient.dismantledVehicles.getAll();
      console.log('Dismantled vehicles received:', data.length);
      setVehicles(data);
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

  if (loading) return <div>Loading vehicles...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6 p-6">
      {showForm ? (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">
              {editingVehicle ? 'Edit Dismantled Vehicle' : 'Add New Vehicle'}
            </h2>
            <DismantledVehicleForm
              initialData={editingVehicle}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
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
              {/* ... rest of the table code remains the same ... */}
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
                      <TableCell>{vehicle.make}</TableCell>
                      <TableCell>{vehicle.model}</TableCell>
                      <TableCell>{vehicle.year}</TableCell>
                      <TableCell>{vehicle.status}</TableCell>
                      <TableCell>${vehicle.price?.toLocaleString()}</TableCell>
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
                    {/* ... expanded row content remains the same ... */}
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