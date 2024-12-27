import { ArrowRight, Phone, MapPin, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ResponsiveContainer } from '@/components/layout';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const Home = () => {
  const { isMobile } = useBreakpoint();

  return (
    <div className="space-y-8 md:space-y-16">
      {/* Hero Section */}
      <section className="relative bg-[#1a1f2e]">
        <div className="absolute inset-0">
          <img
            src="/images/landing-banner.jpg"
            alt="Phoenix Automotive Warehouse"
            className="w-full h-full object-cover opacity-40"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        </div>
        <ResponsiveContainer
          mobileClassName="px-4 py-12"
          desktopClassName="container mx-auto px-4 py-24"
        >
          <div className={`max-w-3xl ${isMobile ? 'pl-2' : 'pl-8 md:pl-12'}`}>
            <div className="space-y-6">
              <h1 className="space-y-2">
                <span className="block text-4xl md:text-6xl font-bold text-white/90 leading-tight">
                  Newark&apos;s Premier
                </span>
                <span className="block text-3xl md:text-5xl font-bold text-white/90 leading-tight">
                  Auto Parts Solution
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">
                Where quality meets reliability. Every part in our 10,000+ part inventory is 
                professionally removed, photographed, and stored in our climate-controlled facility. Browse our inventory at eBay.com or request a part quote today!
              </p>
              
              <div className="flex flex-col md:flex-row gap-4 mt-8">
                <Button
                  size={isMobile ? "default" : "lg"}
                  className="bg-red-700 hover:bg-red-800 text-base md:text-lg px-6 md:px-8 w-full md:w-auto"
                  asChild
                >
                  <Link 
                    to="/parts"
                    className="inline-flex items-center justify-center gap-2"
                  >
                    Browse Parts
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size={isMobile ? "default" : "lg"}
                  variant="outline"
                  className="bg-white/5 hover:bg-white/10 border-white text-white text-base md:text-lg px-6 md:px-8 w-full md:w-auto"
                  asChild
                >
                  <Link to="/partsrequest">Request Part</Link>
                </Button>
              </div>
            </div>
          </div>
        </ResponsiveContainer>
      </section>

      {/* Location Section */}
      <section className="bg-gray-50 py-8 md:py-16">
        <ResponsiveContainer>
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Visit Our Location</h2>
              <div className="space-y-4 mb-8">
                <a 
                  href="https://maps.google.com/?q=201+Ford+St,+Newark,+NY+14513" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 hover:text-red-700 transition-colors"
                >
                  <MapPin className="text-red-700 flex-shrink-0" />
                  <span>201 Ford St, Newark, NY 14513</span>
                </a>
                <a 
                  href="tel:3158300008"
                  className="flex items-center space-x-4 hover:text-red-700 transition-colors"
                >
                  <Phone className="text-red-700 flex-shrink-0" />
                  <span>(315) 830-0008</span>
                </a>
                <a 
                  href="sms:3154040570"
                  className="flex items-center space-x-4 hover:text-red-700 transition-colors"
                >
                  <MessageSquare className="text-red-700 flex-shrink-0" />
                  <span>(315) 404-0570</span>
                </a>
                <div className="text-gray-600 mt-4">
                  <p className="font-semibold mb-2">Hours of Operation:</p>
                  <p>Monday-Friday: 8am-5pm</p>
                  <p>Saturday-Sunday: Text Only</p>
                </div>
              </div>
            </div>
            <div className="h-64 md:h-auto">
              <iframe 
                className="w-full h-full min-h-[300px] md:min-h-[400px] rounded-lg shadow-md"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2917.308520062282!2d-77.09340548451435!3d43.04735997914689!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d14c8c8c8c8c8d%3A0x8c8c8c8c8c8c8c8c!2sPhoenix%20Automotive!5e0!3m2!1sen!2sus!4v1621436426788!5m2!1sen!2sus"
                allowFullScreen=""
                loading="lazy"
                title="Phoenix Automotive Location"
              />
            </div>
          </div>
        </ResponsiveContainer>
      </section>
    </div>
  );
};

export default Home;