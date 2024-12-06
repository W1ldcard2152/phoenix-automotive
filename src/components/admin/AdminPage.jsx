// src/components/admin/AdminPage.jsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DismantledVehicleManager from './DismantledVehicleManager';
import RetailVehicleManager from './RetailVehicleManager';

const AdminPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs defaultValue="vehicles" className="w-full">
        <TabsList>
          <TabsTrigger value="vehicles">Manage Dismantled Vehicles</TabsTrigger>
          <TabsTrigger value="parts">Manage Retail Vehicles</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vehicles">
          <DismantledVehicleManager />
        </TabsContent>
        
        <TabsContent value="parts">
          <RetailVehicleManager/>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;