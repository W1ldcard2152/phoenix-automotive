import { useState } from 'react';
import { ResponsiveContainer } from '@/components/layout';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Wrench, 
  Clock, 
  ArrowRight, 
  Car, 
  Activity,
  Gauge,
  Settings,
  AlertCircle,
  Phone,
  Mail,
  CheckCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { apiClient } from '@/utils/apiClient';
import { showToast } from '@/utils/toastUtils';

const RepairServicesPage = () => {
  const { isMobile } = useBreakpoint();
  
  // Simple form state
  const [formData, setFormData] = useState({
    name: '',
    contactMethod: 'phone', // 'phone' or 'email'
    phone: '',
    email: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  const ServiceCard = ({ title, description, icon: Icon }) => (
    <Card className="p-6 overflow-hidden hover:shadow-lg transition-all border-l-4 border-l-red-700">
      <div className="flex flex-col h-full">
        <div className="flex items-center mb-3">
          <Icon className="h-6 w-6 text-red-700 mr-3" />
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <p className="text-muted-foreground flex-grow">{description}</p>
      </div>
    </Card>
  );

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear errors when user types
  };

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length >= 3) {
      formatted = `(${cleaned.slice(0, 3)}`;
      if (cleaned.length >= 6) {
        formatted += `) ${cleaned.slice(3, 6)}`;
        if (cleaned.length >= 10) {
          formatted += `-${cleaned.slice(6, 10)}`;
        } else if (cleaned.length > 6) {
          formatted += `-${cleaned.slice(6)}`;
        }
      } else if (cleaned.length > 3) {
        formatted += `) ${cleaned.slice(3)}`;
      }
    }
    return formatted;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    
    if (formData.contactMethod === 'phone') {
      if (!formData.phone.trim()) {
        setError('Please enter your phone number');
        return false;
      }
      if (!/^\(\d{3}\) \d{3}-\d{4}$/.test(formData.phone)) {
        setError('Please enter a valid phone number');
        return false;
      }
    } else {
      if (!formData.email.trim()) {
        setError('Please enter your email address');
        return false;
      }
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Prepare simplified data for API
      const requestData = {
        customerInfo: {
          name: formData.name,
          phone: formData.contactMethod === 'phone' ? formData.phone : '',
          email: formData.contactMethod === 'email' ? formData.email : formData.email || 'noemail@provided.com',
          address: { street: '', city: '', state: '', zipCode: '' }
        },
        vehicleInfo: {
          year: new Date().getFullYear(), // Placeholder
          make: 'TBD',
          model: 'TBD',
          trim: '',
          vin: '',
          mileage: 0,
          engineSize: ''
        },
        serviceInfo: {
          message: formData.description || 'Customer will provide details during phone consultation',
          urgency: 'Medium'
        },
        contactMethod: formData.contactMethod,
        isSimplifiedRequest: true
      };
      
      await apiClient.repairRequests.create(requestData);
      
      setSubmitSuccess(true);
      showToast.success(
        'Request Submitted!',
        `We'll contact you ${formData.contactMethod === 'phone' ? 'by phone' : 'by email'} shortly to discuss your repair needs.`
      );
      
      // Reset form after delay
      setTimeout(() => {
        setFormData({
          name: '',
          contactMethod: 'phone',
          phone: '',
          email: '',
          description: ''
        });
        setSubmitSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error('Form submission error:', error);
      setError('Failed to submit request. Please try calling us directly at (315) 830-0008.');
      showToast.error(
        'Submission Failed',
        'Please try again or call us directly at (315) 830-0008'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Hero Banner */}
      <section className="relative bg-[#1a1f2e]">
        <div className="relative h-[400px] md:h-[500px] overflow-hidden">
          <img
            src="/images/service-page-bg.jpg"
            alt="Auto Repair Services"
            className="absolute inset-0 w-full h-full object-cover md:object-center opacity-40"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/60" />
          
          <ResponsiveContainer
            mobileClassName="absolute inset-0 flex items-center justify-center px-4"
            desktopClassName="absolute inset-0 container mx-auto px-4 flex items-center"
          >
            <div className="w-full max-w-4xl mx-auto text-center">
              <div className="space-y-4 md:space-y-6">
                <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                  Professional Auto Repair
                </h1>
                <p className="text-lg md:text-2xl text-white max-w-3xl mx-auto leading-relaxed">
                  Expert diagnosis and repair for all makes and models. Fast, reliable, and guaranteed.
                </p>
                
                <div className="flex flex-col items-center gap-4 pt-4">
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <a href="tel:3158300008" className="inline-flex">
                      <Button className="bg-red-700 hover:bg-red-800 text-white px-8 py-4 text-xl font-semibold shadow-lg">
                        <Phone className="mr-2 h-6 w-6" />
                        Call (315) 830-0008
                      </Button>
                    </a>
                    <span className="text-white text-lg">or</span>
                    <Button 
                      variant="outline"
                      className="border-white bg-white/10 hover:bg-white/20 text-white px-6 py-4 text-lg backdrop-blur-sm"
                      onClick={() => document.getElementById('request-form').scrollIntoView({ behavior: 'smooth' })}
                    >
                      Request Callback
                    </Button>
                  </div>
                  <p className="text-white/90 text-sm">
                    Mon-Fri: 8am-5pm | Sat-Sun: Text Only
                  </p>
                </div>
              </div>
            </div>
          </ResponsiveContainer>
        </div>
      </section>

      <ResponsiveContainer>
        <div className="space-y-12">
          {/* Contact Form Section */}
          <section id="request-form" className="max-w-2xl mx-auto">
            <Card className="p-8">
              {submitSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
                  <h2 className="text-2xl font-bold text-green-600 mb-4">Request Submitted!</h2>
                  <p className="text-lg mb-2">
                    We'll contact you {formData.contactMethod === 'phone' ? 'by phone' : 'by email'} shortly.
                  </p>
                  <p className="text-muted-foreground">
                    For immediate assistance, call us at (315) 830-0008
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">Request Service</h2>
                    <p className="text-muted-foreground">
                      Tell us your name and how to reach you. We'll call to discuss your repair needs.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                        className="text-lg p-3"
                      />
                    </div>

                    {/* Contact Method Choice */}
                    <div className="space-y-4">
                      <Label>How would you prefer we contact you? *</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, contactMethod: 'phone' }))}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            formData.contactMethod === 'phone'
                              ? 'border-red-700 bg-red-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center">
                            <Phone className="h-5 w-5 text-red-700 mr-3" />
                            <div>
                              <div className="font-semibold">Phone Call</div>
                              <div className="text-sm text-muted-foreground">Fastest way to reach you</div>
                            </div>
                          </div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, contactMethod: 'email' }))}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            formData.contactMethod === 'email'
                              ? 'border-red-700 bg-red-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center">
                            <Mail className="h-5 w-5 text-red-700 mr-3" />
                            <div>
                              <div className="font-semibold">Email</div>
                              <div className="text-sm text-muted-foreground">We'll send you an email</div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Phone or Email Input */}
                    {formData.contactMethod === 'phone' ? (
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          placeholder="(555) 555-5555"
                          required
                          className="text-lg p-3"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your.email@example.com"
                          required
                          className="text-lg p-3"
                        />
                      </div>
                    )}

                    {/* Optional Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">What's wrong with your vehicle? (Optional)</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Briefly describe the problem (e.g., 'car won't start', 'strange noise when braking', 'check engine light on')"
                        className="min-h-[100px] text-lg p-3"
                      />
                      <p className="text-sm text-muted-foreground">
                        Don't worry about details - we'll get all the info we need when we call you.
                      </p>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-red-700 hover:bg-red-800 text-white py-4 text-xl font-semibold"
                    >
                      {isSubmitting ? 'Submitting...' : 'Request Service'}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      Need immediate help? Call us at{' '}
                      <a href="tel:3158300008" className="text-red-700 hover:underline font-semibold">
                        (315) 830-0008
                      </a>
                    </p>
                  </form>
                </>
              )}
            </Card>
          </section>

          {/* Services Section */}
          <section>
            <h2 className="text-3xl font-bold mb-2 text-center">Our Services</h2>
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              From diagnostics to major repairs, we handle it all with expert care
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ServiceCard
                title="Engine & Drivetrain"
                description="Complete engine diagnostics, repair, and rebuilds. Transmission service and repair for all makes and models."
                icon={Settings}
              />
              <ServiceCard
                title="Brakes & Safety Systems"
                description="Brake repair, ABS diagnostics, and safety system maintenance to keep you safe on the road."
                icon={AlertCircle}
              />
              <ServiceCard
                title="Electrical & Computer"
                description="Advanced diagnostics for check engine lights, electrical problems, and computer system issues."
                icon={Activity}
              />
              <ServiceCard
                title="Suspension & Steering"
                description="Alignment, suspension repair, and steering system service for a smooth, safe ride."
                icon={Car}
              />
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="bg-slate-50 p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Phoenix Automotive</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <Shield className="h-12 w-12 text-red-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Guaranteed Work</h3>
                <p className="text-muted-foreground">
                  12-month/12,000 mile warranty on repairs with new parts. 3-month/3,000 mile warranty on used parts.
                </p>
              </div>
              
              <div>
                <Wrench className="h-12 w-12 text-red-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Expert Technicians</h3>
                <p className="text-muted-foreground">
                  Experienced mechanics who know how to diagnose and fix problems right the first time.
                </p>
              </div>
              
              <div>
                <Clock className="h-12 w-12 text-red-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Fast Service</h3>
                <p className="text-muted-foreground">
                  Most repairs completed same day. We know you need your car back quickly.
                </p>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="text-center bg-[#1a1f2e] text-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Your Car Fixed?</h2>
            <p className="text-xl mb-6">Call us now or request a callback above</p>
            <a href="tel:3158300008">
              <Button className="bg-red-700 hover:bg-red-800 text-white px-8 py-4 text-xl font-semibold">
                <Phone className="mr-2 h-6 w-6" />
                Call (315) 830-0008
              </Button>
            </a>
          </section>
        </div>
      </ResponsiveContainer>
    </div>
  );
};

export default RepairServicesPage;