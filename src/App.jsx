// App.jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Toaster } from "@/components/ui/toaster"
import ScrollToTop from './components/ScrollToTop';
import { Loader2 } from 'lucide-react';

// Lazy load components for better bundle splitting
const Home = lazy(() => import('./components/Home'));
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));
const DismantledVehiclesPage = lazy(() => import('./components/DismantledVehiclesPage'));
const RetailVehiclesPage = lazy(() => import('./components/RetailVehiclesPage'));
const VehicleDetails = lazy(() => import('./components/VehicleDetails'));
const PartsRequestPage = lazy(() => import('./components/PartsRequestPage'));
const RepairServicesPage = lazy(() => import('./components/RepairServicesPage'));
const PrivacyPolicyPage = lazy(() => import('./components/PrivacyPolicyPage'));
const PartsMatrix = lazy(() => import('./components/PartsMatrix'));
const NotFound = lazy(() => import('./components/NotFound'));

// Admin components (separate chunk)
const LoginPage = lazy(() => import('./components/admin/LoginPage'));
const ProtectedRoute = lazy(() => import('./components/admin/ProtectedRoute'));
const AdminPage = lazy(() => import('./components/admin/AdminPage'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <Loader2 className="h-12 w-12 animate-spin mx-auto text-gray-500" />
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen bg-background flex flex-col">
          <Suspense fallback={<LoadingSpinner />}>
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
              
              {/* Hidden compliance page - no navbar */}
              <Route path="/partsmatrix" element={<PartsMatrix />} />
              
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
          </Suspense>
          <Footer />
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
