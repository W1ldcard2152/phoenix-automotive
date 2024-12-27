import PartsRequestForm from './partRequest/index';
import { ResponsiveContainer, ResponsiveGrid } from '@/components/layout';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Card } from "@/components/ui/card";
import { Shield, Users2, Clock } from 'lucide-react';

const PartsRequestPage = () => {
  const { isMobile } = useBreakpoint();

  const InfoCard = ({ title, description, icon: Icon }) => (
    <Card className="p-6">
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
    <div className="min-h-screen space-y-8 md:space-y-12">
      {/* Hero Banner */}
      <div className="relative bg-[#1a1f2e] py-8 md:py-16">
        <div className="absolute inset-0">
          <img
            src="/images/parts-request-bg.jpg"
            alt="Parts Request Background"
            className="w-full h-full object-cover opacity-40"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        </div>
        <ResponsiveContainer>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Request Parts
            </h1>
            <p className="text-base md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Looking for a specific part? Fill out our request form below and our team will check availability and contact you with pricing.
            </p>
          </div>
        </ResponsiveContainer>
      </div>

      {/* Form Section */}
      <ResponsiveContainer
        mobileClassName="px-4 py-6"
        desktopClassName="container mx-auto px-4 py-12"
      >
        <PartsRequestForm />
      </ResponsiveContainer>

      {/* Additional Information Section */}
      <div className="bg-muted py-8 md:py-12">
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
      </div>
    </div>
  );
};

export default PartsRequestPage;