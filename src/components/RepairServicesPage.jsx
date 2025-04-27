import { useState } from 'react';
import { ResponsiveContainer } from '@/components/layout';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Card } from "@/components/ui/card";
import { Shield, Wrench, Clock, ArrowRight, Check } from 'lucide-react';
import { Wrench as ToolIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import RepairRequestForm from './repair/index';

const RepairServicesPage = () => {
  const { isMobile } = useBreakpoint();
  
  // State to control whether to show form or services info
  const [showForm, setShowForm] = useState(false);

  const InfoCard = ({ title, description, icon: Icon }) => (
    <Card className="p-6 bg-white">
      <div className="flex flex-col items-center text-center">
        <Icon className="h-8 w-8 text-red-700 mb-4" />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">
          {description}
        </p>
      </div>
    </Card>
  );

  const ServiceCard = ({ title, description, price }) => (
    <Card className="p-6 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col h-full">
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-muted-foreground flex-grow mb-4">{description}</p>
        {price && <p className="text-lg font-semibold text-red-700">{price}</p>}
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
                  Auto Repair Services
                </h1>
                <p className="text-sm md:text-xl text-white max-w-2xl mx-auto leading-relaxed">
                  Licensed professionals providing quality repairs and maintenance for all makes and models at competitive prices.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
                  <Button 
                    className="bg-red-700 hover:bg-red-800 text-white"
                    size={isMobile ? "default" : "lg"}
                    onClick={toggleForm}
                  >
                    {showForm ? "View Our Services" : "Schedule Service"}
                    <ArrowRight className="ml-2 h-4 w-4" />
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
          <div className="space-y-12">
            {/* Service Highlights */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-center">Our Repair Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoCard
                  title="Quality Repairs"
                  description="Factory-trained technicians using OEM and high-quality aftermarket parts for all makes and models."
                  icon={Shield}
                />
                <InfoCard
                  title="Experienced Technicians"
                  description="Our experienced technicians have years of practical knowledge in automotive diagnosis and repair."
                  icon={ToolIcon}
                />
                <InfoCard
                  title="Fast Turnaround"
                  description="Most repairs completed same-day or next-day with our efficient service process."
                  icon={Clock}
                />
              </div>
            </section>

            {/* Services List */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Services We Offer</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ServiceCard
                  title="Diagnostic Service"
                  description="Complete computer diagnostic with detailed report of findings and recommended repairs."
                  price="From $89.99"
                />
                <ServiceCard
                  title="Oil Change Service"
                  description="Full-service oil change with filter replacement, fluid check, and multi-point inspection."
                  price="From $49.99"
                />
                <ServiceCard
                  title="Brake Service"
                  description="Comprehensive brake service including pad/shoe replacement, rotor/drum machining, and system inspection."
                  price="From $129.99"
                />
                <ServiceCard
                  title="Engine Repair"
                  description="From minor tune-ups to major engine repairs and replacements by experienced technicians."
                  price="Custom Quote"
                />
                <ServiceCard
                  title="Transmission Service"
                  description="Transmission fluid flush, filter replacement, and complete transmission repairs and rebuilds."
                  price="From $149.99"
                />
                <ServiceCard
                  title="Suspension & Steering"
                  description="Complete suspension system maintenance including alignments, shock/strut replacement, and steering repairs."
                  price="From $99.99"
                />
              </div>
              <div className="mt-8 text-center">
                <Button
                  onClick={toggleForm}
                  className="bg-red-700 hover:bg-red-800"
                  size="lg"
                >
                  Schedule Your Service
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </section>
            
            {/* Why Choose Us */}
            <section className="bg-slate-50 p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-6">Why Choose Phoenix Automotive</h2>
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="flex items-start gap-3">
                  <Check className="text-red-700 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Licensed Professionals</h3>
                    <p className="text-muted-foreground">All work performed by licensed, ASE-certified technicians</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="text-red-700 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Quality Parts</h3>
                    <p className="text-muted-foreground">OEM and top-quality aftermarket parts for lasting repairs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="text-red-700 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Transparent Pricing</h3>
                    <p className="text-muted-foreground">No hidden fees with up-front cost estimates before work begins</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="text-red-700 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Warranty Protection</h3>
                    <p className="text-muted-foreground">12-month/12,000 mile warranty on parts and labor</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="text-red-700 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Comprehensive Services</h3>
                    <p className="text-muted-foreground">One-stop shop for all your automotive service needs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="text-red-700 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Customer Satisfaction</h3>
                    <p className="text-muted-foreground">Dedicated to exceeding your expectations with every service</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default RepairServicesPage;