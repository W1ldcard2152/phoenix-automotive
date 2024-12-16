import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import FormNavigation from '../ui/FormNavigation';

const ContactInfoStep = ({
  contactInfo,
  onContactInfoChange,
  onNotesChange,
  formatPhoneNumber,
  errors,
  onNext,
  onBack,
  isSubmitting
}) => {
  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    onContactInfoChange('phone', formatted);
  };

  // Check if we can proceed - basic validation
  const canProceed = contactInfo.name && contactInfo.phone && contactInfo.email;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={contactInfo.name}
            onChange={(e) => onContactInfoChange('name', e.target.value)}
            error={errors?.name}
          />
          {errors?.name && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.name}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={contactInfo.phone}
            onChange={handlePhoneChange}
            placeholder="(555) 555-5555"
            error={errors?.phone}
          />
          {errors?.phone && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.phone}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={contactInfo.email}
            onChange={(e) => onContactInfoChange('email', e.target.value)}
            error={errors?.email}
          />
          {errors?.email && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.email}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={contactInfo.additionalNotes || ''}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Include position on vehicle (driver/passenger, front/rear), color requirements, and any other details that will help us locate the correct part."
            className="min-h-[100px]"
          />
        </div>
      </div>

      <FormNavigation
        onNext={onNext}
        onBack={onBack}
        canGoNext={canProceed}
        nextLabel="Review Request"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ContactInfoStep;