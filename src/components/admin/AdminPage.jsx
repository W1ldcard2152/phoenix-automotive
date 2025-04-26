import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DismantledVehicleManager from './DismantledVehicleManager';
import RetailVehicleManager from './RetailVehicleManager';
import PartsRequestManager from './PartsRequestManager';
import RepairRequestManager from './RepairRequestManager';

const AdminPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
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