import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const ReviewStep = ({
  vehicleInfo,
  serviceInfo,
  customerInfo,
  onSubmit,
  onBack,
  isSubmitting
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Flexible';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Review Your Service Request</h2>
      
      {/* Vehicle Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="font-medium">Year</dt>
              <dd>{vehicleInfo.year}</dd>
            </div>
            <div>
              <dt className="font-medium">Make</dt>
              <dd>{vehicleInfo.make}</dd>
            </div>
            <div>
              <dt className="font-medium">Model</dt>
              <dd>{vehicleInfo.model}</dd>
            </div>
            {vehicleInfo.trim && (
              <div>
                <dt className="font-medium">Trim</dt>
                <dd>{vehicleInfo.trim}</dd>
              </div>
            )}
            <div>
              <dt className="font-medium">Mileage</dt>
              <dd>{vehicleInfo.mileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} miles</dd>
            </div>
            {vehicleInfo.engineSize && (
              <div>
                <dt className="font-medium">Engine</dt>
                <dd>{vehicleInfo.engineSize}</dd>
              </div>
            )}
            <div className="col-span-2">
              <dt className="font-medium">VIN</dt>
              <dd className="font-mono">{vehicleInfo.vin}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Service Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Service Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div>
              <dt className="font-medium">Service Requested</dt>
              <dd>{serviceInfo.serviceType === 'Other' ? serviceInfo.otherServiceType : serviceInfo.serviceType}</dd>
            </div>
            <div>
              <dt className="font-medium">Description</dt>
              <dd className="whitespace-pre-wrap">{serviceInfo.description}</dd>
            </div>
            <div>
              <dt className="font-medium">Preferred Date</dt>
              <dd>{serviceInfo.preferredDate ? formatDate(serviceInfo.preferredDate) : 'No specific date'}</dd>
            </div>
            <div>
              <dt className="font-medium">Urgency</dt>
              <dd>{serviceInfo.urgency}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="font-medium">Name</dt>
              <dd>{customerInfo.name}</dd>
            </div>
            <div>
              <dt className="font-medium">Phone</dt>
              <dd>{customerInfo.phone}</dd>
            </div>
            <div className="col-span-2">
              <dt className="font-medium">Email</dt>
              <dd>{customerInfo.email}</dd>
            </div>
            
            {customerInfo.address.street && (
              <div className="col-span-2">
                <dt className="font-medium">Address</dt>
                <dd>
                  {customerInfo.address.street}<br />
                  {customerInfo.address.city && `${customerInfo.address.city}, `}
                  {customerInfo.address.state} {customerInfo.address.zipCode}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <div className="text-sm border-l-4 border-blue-500 bg-blue-50 p-4">
        <p>
          By submitting this form, you agree to be contacted regarding your service request. 
          We'll reach out to confirm your appointment and provide a cost estimate.
        </p>
      </div>

      <div className="flex justify-between pt-6 mt-6 border-t">
        <Button
          type="button" 
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button 
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="border border-primary"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Request'
          )}
        </Button>
      </div>
    </div>
  );
};

export default ReviewStep;