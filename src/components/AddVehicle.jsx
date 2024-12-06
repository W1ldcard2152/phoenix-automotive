// src/components/AddVehicle.jsx
import { useNavigate } from 'react-router-dom';
import VehicleForm from './VehicleForm';

const AddVehicle = () => {
  const navigate = useNavigate();

  const handleSubmit = async (formData, imageFile) => {
    try {
      // Here you would typically:
      // 1. Upload the image to your server
      // 2. Save the vehicle data to your database
      // 3. Update your local data
      
      console.log('Form submitted:', formData);
      console.log('Image file:', imageFile);
      
      // For now, just log the data and go back
      navigate('/parts');
    } catch (error) {
      console.error('Error adding vehicle:', error);
      // Handle error (show error message to user)
    }
  };

  const handleCancel = () => {
    navigate('/parts');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <VehicleForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
};

export default AddVehicle;