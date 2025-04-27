import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

const ReviewStep = ({
  vehicleInfo,
  selectedPart,
  contactInfo,
  onSubmit,
  onEdit,
  isSubmitting,
  error
}) => {
  return (
    <div className="space-y-6">
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
            <div>
              <dt className="font-medium">VIN</dt>
              <dd className="font-mono">{vehicleInfo.vin}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Part Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Part Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div>
              <dt className="font-medium">Category</dt>
              <dd>{selectedPart.category}</dd>
            </div>
            <div>
              <dt className="font-medium">Subcategory</dt>
              <dd>{selectedPart.subcategory}</dd>
            </div>
            {selectedPart.part && (
              <div>
                <dt className="font-medium">Part</dt>
                <dd>{selectedPart.part}</dd>
              </div>
            )}
            {contactInfo.additionalNotes && (
              <div>
                <dt className="font-medium">Additional Notes</dt>
                <dd className="whitespace-pre-wrap">{contactInfo.additionalNotes}</dd>
              </div>
            )}
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
              <dd>{contactInfo.name}</dd>
            </div>
            <div>
              <dt className="font-medium">Phone</dt>
              <dd>{contactInfo.phone}</dd>
            </div>
            <div className="col-span-2">
              <dt className="font-medium">Email</dt>
              <dd>{contactInfo.email}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={onEdit}
          disabled={isSubmitting}
        >
          Edit Request
        </Button>
        <Button 
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-red-700 hover:bg-red-800 border border-red-700"
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