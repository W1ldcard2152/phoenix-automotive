// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import DismantledVehiclesPage from './components/DismantledVehiclesPage';
import RetailVehiclesPage from './components/RetailVehiclesPage';
import NotFound from './components/NotFound';
import Navbar from './components/Navbar';
import LoginPage from './components/admin/LoginPage';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminPage from './components/admin/AdminPage';
import VehicleDetails from './components/VehicleDetails';
import PartsRequestPage from './components/PartsRequestPage';
import RepairServicesPage from './components/RepairServicesPage';
import Footer from './components/Footer';
import { Toaster } from "@/components/ui/toaster"
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen bg-background flex flex-col">
          <Routes>
            {/* Public routes with navbar */}
            <Route path="/" element={<><Navbar /><Home /></>} />
            <Route path="/about" element={<><Navbar /><About /></>} />
            <Route path="/contact" element={<><Navbar /><Contact /></>} />
            <Route path="/parts" element={<><Navbar /><DismantledVehiclesPage /></>} />
            <Route path="/inventory" element={<><Navbar /><RetailVehiclesPage /></>} />
            <Route path="/inventory/:id" element={<><Navbar /><VehicleDetails /></>} />
            <Route path="/partsrequest" element={<><Navbar /><PartsRequestPage /></>} />
            <Route path="/repair" element={<><Navbar /><RepairServicesPage /></>} />
            <Route path="/privacy-policy" element={<><Navbar /><PrivacyPolicyPage /></>} />
            
            {/* Login route (no navbar) */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected admin route (no navbar) */}
            <Route path="/admin/*" element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            } />
            
            {/* 404 route with navbar */}
            <Route path="*" element={<><Navbar /><NotFound /></>} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
