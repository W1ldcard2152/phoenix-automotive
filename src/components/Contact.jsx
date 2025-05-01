import React from 'react';
import { MapPin, Phone, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer } from '@/components/layout';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const Contact = () => {
  const { isMobile } = useBreakpoint();

  const ContactItem = ({ icon: Icon, href, children }) => (
    <div className="flex items-start space-x-4">
      <Icon className="text-red-700 flex-shrink-0 mt-1" size={isMobile ? 20 : 24} />
      {href ? (
        <a 
          href={href}
          className="hover:text-red-700 transition-colors"
        >
          {children}
        </a>
      ) : (
        <div>{children}</div>
      )}
    </div>
  );

  const ContactCard = () => (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">Get in Touch</h2>
      <div className="space-y-6">
        <ContactItem 
          icon={MapPin} 
          href="https://maps.google.com/?q=201+Ford+St,+Newark,+NY+14513"
        >
          201 Ford St, Newark, NY 14513
        </ContactItem>
        
        <ContactItem 
          icon={Phone}
          href="tel:3158300008"
        >
          (315) 830-0008
        </ContactItem>
        
        <ContactItem 
          icon={MessageSquare}
          href="sms:coming-soon"
        >
          Coming Soon
        </ContactItem>
        
        <ContactItem icon={Clock}>
          <div className="space-y-1">
            <p className="font-medium">Hours of Operation:</p>
            <p>Monday-Friday: 8am-5pm</p>
            <p>Saturday-Sunday: Text Only</p>
          </div>
        </ContactItem>

        {isMobile && (
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <a
                href="https://maps.google.com/?q=201+Ford+St,+Newark,+NY+14513"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Get Directions
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );

  const MapCard = () => (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">Location</h2>
      <div className="rounded-lg overflow-hidden shadow-sm relative">
        <a 
          href="https://maps.google.com/?q=201+Ford+St,+Newark,+NY+14513"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View location on Google Maps"
        >
          <img
            src="https://maps.googleapis.com/maps/api/staticmap?center=201+Ford+St,Newark,NY&zoom=15&size=600x400&maptype=roadmap&markers=color:red%7C201+Ford+St,Newark,NY&key=YOUR_API_KEY"
            alt="Map showing 201 Ford St, Newark, NY 14513"
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <span className="bg-white/90 px-4 py-2 rounded-md text-gray-800 font-medium">
              View on Google Maps
            </span>
          </div>
        </a>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Hero Banner */}
      <div className="relative bg-[#1a1f2e] py-8 md:py-16">
        <div className="absolute inset-0">
          <img
            src="/images/contact.jpg"
            alt="Contact Us"
            className="w-full h-full object-cover opacity-25"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        </div>
        <ResponsiveContainer>
          <div className="relative text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Contact Us
            </h1>
            <p className="text-base md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Have questions? We're here to help! Reach out to us through any of the following methods.
            </p>
          </div>
        </ResponsiveContainer>
      </div>

      {/* Contact Information Section */}
      <ResponsiveContainer>
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <ContactCard />
          <MapCard />
        </div>
      </ResponsiveContainer>
    </div>
  );
};

export default Contact;