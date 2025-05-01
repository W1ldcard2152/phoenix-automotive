import { ArrowRight, Phone, MapPin, MessageSquare, Wrench, Car, Shield } from 'lucide-react';
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
        <div className="relative h-[450px] md:h-[700px] overflow-hidden">
          <img
            src="/images/landing-banner.jpg"
            alt="Phoenix Automotive Warehouse"
            className="absolute inset-0 w-full h-full object-cover md:object-center opacity-40"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
          
          <ResponsiveContainer
            mobileClassName="absolute inset-0 flex items-start px-4 pt-12"
            desktopClassName="absolute inset-0 container mx-auto px-4 flex items-center"
          >
            <div className={`max-w-3xl ${isMobile ? 'pl-2' : 'pl-8 md:pl-12'}`}>
              <div className="space-y-4 md:space-y-6">
                <h1 className="space-y-1 md:space-y-2">
                  <span className="block text-2xl md:text-6xl font-bold text-white leading-tight tracking-tight">
                    Newark's Premier
                  </span>
                  <span className="block text-xl md:text-5xl font-bold text-white leading-tight tracking-tight">
                  Automotive Solution
                  </span>
                </h1>
                
                <p className="text-sm md:text-xl text-white max-w-2xl leading-relaxed">
                  Your one stop shop for everything automotive. Need a part? Need it installed? Tired of fixing the car and want to replace it? We can help.
                  If we can't do it, we'll recommend someone who can. Stop by and see us, you'll be glad you did.
                </p>
                
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 pt-2 md:pt-4">
                  <Button
                    size={isMobile ? "default" : "lg"}
                    className="bg-red-700 hover:bg-red-800 text-white w-full md:w-auto"
                    asChild
                  >
                    <Link to="/parts" className="inline-flex items-center justify-center gap-2">
                      Browse Parts
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    size={isMobile ? "default" : "lg"}
                    variant="outline"
                    className="border-white bg-white/5 hover:bg-white/10 text-white w-full md:w-auto"
                    asChild
                  >
                    <Link to="/repair">Repair Services</Link>
                  </Button>
                </div>
              </div>
            </div>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Repair Services Section - NEW */}
      <section className="py-8 md:py-16">
        <ResponsiveContainer>
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Professional Auto Repair Services</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Automotive repair services for all makes and models with quality parts and expert technicians.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-sm border bg-white">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <Wrench className="h-8 w-8 text-red-700" />
              </div>
              <h3 className="text-xl font-bold mb-2">Expert Technicians</h3>
              <p className="text-gray-600">Experienced mechanics with years of hands-on expertise in all types of vehicle repair.</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-sm border bg-white">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <Car className="h-8 w-8 text-red-700" />
              </div>
              <h3 className="text-xl font-bold mb-2">All Makes & Models</h3>
              <p className="text-gray-600">Comprehensive repair services for domestic and foreign vehicles of all years.</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-sm border bg-white">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <Shield className="h-8 w-8 text-red-700" />
              </div>
              <h3 className="text-xl font-bold mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600">12-month/12,000 mile warranty on all repairs with new OEM parts and 3-month/3,000 mile warranty on all used/aftermarket parts.</p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Button
              size={isMobile ? "default" : "lg"}
              className="bg-red-700 hover:bg-red-800 text-white"
              asChild
            >
              <Link to="/repair" className="inline-flex items-center justify-center gap-2">
                Schedule Service
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </ResponsiveContainer>
      </section>

      {/* Location Section */}
      <section className="bg-gray-50 py-6 md:py-16">
        <ResponsiveContainer>
          <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-12">
            <div className="order-2 md:order-1">
              <h2 className="text-xl md:text-3xl font-bold mb-4 md:mb-8">Visit Our Location</h2>
              <div className="space-y-3 md:space-y-4">
                <a 
                  href="https://maps.google.com/?q=201+Ford+St,+Newark,+NY+14513" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 hover:text-red-700 transition-colors"
                >
                  <MapPin className="text-red-700 flex-shrink-0 h-5 w-5" />
                  <span>201 Ford St, Newark, NY 14513</span>
                </a>
                <a 
                  href="tel:3158300008"
                  className="flex items-center space-x-3 hover:text-red-700 transition-colors"
                >
                  <Phone className="text-red-700 flex-shrink-0 h-5 w-5" />
                  <span>(315) 830-0008</span>
                </a>
                <a 
                  href="sms:coming-soon"
                  className="flex items-center space-x-3 hover:text-red-700 transition-colors"
                >
                  <MessageSquare className="text-red-700 flex-shrink-0 h-5 w-5" />
                  <span>Coming Soon</span>
                </a>
                <div className="text-gray-600 pt-2 mt-2 border-t border-gray-200">
                  <p className="font-semibold mb-2">Hours of Operation:</p>
                  <p>Monday-Friday: 8am-5pm</p>
                  <p>Saturday-Sunday: Text Only</p>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="relative w-full rounded-lg overflow-hidden shadow-md aspect-video md:aspect-auto md:h-full min-h-[250px] md:min-h-[400px]">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2917.308520062282!2d-77.09340548451435!3d43.04735997914689!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d14c8c8c8c8c8d%3A0x8c8c8c8c8c8c8c8c!2s201%20Ford%20St%2C%20Newark%2C%20NY%2014513!5e0!3m2!1sen!2sus!4v1621436426788!5m2!1sen!2sus"
                  allowFullScreen=""
                  loading="lazy"
                  title="Phoenix Automotive Location"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </ResponsiveContainer>
      </section>
    </div>
  );
};

export default Home;