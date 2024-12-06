import React from 'react';
import { MapPin, Phone, MessageSquare, Clock } from 'lucide-react';

const Contact = () => (
  <div className="container mx-auto px-4 py-12">
    <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-6">Get in Touch</h2>
          <div className="space-y-4">
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
            <div className="flex items-center space-x-4">
              <Clock className="text-red-700" />
              <div>
                <p>Monday-Friday: 8am-5pm</p>
                <p>Saturday-Sunday: Text Only</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-6">Location</h2>
        <div className="aspect-w-16 aspect-h-9">
          <iframe
            className="w-full h-64 rounded-lg"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2917.308520062282!2d-77.09340548451435!3d43.04735997914689!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d14c8c8c8c8c8d%3A0x8c8c8c8c8c8c8c8c!2sPhoenix%20Automotive!5e0!3m2!1sen!2sus!4v1621436426788!5m2!1sen!2sus"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
);

export default Contact;