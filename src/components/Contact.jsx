import React from 'react';
import { MapPin, Phone, MessageSquare, Clock } from 'lucide-react';
import { Card } from "@/components/ui/card";
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

  return (
    <ResponsiveContainer>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Contact Us</h1>
          <p className="text-muted-foreground">
            We're here to help! Reach out to us through any of the following methods.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
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
                href="sms:3154040570"
              >
                (315) 404-0570
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
                  <a
                    href="https://maps.google.com/?q=201+Ford+St,+Newark,+NY+14513"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-red-700 hover:text-red-800"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Get Directions
                  </a>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Location</h2>
            <div className="rounded-lg overflow-hidden shadow-sm">
              <iframe
                className="w-full h-64 md:h-80"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2917.308520062282!2d-77.09340548451435!3d43.04735997914689!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d14c8c8c8c8c8d%3A0x8c8c8c8c8c8c8c8c!2sPhoenix%20Automotive!5e0!3m2!1sen!2sus!4v1621436426788!5m2!1sen!2sus"
                allowFullScreen=""
                loading="lazy"
                title="Phoenix Automotive Location"
              ></iframe>
            </div>
          </Card>
        </div>
      </div>
    </ResponsiveContainer>
  );
};

export default Contact;