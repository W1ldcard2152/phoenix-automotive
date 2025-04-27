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
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
          
          <ResponsiveContainer
            mobileClassName="absolute inset-0 flex items-start px-4 pt-12"
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
                    className="bg-red-700 hover:bg-red-800 text-white px-8 py-6 text-lg shadow-lg"
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
            {/* How it Works Section - NEW */}
            <section className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {/* Connecting line for desktop */}

                
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-red-700 text-white flex items-center justify-center text-xl font-bold mb-4 relative z-10">1</div>
                  <h3 className="text-lg font-semibold mb-2">Schedule Service</h3>
                  <p className="text-muted-foreground">Book your appointment online or give us a call for expert service</p>
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
                  description="Full brake service including pad/shoe replacement, rotor/drum machining, fluid flush, and ABS diagnostics."
                  icon={AlertCircle}
                />
                <ServiceCard
                  title="Transmission Service"
                  description="Expert transmission diagnosis, repair, rebuilding, and replacement for both automatic and manual transmissions."
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
              
              <div className="mt-12 p-6 bg-gradient-to-r from-[#1a1f2e] to-red-900 rounded-lg text-white text-center">
                <h3 className="text-xl font-bold mb-4">Need auto repair services?</h3>
                <p className="mb-6 max-w-2xl mx-auto">Our team specializes in all types of automotive repairs. From routine maintenance to complex diagnostics, we have the expertise to get your vehicle back on the road quickly and safely.</p>
                <Button
                  onClick={toggleForm}
                  className="bg-white hover:bg-gray-100 text-red-900 font-bold px-8 py-3 text-lg shadow-lg"
                >
                  Schedule Your Service Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </section>
            
            {/* Why Choose Us */}
            <section className="bg-slate-50 p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-8 text-center">Why Choose Phoenix Automotive</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <FeatureCard
                  title="Experienced Technicians"
                  description="Expert technicians with years of experience diagnosing and repairing all makes and models."
                  icon={Shield}
                />
                <FeatureCard
                  title="Quality Parts"
                  description="We use only OEM and premium aftermarket parts to ensure lasting performance and reliability."
                  icon={Wrench}
                />
                <FeatureCard
                  title="Quick Turnaround"
                  description="Most repairs are completed the same day to get you back on the road faster."
                  icon={Clock}
                />
              </div>
              
              {/* Testimonial - NEW */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-10 max-w-3xl mx-auto">
                <div className="flex items-start gap-4">
                  <div className="text-yellow-500 flex-shrink-0 mt-1">
                    <div className="flex">
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                    </div>
                  </div>
                  <div>
                    <p className="italic text-gray-700 mb-2">"Phoenix Automotive is by far the best auto repair shop I've ever used. They diagnosed and fixed an issue that two other shops couldn't figure out. Fair pricing, quick service, and they took the time to explain everything."</p>
                    <p className="text-sm font-semibold">— Robert M., Newark</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Button
                  onClick={toggleForm}
                  className="bg-red-700 hover:bg-red-800 text-white px-10 py-6 text-xl shadow-xl"
                >
                  Book Your Service Appointment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="mt-4 text-muted-foreground">No waiting - schedule online and get priority service</p>
              </div>
            </section>
            
            {/* FAQ Section - NEW */}
            <section className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">How long does a typical repair take?</h3>
                  <p className="text-muted-foreground">Most routine repairs and maintenance services are completed the same day. For more complex issues, we'll provide an estimated completion time during the initial diagnosis.</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Do you provide a warranty on repairs?</h3>
                  <p className="text-muted-foreground">Yes, we offer a 12-month/12,000 mile warranty on parts and labor for most repairs. This gives you peace of mind knowing your vehicle is covered long after you leave our shop.</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">What brands and models do you service?</h3>
                  <p className="text-muted-foreground">We work on all makes and models, including domestic, Asian, and European vehicles. From Fords and Chevys to Toyotas, Hondas, BMWs, and Mercedes - we service them all.</p>
                </div>
              </div>
              
              <div className="mt-10 text-center">
                <p className="mb-4 text-lg">Ready to get your vehicle serviced by professionals you can trust?</p>
                <Button
                  onClick={toggleForm}
                  className="bg-red-700 hover:bg-red-800 text-white px-8 py-3 text-lg"
                >
                  Schedule Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </section>
          </div>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default RepairServicesPage;