import PartsRequestForm from './partRequest/index';
import { ResponsiveContainer } from '@/components/layout';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Card } from "@/components/ui/card";
import { Shield, Users2, Clock, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const PartsRequestPage = () => {
  const { isMobile } = useBreakpoint();

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

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Hero Banner */}
      <section className="relative bg-[#1a1f2e]">
        <div className="relative h-[400px] md:h-[400px] overflow-hidden">
          <img
            src="/images/parts-request-bg.jpg"
            alt="Parts Request Background"
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
                  Request Parts
                </h1>
                <p className="text-sm md:text-xl text-white max-w-2xl mx-auto leading-relaxed">
                  Looking for a specific part? Fill out our request form below and our team will check availability and contact you with pricing.
                </p>
                
                {isMobile && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button 
                      className="w-full bg-red-700 hover:bg-red-800 text-white"
                      asChild
                    >
                      <Link to="/parts" className="inline-flex items-center justify-center gap-2">
                        Browse Available Parts
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full border-white bg-white/5 hover:bg-white/10 text-white"
                      asChild
                    >
                      <a 
                        href="https://www.ebay.com/str/Phoenix-Automotive"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2"
                      >
                        Shop eBay Store
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Form Section */}
      <ResponsiveContainer
        mobileClassName="px-4 py-6"
        desktopClassName="container mx-auto px-4 py-12"
      >
        <PartsRequestForm />
      </ResponsiveContainer>

      {/* Additional Information Section */}
      <section className="bg-muted py-8 md:py-12">
        <ResponsiveContainer>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <InfoCard
              title="Quality Guaranteed"
              description="All parts are thoroughly inspected and tested before shipping."
              icon={Shield}
            />
            <InfoCard
              title="Expert Support"
              description="Our team will help you find the exact part you need."
              icon={Users2}
            />
            <InfoCard
              title="Fast Response"
              description="We typically respond to part requests within 24 business hours."
              icon={Clock}
            />
          </div>
        </ResponsiveContainer>
      </section>

      {/* Call to Action */}
      {!isMobile && (
        <section className="py-8 md:py-12">
          <ResponsiveContainer>
            <Card className="bg-[#1a1f2e] text-white p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">
                Need Parts Right Away?
              </h2>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                Check our current inventory or visit our eBay store for immediate purchase options.
              </p>
              <div className="flex justify-center gap-4">
                <Button 
                  className="bg-red-700 hover:bg-red-800 text-white"
                  size="lg"
                  asChild
                >
                  <Link to="/parts">Browse Inventory</Link>
                </Button>
                <Button
                  variant="outline"
                  className="border-white bg-white/5 hover:bg-white/10 text-white"
                  size="lg"
                  asChild
                >
                  <a 
                    href="https://www.ebay.com/str/Phoenix-Automotive"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit eBay Store
                  </a>
                </Button>
              </div>
            </Card>
          </ResponsiveContainer>
        </section>
      )}
    </div>
  );
};

export default PartsRequestPage;