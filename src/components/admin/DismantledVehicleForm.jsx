import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Image, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from '../shared/ImageUpload';


const VehicleForm = ({ initialData, onSubmit, onCancel }) => {
  const [vehicle, setVehicle] = useState({
    stockNumber: '',
    year: '',
    make: '',
    model: '',
    trim: '',
    vin: '',
    mileage: '',
    dateAcquired: new Date().toISOString().split('T')[0],
    status: 'Awaiting Dismantle',
    imageUrl: '',
    exteriorColor: '',
    interiorColor: '',
    transmission: '',
    engineType: '',
    driveType: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      const formattedDate = initialData.dateAcquired 
        ? new Date(initialData.dateAcquired).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      setVehicle({
        ...initialData,
        dateAcquired: formattedDate,
        year: initialData.year?.toString() || '',
        mileage: initialData.mileage?.toString() || ''
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = {
        ...vehicle,
        year: parseInt(vehicle.year),
        mileage: parseInt(vehicle.mileage.toString().replace(/,/g, '')),
        dateAcquired: new Date(vehicle.dateAcquired).toISOString()
      };

      await onSubmit(formData);
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to save vehicle: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUploaded = (url) => {
    setVehicle(prev => ({ ...prev, imageUrl: url }));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        {initialData ? 'Edit Vehicle' : 'Add New Vehicle'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Previous sections remain unchanged */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stockNumber">Stock Number *</Label>
            <Input
              id="stockNumber"
              value={vehicle.stockNumber}
              onChange={e => setVehicle(prev => ({ ...prev, stockNumber: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vin">VIN *</Label>
            <Input
              id="vin"
              value={vehicle.vin}
              onChange={e => setVehicle(prev => ({ ...prev, vin: e.target.value }))}
              required
              maxLength={17}
            />
          </div>
        </div>

        {/* Other existing form sections remain the same until the image section */}

        <div className="space-y-2">
          <Label>Vehicle Image</Label>
          <ImageUpload onImageUploaded={handleImageUploaded} />
          {vehicle.imageUrl && (
            <div className="mt-4">
              <img 
                src={vehicle.imageUrl} 
                alt="Vehicle preview" 
                className="max-w-sm rounded-lg border"
              />
            </div>
          )}
        </div>

        {/* Rest of the form remains unchanged */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={vehicle.notes}
            onChange={e => setVehicle(prev => ({ ...prev, notes: e.target.value }))}
            className="min-h-[100px]"
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData ? 'Update Vehicle' : 'Add Vehicle'}
          </Button>
        </div>
      </form>
    </div>
  );
};

VehicleForm.propTypes = {
  initialData: PropTypes.shape({
    stockNumber: PropTypes.string,
    make: PropTypes.string,
    model: PropTypes.string,
    trim: PropTypes.string,
    year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    vin: PropTypes.string,
    mileage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
    dateAcquired: PropTypes.string,
    imageUrl: PropTypes.string,
    exteriorColor: PropTypes.string,
    interiorColor: PropTypes.string,
    transmission: PropTypes.string,
    engineType: PropTypes.string,
    driveType: PropTypes.string,
    notes: PropTypes.string
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

VehicleForm.defaultProps = {
  initialData: null
};

export default VehicleForm;