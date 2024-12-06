import { useLocation, Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowLeft, ShoppingCart } from 'lucide-react';

const SubmissionSuccess = () => {
  const location = useLocation();
  const { requestId, vehicleInfo, partInfo } = location.state || {};

  return (
    <div className="min-h-screen relative">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url("/images/parts-request-bg.jpg")',
          backgroundSize: '100%',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'repeat',
        }}
      />
      <div className="absolute inset-0 bg-[#1a1f2e] opacity-50" />
      
      <div className="relative container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto backdrop-blur-sm bg-white/95 shadow-xl p-8">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Part Request Submitted Successfully!
              </h1>
              <p className="text-gray-600">
                Thank you for submitting your request. Our team will review it and get back to you shortly.
              </p>
            </div>

            {/* Request Details */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-3 text-left">
              <h2 className="font-semibold text-gray-900">Request Details:</h2>
              <div className="space-y-2 text-gray-600">
                {requestId && (
                  <p><span className="font-medium">Request ID:</span> {requestId}</p>
                )}
                {vehicleInfo && (
                  <p><span className="font-medium">Vehicle:</span> {vehicleInfo}</p>
                )}
                {partInfo && (
                  <p><span className="font-medium">Part Requested:</span> {partInfo}</p>
                )}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-6 text-left">
              <h2 className="font-semibold text-blue-900 mb-2">What happens next?</h2>
              <ul className="list-disc list-inside space-y-2 text-blue-800">
                <li>Our team will review your request within 1 business day</li>
                <li>We&apos;ll contact you via phone or email with part availability and pricing</li>
                <li>If the part is available, we&apos;ll provide payment and pickup/shipping options</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                variant="outline"
                className="space-x-2"
                asChild
              >
                <Link to="/">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Return Home</span>
                </Link>
              </Button>
              <Button 
                className="space-x-2"
                asChild
              >
                <a 
                  href="https://www.ebay.com/str/Phoenix-Automotive"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Browse Our eBay Store</span>
                </a>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SubmissionSuccess;