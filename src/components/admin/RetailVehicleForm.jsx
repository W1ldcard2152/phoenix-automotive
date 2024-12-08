// src/components/admin/RetailVehicleForm.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import { Image, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from '../shared/ImageUpload';

const RetailVehicleForm = ({ onSubmit, onCancel, initialData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialData || {
    stockNumber: '',
    year: '',
    make: '',
    model: '',
    trim: '',
    vin: '',
    mileage: '',
    price: '',
    exteriorColor: '',
    interiorColor: '',
    transmission: '',
    engineType: '',
    driveType: '',
    fuelType: '',
    condition: '',
    status: 'available',
    features: '',
    description: '',
    imageUrl: ''
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
        condition: formData.condition,
        status: formData.status || 'available',
        imageUrl: formData.imageUrl,
        
        // Optional fields
        trim: formData.trim?.trim() || undefined,
        exteriorColor: formData.exteriorColor?.trim() || undefined,
        interiorColor: formData.interiorColor?.trim() || undefined,
        transmission: formData.transmission || undefined,
        engineType: formData.engineType?.trim() || undefined,
        driveType: formData.driveType || undefined,
        fuelType: formData.fuelType?.trim() || undefined,
        features: formData.features?.trim() || undefined,
        description: formData.description?.trim() || undefined
      };
  
      console.log('Submitting cleaned data:', cleanedData);
      
      const success = await onSubmit(cleanedData);
      if (success !== false) {
        setFormData({
          stockNumber: '',
          year: '',
          make: '',
          model: '',
          trim: '',
          vin: '',
          mileage: '',
          price: '',
          exteriorColor: '',
          interiorColor: '',
          transmission: '',
          engineType: '',
          driveType: '',
          fuelType: '',
          condition: '',
          status: 'available',
          features: '',
          description: '',
          imageUrl: ''
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert(`Failed to save vehicle: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Basic Info Section */}
        <div className="space-y-2">
          <Label htmlFor="stockNumber">Stock Number</Label>
          <Input
            id="stockNumber"
            name="stockNumber"
            value={formData.stockNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vin">VIN</Label>
          <Input
            id="vin"
            name="vin"
            value={formData.vin}
            onChange={handleChange}
            required
            maxLength={17}
          />
        </div>

        {/* Previous input fields remain the same until the image section */}
        {/* ... other fields ... */}

      </div>

      {/* Image Upload Section */}
      <div className="space-y-2">
        <Label>Vehicle Image</Label>
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

      {/* The rest of the form fields */}
      <div className="space-y-2">
        <Label htmlFor="features">Features</Label>
        <Textarea
          id="features"
          name="features"
          value={formData.features}
          onChange={handleChange}
          placeholder="List major features and options"
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

      {/* Select inputs with white backgrounds */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Transmission</Label>
          <Select
            value={formData.transmission}
            onValueChange={(value) => handleSelectChange('transmission', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select transmission" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="automatic">Automatic</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="cvt">CVT</SelectItem>
              <SelectItem value="automated-manual">Automated Manual</SelectItem>
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
            <SelectContent className="bg-white">
              <SelectItem value="gasoline">Gasoline</SelectItem>
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="plugin-hybrid">Plug-in Hybrid</SelectItem>
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
            <SelectContent className="bg-white">
              <SelectItem value="fwd">Front Wheel Drive</SelectItem>
              <SelectItem value="rwd">Rear Wheel Drive</SelectItem>
              <SelectItem value="awd">All Wheel Drive</SelectItem>
              <SelectItem value="4wd">4 Wheel Drive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Condition</Label>
          <Select
            value={formData.condition}
            onValueChange={(value) => handleSelectChange('condition', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="very-good">Very Good</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="pending">Sale Pending</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
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
    exteriorColor: PropTypes.string,
    interiorColor: PropTypes.string,
    transmission: PropTypes.string,
    engineType: PropTypes.string,
    driveType: PropTypes.string,
    fuelType: PropTypes.string,
    condition: PropTypes.string,
    status: PropTypes.string,
    imageUrl: PropTypes.string,
    features: PropTypes.string,
    description: PropTypes.string
  })
};

export default RetailVehicleForm;