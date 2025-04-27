import { useState } from 'react';
import { ResponsiveContainer } from '@/components/layout';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Card } from "@/components/ui/card";
import { 
  Shield, 
  Wrench, 
  Clock, 
  ArrowRight, 
  Check, 
  ArrowDown, 
  Car, 
  Activity,
  Gauge,
  Settings,
  AlertCircle,
  Star
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import RepairRequestForm from './repair/index';

const RepairServicesPage = () => {
  const { isMobile } = useBreakpoint();
  
  // State to control whether to show form or services info
  const [showForm, setShowForm] = useState(false);

  const FeatureCard = ({ title, description, icon: Icon }) => (
    <Card className="p-6 bg-white hover:shadow-lg transition-all">
      <div className="flex flex-col items-center text-center">
        <div className="bg-red-100 p-3 rounded-full mb-4">
          <Icon className="h-8 w-8 text-red-700" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">
          {description}
        </p>
      </div>
    </Card>
  );

  const ServiceCard = ({ title, description, icon: Icon }) => (
    <Card className="p-6 overflow-hidden hover:shadow-lg transition-all border-l-4 border-l-red-700">
      <div className="flex flex-col h-full">
        <div className="flex items-center mb-3">
          <Icon className="h-6 w-6 text-red-700 mr-3" />
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <p className="text-muted-foreground flex-grow">{description}</p>
      </div>
    </Card>
  );

  const toggleForm = () => {
    setShowForm(!showForm);
    // Scroll to top when showing form
    if (!showForm) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Hero Banner */}
      <section className="relative bg-[#1a1f2e]">
        <div className="relative h-[400px] md:h-[400px] overflow-hidden">
          <img
            src="/images/service-page-bg.jpg"
            alt="Auto Repair Services"
            className="absolute inset-0 w-full h-full object-cover md:object-center opacity-40"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/60" />
          
          <ResponsiveContainer
            mobileClassName="absolute inset-0 flex items-center justify-center px-4"
            desktopClassName="absolute inset-0 container mx-auto px-4 flex items-center"
          >
            <div className="w-full max-w-3xl mx-auto text-center">
              <div className="space-y-4 md:space-y-6">
                <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight">
                  Expert Auto Repair Services
                </h1>
                <p className="text-sm md:text-xl text-white max-w-2xl mx-auto leading-relaxed">
                Our experienced technicians provide comprehensive repair and maintenance services for all makes and models.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
                  <Button 
                    className="bg-red-700 hover:bg-red-800 text-white px-8 py-6 text-lg shadow-lg mx-auto sm:mx-0"
                    onClick={toggleForm}
                  >
                    {showForm ? "View Our Services" : "Schedule Your Repair Now"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Main Content */}
      <ResponsiveContainer>
        {showForm ? (
          <RepairRequestForm onCancel={toggleForm} />
        ) : (
          <div className="space-y-16">
            {/* How it Works Section - NEW - Desktop Only */}
            <section className="max-w-4xl mx-auto hidden md:block">
              <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {/* Connecting line for desktop */}

                
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-red-700 text-white flex items-center justify-center text-xl font-bold mb-4 relative z-10">1</div>
                  <h3 className="text-lg font-semibold mb-2">Schedule Service</h3>
                  <p className="text-muted-foreground">Request a service appointment online</p>
                  <ArrowDown className="h-8 w-8 text-red-300 my-4 md:hidden" />
                </div>
                
                {/* Step 2 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-red-700 text-white flex items-center justify-center text-xl font-bold mb-4 relative z-10">2</div>
                  <h3 className="text-lg font-semibold mb-2">Expert Diagnosis</h3>
                  <p className="text-muted-foreground">Our experienced technicians diagnose your vehicle's issues</p>
                  <ArrowDown className="h-8 w-8 text-red-300 my-4 md:hidden" />
                </div>
                
                {/* Step 3 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-red-700 text-white flex items-center justify-center text-xl font-bold mb-4 relative z-10">3</div>
                  <h3 className="text-lg font-semibold mb-2">Quality Repairs</h3>
                  <p className="text-muted-foreground">Get back on the road with confidence thanks to our guaranteed work</p>
                </div>
              </div>
              
              <div className="mt-12 text-center">
                <Button
                  onClick={toggleForm}
                  className="bg-red-700 hover:bg-red-800 text-white px-8 py-3 text-lg shadow-md"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </section>
            
            {/* Our Services Section */}
            <section>
              <h2 className="text-2xl font-bold mb-2 text-center">Comprehensive Auto Repair Services</h2>
              <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">From routine maintenance to complex repairs, our team has the expertise and equipment to keep your vehicle in optimal condition</p>
              
              {/* CTA Button - Mobile Only */}
              <div className="md:hidden text-center mb-8">
                <Button
                  onClick={toggleForm}
                  className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 shadow-md mx-auto"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ServiceCard
                  title="Diagnostic Services"
                  description="Advanced computer diagnostics to accurately identify issues with your vehicle's engine, transmission, electrical systems, and more."
                  icon={Activity}
                />
                <ServiceCard
                  title="Engine Repair & Maintenance"
                  description="Complete engine services including tune-ups, replacements, timing belts, water pumps, and fuel system repairs."
                  icon={Settings}
                />
                <ServiceCard
                  title="Brake System Service"
                  description="Full brake service including pad/shoe replacement, fluid flush, and ABS, traction control, and stability system diagnostics."
                  icon={AlertCircle}
                />
                <ServiceCard
                  title="Transmission Service"
                  description="Expert transmission diagnosis, repair, and replacement for both automatic and manual transmissions."
                  icon={Gauge}
                />
                <ServiceCard
                  title="Suspension & Steering"
                  description="Comprehensive suspension and steering services including alignments, shock/strut replacement, and power steering repairs."
                  icon={Car}
                />
                <ServiceCard
                  title="Electrical System Repair"
                  description="Troubleshooting and repair of electrical issues, battery service, alternator replacement, and computer system diagnosis."
                  icon={Wrench}
                />
              </div>
            </section>
            
            {/* Why Choose Us - Desktop Only */}
            <section className="bg-slate-50 p-8 rounded-lg hidden md:block">
              <h2 className="text-2xl font-bold mb-8 text-center">Why Choose Phoenix Automotive</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <FeatureCard
                  title="Experienced Technicians"
                  description="Expert technicians with years of experience diagnosing and repairing all makes and models."
                  icon={Shield}
                />
                <FeatureCard
                  title="Quality Parts"
                  description="We use both OEM and premium aftermarket parts to ensure lasting performance and reliability."
                  icon={Wrench}
                />
                <FeatureCard
                  title="Quick Turnaround"
                  description="Most repairs are completed the same day to get you back on the road faster."
                  icon={Clock}
                />
              </div>
              
              <div className="text-center">
                <Button
                  onClick={toggleForm}
                  className="bg-red-700 hover:bg-red-800 text-white px-10 py-6 text-xl shadow-xl"
                >
                  Book Your Service Appointment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </section>
            
            {/* Final CTA - Mobile Only */}
            <div className="md:hidden text-center mt-10 mb-6">
              <Button
                onClick={toggleForm}
                className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 shadow-md mx-auto"
              >
                Book Service Appointment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            

          </div>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default RepairServicesPage;