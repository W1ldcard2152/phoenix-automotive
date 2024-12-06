import React from 'react';

const About = () => (
  <div className="container mx-auto px-4 py-12">
    <h1 className="text-3xl font-bold mb-8">About Phoenix Automotive</h1>
    <div className="prose max-w-none">
      <p className="text-lg mb-6">Started in 2012 with the goal of bringing higher quality to the recycled auto parts industry, we have a fully stocked warehouse featuring quality parts from many late model vehicles ranging from interior trim pieces to complete engine assemblies.</p>
      <p className="text-lg mb-6">Looking to continue raising the quality of service that should be standard in our industry, we have branched out to selling pre-owned cars, trucks, and SUVs.</p>
      <div className="grid md:grid-cols-2 gap-8 mt-12">
        <div className="text-center">
          <img src="/api/placeholder/400/400" alt="Team Member" className="rounded-full mx-auto mb-4" />
          <h3 className="font-bold">Greg Moore</h3>
          <p>Owner</p>
        </div>
        <div className="text-center">
          <img src="/api/placeholder/400/400" alt="Team Member" className="rounded-full mx-auto mb-4" />
          <h3 className="font-bold">Ryan Schuster</h3>
          <p>Operations Manager</p>
        </div>
      </div>
    </div>
  </div>
);

export default About;
