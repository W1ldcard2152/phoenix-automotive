import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageUpload from '../shared/ImageUpload';

const RetailVehicleForm = ({ onSubmit, onCancel, initialData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialData || {
    // Basic Information
    stockNumber: '',
    year: '',
    make: '',
    model: '',
    trim: '',
    vin: '',
    mileage: '',
    price: '',
    
    // Vehicle Details
    engine: '',
    transmission: '',
    driveType: '',
    fuelType: '',
    mpgCity: '',
    mpgHighway: '',
    exteriorColor: '',
    interiorColor: '',
    interiorMaterial: '',
    bodyStyle: '',
    numDoors: '',
    
    // Status
    status: 'available',
    
    // Additional Information
    features: '',
    description: '',
    sellerNotes: '',
    imageUrl: '',
    
    // Service History
    serviceHistory: '',
    accidentHistory: '',
    titleStatus: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUploaded = (url) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const cleanedData = {
        stockNumber: formData.stockNumber.trim(),
        year: parseInt(formData.year),
        make: formData.make.trim(),
        model: formData.model.trim(),
        vin: formData.vin.trim().toUpperCase(),
        mileage: parseInt(formData.mileage.toString().replace(/,/g, '')),
        price: parseFloat(formData.price.toString().replace(/,/g, '')),
        mpgCity: formData.mpgCity ? parseInt(formData.mpgCity) : undefined,
        mpgHighway: formData.mpgHighway ? parseInt(formData.mpgHighway) : undefined,
        numDoors: formData.numDoors ? parseInt(formData.numDoors) : undefined,
        
        // Optional fields
        trim: formData.trim?.trim() || undefined,
        engine: formData.engine?.trim() || undefined,
        transmission: formData.transmission || undefined,
        driveType: formData.driveType || undefined,
        fuelType: formData.fuelType || undefined,
        exteriorColor: formData.exteriorColor?.trim() || undefined,
        interiorColor: formData.interiorColor?.trim() || undefined,
        interiorMaterial: formData.interiorMaterial || undefined,
        bodyStyle: formData.bodyStyle || undefined,
        status: formData.status || 'available',
        features: formData.features?.trim() || undefined,
        description: formData.description?.trim() || undefined,
        sellerNotes: formData.sellerNotes?.trim() || undefined,
        serviceHistory: formData.serviceHistory?.trim() || undefined,
        accidentHistory: formData.accidentHistory?.trim() || undefined,
        titleStatus: formData.titleStatus || undefined,
        imageUrl: formData.imageUrl || undefined
      };
  
      await onSubmit(cleanedData);
    } catch (error) {
      console.error('Form submission error:', error);
      alert(`Failed to save vehicle: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stockNumber">Stock Number *</Label>
            <Input
              id="stockNumber"
              name="stockNumber"
              value={formData.stockNumber}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vin">VIN *</Label>
            <Input
              id="vin"
              name="vin"
              value={formData.vin}
              onChange={handleChange}
              required
              maxLength={17}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year *</Label>
            <Input
              id="year"
              name="year"
              type="number"
              min="1900"
              max={new Date().getFullYear() + 1}
              value={formData.year}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="make">Make *</Label>
            <Input
              id="make"
              name="make"
              value={formData.make}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model *</Label>
            <Input
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trim">Trim</Label>
            <Input
              id="trim"
              name="trim"
              value={formData.trim}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mileage">Mileage *</Label>
            <Input
              id="mileage"
              name="mileage"
              type="number"
              min="0"
              value={formData.mileage}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      {/* Vehicle Details Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Vehicle Details</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bodyStyle">Body Style</Label>
            <Select
              value={formData.bodyStyle}
              onValueChange={(value) => handleSelectChange('bodyStyle', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select body style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedan">Sedan</SelectItem>
                <SelectItem value="suv">SUV</SelectItem>
                <SelectItem value="truck">Truck</SelectItem>
                <SelectItem value="coupe">Coupe</SelectItem>
                <SelectItem value="wagon">Wagon</SelectItem>
                <SelectItem value="van">Van</SelectItem>
                <SelectItem value="convertible">Convertible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numDoors">Number of Doors</Label>
            <Input
              id="numDoors"
              name="numDoors"
              type="number"
              min="2"
              max="5"
              value={formData.numDoors}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="engine">Engine</Label>
            <Input
              id="engine"
              name="engine"
              value={formData.engine}
              onChange={handleChange}
              placeholder="e.g., 2.0L 4cyl, 3.5L V6"
            />
          </div>

          <div className="space-y-2">
            <Label>Transmission</Label>
            <Select
              value={formData.transmission}
              onValueChange={(value) => handleSelectChange('transmission', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transmission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="automatic">Automatic</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="cvt">CVT</SelectItem>
                <SelectItem value="automated-manual">Automated Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Drive Type</Label>
            <Select
              value={formData.driveType}
              onValueChange={(value) => handleSelectChange('driveType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select drive type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fwd">Front Wheel Drive</SelectItem>
                <SelectItem value="rwd">Rear Wheel Drive</SelectItem>
                <SelectItem value="awd">All Wheel Drive</SelectItem>
                <SelectItem value="4wd">4 Wheel Drive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fuel Type</Label>
            <Select
              value={formData.fuelType}
              onValueChange={(value) => handleSelectChange('fuelType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select fuel type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gasoline">Gasoline</SelectItem>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="plugin-hybrid">Plug-in Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mpgCity">City MPG</Label>
            <Input
              id="mpgCity"
              name="mpgCity"
              type="number"
              min="0"
              value={formData.mpgCity}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mpgHighway">Highway MPG</Label>
            <Input
              id="mpgHighway"
              name="mpgHighway"
              type="number"
              min="0"
              value={formData.mpgHighway}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exteriorColor">Exterior Color</Label>
            <Input
              id="exteriorColor"
              name="exteriorColor"
              value={formData.exteriorColor}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interiorColor">Interior Color</Label>
            <Input
              id="interiorColor"
              name="interiorColor"
              value={formData.interiorColor}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interiorMaterial">Interior Material</Label>
            <Select
              value={formData.interiorMaterial}
              onValueChange={(value) => handleSelectChange('interiorMaterial', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interior material" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cloth">Cloth</SelectItem>
                <SelectItem value="leather">Leather</SelectItem>
                <SelectItem value="leatherette">Leatherette</SelectItem>
                <SelectItem value="premium-leather">Premium Leather</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Vehicle Status */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Status</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="pending">Sale Pending</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Title Status</Label>
            <Select
              value={formData.titleStatus}
              onValueChange={(value) => handleSelectChange('titleStatus', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select title status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clean">Clean</SelectItem>
                <SelectItem value="rebuilt">Rebuilt</SelectItem>
                <SelectItem value="salvage">Salvage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Vehicle Image Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Vehicle Image</h3>
        <div className="space-y-2">
          <ImageUpload onImageUploaded={handleImageUploaded} />
          {formData.imageUrl && (
            <div className="mt-4">
              <img 
                src={formData.imageUrl} 
                alt="Vehicle preview" 
                className="max-w-sm rounded-lg border"
              />
            </div>
          )}
        </div>
      </div>

      {/* Features and Description Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Features and Description</h3>
        <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="features">Features</Label>
            <Textarea
              id="features"
              name="features"
              value={formData.features}
              onChange={handleChange}
              placeholder="List major features and options (e.g., Sunroof, Navigation, Leather seats)"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed vehicle description"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sellerNotes">Seller Notes</Label>
            <Textarea
              id="sellerNotes"
              name="sellerNotes"
              value={formData.sellerNotes}
              onChange={handleChange}
              placeholder="Additional notes about the vehicle's condition, history, or special features"
              className="min-h-[100px]"
            />
          </div>
        </div>
      </div>

      {/* Service History Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Service History</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serviceHistory">Service History</Label>
            <Textarea
              id="serviceHistory"
              name="serviceHistory"
              value={formData.serviceHistory}
              onChange={handleChange}
              placeholder="Summary of service history and maintenance records"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accidentHistory">Accident History</Label>
            <Textarea
              id="accidentHistory"
              name="accidentHistory"
              value={formData.accidentHistory}
              onChange={handleChange}
              placeholder="Details of any accidents or damage repairs"
              className="min-h-[100px]"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (initialData ? 'Update Vehicle' : 'Add Vehicle')}
        </Button>
      </div>
    </form>
  );
};

RetailVehicleForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    stockNumber: PropTypes.string,
    year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    make: PropTypes.string,
    model: PropTypes.string,
    trim: PropTypes.string,
    vin: PropTypes.string,
    mileage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    engine: PropTypes.string,
    transmission: PropTypes.string,
    driveType: PropTypes.string,
    fuelType: PropTypes.string,
    mpgCity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    mpgHighway: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    exteriorColor: PropTypes.string,
    interiorColor: PropTypes.string,
    interiorMaterial: PropTypes.string,
    bodyStyle: PropTypes.string,
    numDoors: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
    features: PropTypes.string,
    description: PropTypes.string,
    sellerNotes: PropTypes.string,
    imageUrl: PropTypes.string,
    serviceHistory: PropTypes.string,
    accidentHistory: PropTypes.string,
    titleStatus: PropTypes.string
  })
};

export default RetailVehicleForm;