import { usePartsRequest } from '@/hooks/usePartsRequest';
import { showToast } from '@/utils/toastUtils';
import StepIndicator from './ui/StepIndicator';
import VinEntryStep from './steps/VinEntryStep';
import PartSelectionStep from './steps/PartSelectionStep';
import ContactInfoStep from './steps/ContactInfoStep';
import ReviewStep from './steps/ReviewStep';
import { Card, CardContent } from "@/components/ui/card";

const STEPS = [
  { label: 'Vehicle Info' },
  { label: 'Select Part' },
  { label: 'Contact Info' },
  { label: 'Review' }
];

const PartsRequestForm = () => {
  const {
    state,
    setVin,
    setVehicleInfo,
    selectCategory,
    selectSubcategory,
    selectPart,
    setSearchQuery,
    selectSearchResult,
    setContactInfo,
    setAdditionalNotes,
    formatPhoneNumber,
    nextStep,
    prevStep,
    getAvailableSubcategories,
    getAvailableParts,
    resetForm
  } = usePartsRequest();

  const renderStep = () => {
    switch (state.step) {
      case 1:
        return (
          <VinEntryStep
            vin={state.vin}
            onVinChange={setVin}
            onVinSubmit={async (vin) => {
              try {
                // Call to NHTSA API would go here
                const vinInfo = await decodeVin(vin);
                setVehicleInfo(vinInfo);
                nextStep();
              } catch (error) {
                // Handle error
              }
            }}
            isLoading={state.isLoading}
            error={state.errors.vin}
          />
        );

      case 2:
        return (
          <PartSelectionStep
            selectedCategory={state.selectedCategory}
            selectedSubcategory={state.selectedSubcategory}
            selectedPart={state.selectedPart}
            onCategoryChange={selectCategory}
            onSubcategoryChange={selectSubcategory}
            onPartChange={selectPart}
            searchResults={state.searchResults}
            onSearch={setSearchQuery}
            onSearchSelect={selectSearchResult}
            availableSubcategories={getAvailableSubcategories()}
            availableParts={getAvailableParts()}
            vehicleInfo={state.vehicleInfo}
            error={state.errors.part}
          />
        );

      case 3:
        return (
          <ContactInfoStep
            contactInfo={state.contactInfo}
            onContactInfoChange={setContactInfo}
            onNotesChange={setAdditionalNotes}
            formatPhoneNumber={formatPhoneNumber}
            errors={state.errors.contactInfo}
          />
        );

      case 4:
        return (
          <ReviewStep
            vehicleInfo={state.vehicleInfo}
            selectedPart={{
              category: state.selectedCategory,
              subcategory: state.selectedSubcategory,
              part: state.selectedPart
            }}
            contactInfo={state.contactInfo}
            onSubmit={handleSubmit}
            onEdit={() => prevStep()}
            isSubmitting={state.isSubmitting}
            error={state.errors.submit}
          />
        );

      default:
        return null;
    }
  };

  const handleVinSubmit = async (vin) => {
    try {
      const vehicleInfo = await handleVinDecode(vin);
      
      if (vehicleInfo.inInventory) {
        showToast.info(`Vehicle found in ${vehicleInfo.inventoryType} inventory`);
      }

      setVehicleInfo(vehicleInfo);
      nextStep();
    } catch (error) {
      showToast.error('VIN Validation Failed', error.message);
    }
  };

  const handlePartSelect = (part) => {
    try {
      selectPart(part);
      showToast.success('Part selected successfully');
      nextStep();
    } catch (error) {
      showToast.error('Failed to select part', error.message);
    }
  };

  const handleFormSubmit = async () => {
    try {
      await submitPartRequest(state);
      showToast.success(
        'Part request submitted successfully! Our team will contact you shortly.'
      );
      resetForm();
    } catch (error) {
      showToast.error(
        'Failed to submit request',
        'Please try again or contact support if the problem persists'
      );
    }
  };

  const handleStepChange = (direction) => {
    try {
      if (direction === 'next') {
        const success = nextStep();
        if (success && state.step === 4) {
          showToast.info('Please review your request before submitting');
        }
      } else {
        prevStep();
      }
    } catch (error) {
      showToast.error('Navigation Failed', error.message);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-2xl mx-auto">
      <StepIndicator steps={STEPS} currentStep={state.step} />
      <Card>
        <CardContent className="pt-6">
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
};

export default PartsRequestForm;
