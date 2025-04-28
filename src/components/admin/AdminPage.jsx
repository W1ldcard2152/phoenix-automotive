// src/components/admin/AdminPage.jsx
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, RefreshCw, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import DismantledVehicleManager from './DismantledVehicleManager';
import RetailVehicleManager from './RetailVehicleManager';
import PartsRequestManager from './PartsRequestManager';
import RepairRequestManager from './RepairRequestManager';

const SessionTimer = ({ onRefresh }) => {
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [isWarning, setIsWarning] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prevTime => {
        // When less than 5 minutes remain, show warning
        if (prevTime <= 300 && !isWarning) {
          setIsWarning(true);
        }
        return prevTime > 0 ? prevTime - 1 : 0;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isWarning]);
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className={`flex items-center gap-2 ${isWarning ? 'text-amber-500' : 'text-gray-500'}`}>
      <Clock className="h-4 w-4" />
      <span className="text-sm font-medium">Session: {formatTime(timeLeft)}</span>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-7 w-7 p-0" 
        onClick={() => {
          onRefresh();
          setTimeLeft(30 * 60);
          setIsWarning(false);
        }}
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
};

const AdminPage = () => {
  const navigate = useNavigate();
  const { logout, refreshToken } = useAuth();
  
  const handleRefreshSession = async () => {
    try {
      await refreshToken();
    } catch (error) {
      console.error('Failed to refresh session:', error);
      // If refresh fails, log the user out
      handleLogout();
    }
  };

  const handleLogout = () => {
    // Use the logout function from AuthContext
    logout();
    
    // Redirect to login page
    navigate('/login');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          {/* Session Timer */}
          <SessionTimer onRefresh={handleRefreshSession} />
          
          <Button 
            variant="outline" 
            onClick={handleLogout} 
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
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