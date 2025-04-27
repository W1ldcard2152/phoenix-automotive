// src/components/admin/AdminPage.jsx
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';
import DismantledVehicleManager from './DismantledVehicleManager';
import RetailVehicleManager from './RetailVehicleManager';
import PartsRequestManager from './PartsRequestManager';
import RepairRequestManager from './RepairRequestManager';

const AdminPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Redirect to login page
    navigate('/login');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button 
          variant="outline" 
          onClick={handleLogout} 
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
      
      <Tabs defaultValue="dismantled" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dismantled">Dismantled Vehicles</TabsTrigger>
          <TabsTrigger value="retail">Retail Vehicles</TabsTrigger>
          <TabsTrigger value="parts">Parts Requests</TabsTrigger>
          <TabsTrigger value="repairs">Repair Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dismantled">
          <DismantledVehicleManager />
        </TabsContent>
        
        <TabsContent value="retail">
          <RetailVehicleManager />
        </TabsContent>

        <TabsContent value="parts">
          <PartsRequestManager />
        </TabsContent>

        <TabsContent value="repairs">
          <RepairRequestManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;