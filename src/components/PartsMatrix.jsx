import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PartsMatrix = () => {
  const [formData, setFormData] = useState({
    customerEmail: '',
    customerName: '',
    requestType: 'deletion',
    ebayUserId: '',
    transactionId: '',
    additionalInfo: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call - replace with actual endpoint
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-green-600">
                Request Submitted Successfully
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  Your customer data request has been received and will be processed within 30 days
                  as required by applicable privacy laws. You will receive a confirmation email shortly.
                </AlertDescription>
              </Alert>
              <div className="mt-6 text-center">
                <Button 
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      customerEmail: '',
                      customerName: '',
                      requestType: 'deletion',
                      ebayUserId: '',
                      transactionId: '',
                      additionalInfo: ''
                    });
                  }}
                  variant="outline"
                >
                  Submit Another Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Customer Data Request Portal</CardTitle>
            <p className="text-center text-gray-600 mt-2">
              Submit requests for customer data access, correction, or deletion
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customerEmail">Email Address *</Label>
                  <Input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    type="text"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="requestType">Request Type *</Label>
                  <select
                    id="requestType"
                    name="requestType"
                    value={formData.requestType}
                    onChange={handleInputChange}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="deletion">Delete My Data</option>
                    <option value="access">Access My Data</option>
                    <option value="correction">Correct My Data</option>
                    <option value="portability">Export My Data</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="ebayUserId">eBay User ID (if applicable)</Label>
                  <Input
                    id="ebayUserId"
                    name="ebayUserId"
                    type="text"
                    value={formData.ebayUserId}
                    onChange={handleInputChange}
                    placeholder="Enter your eBay User ID"
                  />
                </div>

                <div>
                  <Label htmlFor="transactionId">Transaction ID (if applicable)</Label>
                  <Input
                    id="transactionId"
                    name="transactionId"
                    type="text"
                    value={formData.transactionId}
                    onChange={handleInputChange}
                    placeholder="Enter transaction or order ID"
                  />
                </div>

                <div>
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    placeholder="Please provide any additional details about your request"
                    rows={4}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="text-sm text-gray-600 mb-4">
                  <p className="mb-2">
                    <strong>Privacy Notice:</strong> We are committed to protecting your privacy and 
                    complying with applicable data protection laws including GDPR, CCPA, and other 
                    relevant privacy regulations.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Data deletion requests will be processed within 30 days</li>
                    <li>We may require additional verification for security purposes</li>
                    <li>Some data may be retained as required by law</li>
                    <li>You will receive email confirmation of your request</li>
                  </ul>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting Request...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            For immediate assistance, contact us at{' '}
            <a href="mailto:privacy@phoenixautomotive.com" className="text-blue-600 hover:underline">
              privacy@phoenixautomotive.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PartsMatrix;