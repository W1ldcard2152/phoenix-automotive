import PartsRequestForm from './partRequest/index';

const PartsRequestPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative bg-[#1a1f2e] py-16">
        <div className="absolute inset-0">
          <img
            src="/images/parts-request-bg.jpg"
            alt="Parts Request Background"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        </div>
        <div className="relative">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Request Parts</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Looking for a specific part? Fill out our request form below and our team will check availability and contact you with pricing.
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="container mx-auto px-4 py-12">
        <PartsRequestForm />
      </div>

      {/* Additional Information Section */}
      <div className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Quality Guaranteed</h3>
              <p className="text-muted-foreground">
                All parts are thoroughly inspected and tested before shipping.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Expert Support</h3>
              <p className="text-muted-foreground">
                Our team will help you find the exact part you need.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Fast Response</h3>
              <p className="text-muted-foreground">
                We typically respond to part requests within 24 business hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartsRequestPage;