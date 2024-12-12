// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import DismantledVehiclesPage from './components/DismantledVehiclesPage';
import RetailVehiclesPage from './components/RetailVehiclesPage';
import PartsRequest from './components/PartsRequest';
import NotFound from './components/NotFound';
import Navbar from './components/Navbar';
import AdminPage from './components/admin/AdminPage';
import VehicleDetails from './components/VehicleDetails';


function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/parts" element={<DismantledVehiclesPage />} />
            <Route path="/inventory" element={<RetailVehiclesPage />} />
            <Route path="/inventory/:id" element={<VehicleDetails />} />
            <Route path="/partsrequest" element={<PartsRequest />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;