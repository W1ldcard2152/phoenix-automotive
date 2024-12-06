import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const VehicleForm = () => {
  const [vehicle, setVehicle] = useState({
    make: '',
    model: '',
    year: '',
    vin: '',
    price: '',
    mileage: '',
    status: 'available'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting vehicle data:', vehicle);
      
      const cleanedVehicle = {
        ...vehicle,
        price: Number(vehicle.price.replace(/[^0-9]/g, '')),
        mileage: Number(vehicle.mileage.replace(/[^0-9]/g, '')),
        year: Number(vehicle.year.replace(/[^0-9]/g, ''))
      };
      
      console.log('Cleaned vehicle data:', cleanedVehicle);

      const response = await fetch('http://localhost:3000/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedVehicle),
      });
      
      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      if (response.ok) {
        alert('Vehicle added successfully!');
        setVehicle({
          make: '',
          model: '',
          year: '',
          vin: '',
          price: '',
          mileage: '',
          status: 'available'
        });
      } else {
        alert(`Error adding vehicle: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Detailed error:', error);
      alert(`Error adding vehicle: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    let value = e.target.value;
    
    if (e.target.type === 'number') {
      value = value.replace(/,/g, '');
    }

    setVehicle({
      ...vehicle,
      [e.target.name]: value
    });
    
    console.log('Updated vehicle state:', {
      ...vehicle,
      [e.target.name]: value
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Add New Vehicle</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                name="make"
                value={vehicle.make}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                name="model"
                value={vehicle.model}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                name="year"
                value={vehicle.year}
                onChange={handleChange}
                required
                placeholder="YYYY"
                maxLength="4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vin">VIN</Label>
              <Input
                id="vin"
                name="vin"
                value={vehicle.vin}
                onChange={handleChange}
                required
                maxLength="17"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                value={vehicle.price}
                onChange={handleChange}
                required
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mileage">Mileage</Label>
              <Input
                id="mileage"
                name="mileage"
                value={vehicle.mileage}
                onChange={handleChange}
                required
                placeholder="0"
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full">
            Add Vehicle
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default VehicleForm;