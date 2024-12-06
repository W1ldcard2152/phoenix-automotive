import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        {initialData ? 'Edit Vehicle' : 'Add New Vehicle'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="grid md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="year">Year *</Label>
            <Input
              id="year"
              type="number"
              value={vehicle.year}
              onChange={e => setVehicle(prev => ({ ...prev, year: e.target.value }))}
              required
              min="1900"
              max={new Date().getFullYear() + 1}
              placeholder="YYYY"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="make">Make *</Label>
            <Input
              id="make"
              value={vehicle.make}
              onChange={e => setVehicle(prev => ({ ...prev, make: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model *</Label>
            <Input
              id="model"
              value={vehicle.model}
              onChange={e => setVehicle(prev => ({ ...prev, model: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trim">Trim</Label>
            <Input
              id="trim"
              value={vehicle.trim}
              onChange={e => setVehicle(prev => ({ ...prev, trim: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="exteriorColor">Exterior Color</Label>
            <Input
              id="exteriorColor"
              value={vehicle.exteriorColor}
              onChange={e => setVehicle(prev => ({ ...prev, exteriorColor: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interiorColor">Interior Color</Label>
            <Input
              id="interiorColor"
              value={vehicle.interiorColor}
              onChange={e => setVehicle(prev => ({ ...prev, interiorColor: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="mileage">Mileage *</Label>
            <Input
              id="mileage"
              type="number"
              value={vehicle.mileage}
              onChange={e => setVehicle(prev => ({ ...prev, mileage: e.target.value }))}
              required
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateAcquired">Date Acquired *</Label>
            <Input
              id="dateAcquired"
              type="date"
              value={vehicle.dateAcquired}
              onChange={e => setVehicle(prev => ({ ...prev, dateAcquired: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={vehicle.status}
            onValueChange={value => setVehicle(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Awaiting Dismantle">Awaiting Dismantle</SelectItem>
              <SelectItem value="Parts Available">Parts Available</SelectItem>
              <SelectItem value="Scrapped">Scrapped</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="engineType">Engine Type</Label>
            <Input
              id="engineType"
              value={vehicle.engineType}
              onChange={e => setVehicle(prev => ({ ...prev, engineType: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transmission">Transmission</Label>
            <Input
              id="transmission"
              value={vehicle.transmission}
              onChange={e => setVehicle(prev => ({ ...prev, transmission: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="driveType">Drive Type</Label>
            <Input
              id="driveType"
              value={vehicle.driveType}
              onChange={e => setVehicle(prev => ({ ...prev, driveType: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            value={vehicle.imageUrl}
            onChange={e => setVehicle(prev => ({ ...prev, imageUrl: e.target.value }))}
          />
        </div>

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