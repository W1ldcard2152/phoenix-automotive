import { ArrowRight, Phone, MapPin, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-[#1a1f2e]">
        <div className="absolute inset-0">
          <img
            src="/images/landing-banner.jpg"
            alt="Phoenix Automotive Warehouse"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-3xl pl-8 md:pl-12">
            <div className="space-y-6">
              <h1 className="space-y-2">
                <span className="block text-6xl font-bold text-white/90 leading-tight">
                  Newark&apos;s Premier
                </span>
                <span className="block text-5xl font-bold text-white/90 leading-tight">
                  Auto Parts Solution
                </span>
              </h1>
              
              <p className="text-xl text-white/90 max-w-2xl leading-relaxed">
                Where quality meets reliability. Every part in our 10,000+ part inventory is 
                professionally removed, photographed, and stored in our climate-controlled facility. Browse our inventory at eBay.com or request a part quote today!
              </p>
              
              <div className="flex flex-wrap gap-4 mt-8">
              <Button
  size="lg"
  className="bg-red-700 hover:bg-red-800 text-lg px-8"
  asChild
>
  <Link 
    to="/parts"
    className="inline-flex items-center gap-2"
  >
    Browse Parts
    <ArrowRight className="h-5 w-5" />
  </Link>
</Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/5 hover:bg-white/10 border-white text-white text-lg px-8"
                  asChild
                >
                  <a href="/partsrequest">Request Part</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-8">Visit Our Location</h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-4">
                  <MapPin className="text-red-700" />
                  <span>201 Ford St, Newark, NY 14513</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Phone className="text-red-700" />
                  <span>(315) 830-0008</span>
                </div>
                <div className="flex items-center space-x-4">
                  <MessageSquare className="text-red-700" />
                  <span>(315) 404-0570</span>
                </div>
                <div className="text-gray-600 mt-4">
                  <p className="font-semibold mb-2">Hours of Operation:</p>
                  <p>Monday-Friday: 8am-5pm</p>
                  <p>Saturday-Sunday: Text Only</p>
                </div>
              </div>
            </div>
            <div className="h-64 md:h-auto">
              <iframe 
                className="w-full h-full min-h-[400px] rounded-lg shadow-md"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2917.308520062282!2d-77.09340548451435!3d43.04735997914689!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d14c8c8c8c8c8d%3A0x8c8c8c8c8c8c8c8c!2sPhoenix%20Automotive!5e0!3m2!1sen!2sus!4v1621436426788!5m2!1sen!2sus"
                allowFullScreen=""
                loading="lazy"
                title="Phoenix Automotive Location"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;