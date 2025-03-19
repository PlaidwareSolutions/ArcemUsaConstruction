import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApplicationSubmission } from '@/hooks/useApplicationSubmission';

// UI Components
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { scrollToTop } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Loader2 } from 'lucide-react';

// Subcontractor Form Schema
const subcontractorFormSchema = z.object({
  companyName: z.string()
    .min(2, { message: 'Company name is required and must be at least 2 characters long' })
    .max(100, { message: 'Company name must be less than 100 characters' }),
  
  contactName: z.string()
    .min(2, { message: 'Contact name is required and must be at least 2 characters long' })
    .max(100, { message: 'Contact name must be less than 100 characters' }),
  
  email: z.string()
    .email({ message: 'Please enter a valid email address' })
    .min(5, { message: 'Email is required' })
    .max(100, { message: 'Email must be less than 100 characters' }),
  
  phone: z.string()
    .min(10, { message: 'Phone number must be at least 10 digits' })
    .max(20, { message: 'Phone number must be less than 20 characters' })
    .refine(val => /^[0-9()\-\s+]+$/.test(val), { 
      message: 'Phone number can only contain digits, spaces, and the characters ()+-' 
    }),
  
  address: z.string()
    .min(5, { message: 'Address is required and must be at least 5 characters long' })
    .max(200, { message: 'Address must be less than 200 characters' }),
  
  city: z.string()
    .min(2, { message: 'City is required and must be at least 2 characters long' })
    .max(100, { message: 'City must be less than 100 characters' }),
  
  state: z.string()
    .min(2, { message: 'State is required and must be at least 2 characters long' })
    .max(50, { message: 'State must be less than 50 characters' }),
  
  zip: z.string()
    .min(5, { message: 'ZIP code is required and must be at least 5 characters' })
    .max(15, { message: 'ZIP code must be less than 15 characters' })
    .refine(val => /^[0-9\-\s]+$/.test(val), { 
      message: 'ZIP code can only contain digits, hyphens, and spaces' 
    }),
  
  website: z.string().optional()
    .transform(val => val === "" ? undefined : val)
    .pipe(
      z.string().url({ message: 'Please enter a valid website URL' }).optional()
    ),
  
  serviceTypes: z.array(z.string())
    .min(1, { message: 'Please select at least one service type' }),
  
  serviceDescription: z.string()
    .min(10, { message: 'Please provide a description of your services (minimum 10 characters)' })
    .max(2000, { message: 'Description must be less than 2000 characters' }),
  
  yearsInBusiness: z.string()
    .min(1, { message: 'Please select years in business' }),
  
  insurance: z.boolean().default(false),
  bondable: z.boolean().default(false),
  
  licenses: z.string().optional()
    .transform(val => val === "" ? undefined : val),
  
  references: z.string().optional()
    .transform(val => val === "" ? undefined : val),
  
  howDidYouHear: z.string().optional()
    .transform(val => val === "" ? undefined : val),
});

// Vendor Form Schema
const vendorFormSchema = z.object({
  companyName: z.string()
    .min(2, { message: 'Company name is required and must be at least 2 characters long' })
    .max(100, { message: 'Company name must be less than 100 characters' }),
  
  contactName: z.string()
    .min(2, { message: 'Contact name is required and must be at least 2 characters long' })
    .max(100, { message: 'Contact name must be less than 100 characters' }),
  
  email: z.string()
    .email({ message: 'Please enter a valid email address' })
    .min(5, { message: 'Email is required' })
    .max(100, { message: 'Email must be less than 100 characters' }),
  
  phone: z.string()
    .min(10, { message: 'Phone number must be at least 10 digits' })
    .max(20, { message: 'Phone number must be less than 20 characters' })
    .refine(val => /^[0-9()\-\s+]+$/.test(val), { 
      message: 'Phone number can only contain digits, spaces, and the characters ()+-' 
    }),
  
  address: z.string()
    .min(5, { message: 'Address is required and must be at least 5 characters long' })
    .max(200, { message: 'Address must be less than 200 characters' }),
  
  city: z.string()
    .min(2, { message: 'City is required and must be at least 2 characters long' })
    .max(100, { message: 'City must be less than 100 characters' }),
  
  state: z.string()
    .min(2, { message: 'State is required and must be at least 2 characters long' })
    .max(50, { message: 'State must be less than 50 characters' }),
  
  zip: z.string()
    .min(5, { message: 'ZIP code is required and must be at least 5 characters' })
    .max(15, { message: 'ZIP code must be less than 15 characters' })
    .refine(val => /^[0-9\-\s]+$/.test(val), { 
      message: 'ZIP code can only contain digits, hyphens, and spaces' 
    }),
  
  website: z.string().optional()
    .transform(val => val === "" ? undefined : val)
    .pipe(
      z.string().url({ message: 'Please enter a valid website URL' }).optional()
    ),
  
  supplyTypes: z.array(z.string())
    .min(1, { message: 'Please select at least one product/supply type' }),
  
  serviceDescription: z.string()
    .min(10, { message: 'Please provide a description of your products/services (minimum 10 characters)' })
    .max(2000, { message: 'Description must be less than 2000 characters' }),
  
  yearsInBusiness: z.string()
    .min(1, { message: 'Please select years in business' }),
  
  references: z.string().optional()
    .transform(val => val === "" ? undefined : val),
  
  howDidYouHear: z.string().optional()
    .transform(val => val === "" ? undefined : val),
});

type SubcontractorFormValues = z.infer<typeof subcontractorFormSchema>;
type VendorFormValues = z.infer<typeof vendorFormSchema>;

// Service types options for subcontractors
const SERVICE_TYPES = [
  'General Construction',
  'Electrical',
  'Plumbing',
  'HVAC',
  'Masonry',
  'Carpentry',
  'Roofing',
  'Flooring',
  'Painting',
  'Drywall',
  'Excavation',
  'Concrete',
  'Landscaping',
  'Security Systems',
  'Fire Protection',
  'Glass & Glazing',
  'Demolition',
  'Insulation',
  'Waterproofing',
  'Other',
];

// Supply types options for vendors
const SUPPLY_TYPES = [
  'Building Materials',
  'Lumber',
  'Concrete & Cement',
  'Steel & Metals',
  'Electrical Supplies',
  'Plumbing Supplies',
  'HVAC Equipment',
  'Roofing Materials',
  'Insulation',
  'Paint & Finishes',
  'Windows & Doors',
  'Flooring Materials',
  'Hardware & Fasteners',
  'Tools & Equipment',
  'Safety Equipment',
  'Lighting Fixtures',
  'Landscaping Supplies',
  'Other',
];

// Years in business options
const YEARS_IN_BUSINESS_OPTIONS = [
  'Less than 1 year',
  '1-3 years',
  '3-5 years',
  '5-10 years',
  '10+ years',
];

// How did you hear about us options
const HOW_DID_YOU_HEAR_OPTIONS = [
  'Website',
  'Social Media',
  'Referral',
  'Search Engine',
  'Advertisement',
  'Trade Show',
  'Other',
];

// Main component for Subcontractor and Vendor Registration
const SubcontractorVendorRegistration = () => {
  // State management
  const [activeTab, setActiveTab] = useState('subcontractor');
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);
  const [selectedSupplyTypes, setSelectedSupplyTypes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  // Create forms for each tab
  const subcontractorForm = useForm<SubcontractorFormValues>({
    resolver: zodResolver(subcontractorFormSchema),
    defaultValues: {
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      website: '',
      serviceTypes: [],
      serviceDescription: '',
      yearsInBusiness: '',
      insurance: false,
      bondable: false,
      licenses: '',
      references: '',
      howDidYouHear: '',
    },
  });

  const vendorForm = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      website: '',
      supplyTypes: [],
      serviceDescription: '',
      yearsInBusiness: '',
      references: '',
      howDidYouHear: '',
    },
  });

  // Check URL for tab parameter on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    
    if (tabParam === 'vendor') {
      setActiveTab('vendor');
    }
    
    scrollToTop();
    document.title = 'Subcontractors & Vendors - ARCEM';
  }, [location]);

  // Handle service type selection for subcontractors
  const handleServiceTypeSelect = (type: string) => {
    if (selectedServiceTypes.includes(type)) {
      // Remove the type if already selected
      const updatedTypes = selectedServiceTypes.filter(t => t !== type);
      setSelectedServiceTypes(updatedTypes);
      subcontractorForm.setValue('serviceTypes', updatedTypes);
    } else {
      // Add the type if not already selected
      const updatedTypes = [...selectedServiceTypes, type];
      setSelectedServiceTypes(updatedTypes);
      subcontractorForm.setValue('serviceTypes', updatedTypes);
    }
  };

  // Handle supply type selection for vendors
  const handleSupplyTypeSelect = (type: string) => {
    if (selectedSupplyTypes.includes(type)) {
      // Remove the type if already selected
      const updatedTypes = selectedSupplyTypes.filter(t => t !== type);
      setSelectedSupplyTypes(updatedTypes);
      vendorForm.setValue('supplyTypes', updatedTypes);
    } else {
      // Add the type if not already selected
      const updatedTypes = [...selectedSupplyTypes, type];
      setSelectedSupplyTypes(updatedTypes);
      vendorForm.setValue('supplyTypes', updatedTypes);
    }
  };

  // Use our custom hook to handle API submissions
  const { isSubmitting: isSubmittingAPI, submitSubcontractorApplication, submitVendorApplication } = useApplicationSubmission();
  
  // Form submission handlers
  const onSubmitSubcontractor = async (data: SubcontractorFormValues) => {
    // Prevent multiple submissions
    if (isSubmitting || isSubmittingAPI) return;
    setIsSubmitting(true);
    
    // Show loading toast
    toast({
      title: "Submitting Application",
      description: "Please wait while we submit your application...",
    });
    
    try {
      // Prepare data for submission
      const formData = {
        companyName: data.companyName.trim(),
        contactName: data.contactName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        zip: data.zip.trim(),
        website: data.website,
        serviceTypes: data.serviceTypes,
        serviceDescription: data.serviceDescription.trim(),
        yearsInBusiness: data.yearsInBusiness,
        insurance: data.insurance,
        bondable: data.bondable,
        licenses: data.licenses || "",
        references: data.references || "",
        howDidYouHear: data.howDidYouHear || "",
      };
      
      // Use our custom hook to submit the application
      const result = await submitSubcontractorApplication(formData);
      
      if (result.success) {
        // Reset form and state
        subcontractorForm.reset();
        setSelectedServiceTypes([]);
        scrollToTop();
      }
    } catch (error) {
      console.error("Error submitting subcontractor application:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitVendor = async (data: VendorFormValues) => {
    // Prevent multiple submissions
    if (isSubmitting || isSubmittingAPI) return;
    setIsSubmitting(true);
    
    // Show loading toast
    toast({
      title: "Submitting Application",
      description: "Please wait while we submit your application...",
    });
    
    try {
      // Prepare data for submission
      const formData = {
        companyName: data.companyName.trim(),
        contactName: data.contactName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        zip: data.zip.trim(),
        website: data.website,
        supplyTypes: data.supplyTypes,
        serviceDescription: data.serviceDescription.trim(),
        yearsInBusiness: data.yearsInBusiness,
        references: data.references || "",
        howDidYouHear: data.howDidYouHear || "",
      };
      
      // Use our custom hook to submit the application
      const result = await submitVendorApplication(formData);
      
      if (result.success) {
        // Reset form and state
        vendorForm.reset();
        setSelectedSupplyTypes([]);
        scrollToTop();
      }
    } catch (error) {
      console.error("Error submitting vendor application:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL without navigating
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('tab', value);
    window.history.pushState({}, '', newUrl);
  };

  // Helper function to show form errors and scroll to first error
  const showFormErrors = (form: any) => {
    const firstErrorField = Object.keys(form.formState.errors)[0];
    if (firstErrorField) {
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    
    toast({
      title: "Form Validation Error",
      description: "Please check the highlighted fields and correct the errors.",
      variant: "destructive",
    });
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="relative h-96 flex items-center justify-center bg-gradient-to-r from-primary/90 to-primary-foreground/70">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-white text-5xl md:text-6xl font-bold mb-6">
            Join Our Network
          </h1>
          <p className="text-white text-xl md:text-2xl font-light max-w-3xl mx-auto">
            Partner with ARCEM for construction excellence
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-background py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <Tabs 
              defaultValue={activeTab} 
              value={activeTab}
              onValueChange={handleTabChange}
              className="mb-12"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="subcontractor" 
                  className="text-lg font-medium py-3"
                >
                  Subcontractor Registration
                </TabsTrigger>
                <TabsTrigger 
                  value="vendor" 
                  className="text-lg font-medium py-3"
                >
                  Vendor Registration
                </TabsTrigger>
              </TabsList>
              
              {/* Subcontractor Form */}
              <TabsContent value="subcontractor" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold mb-4">Subcontractor Registration</h2>
                      <p className="text-muted-foreground">
                        Complete the form below to register as a subcontractor with ARCEM. We will review your information and contact you if there are opportunities that match your services.
                      </p>
                    </div>
                    
                    <Form {...subcontractorForm}>
                      <form onSubmit={subcontractorForm.handleSubmit(onSubmitSubcontractor, () => showFormErrors(subcontractorForm))} className="space-y-8">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Company Information</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={subcontractorForm.control}
                              name="companyName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Company Name *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your company name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={subcontractorForm.control}
                              name="contactName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Contact Name *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Full name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={subcontractorForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email *</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="your@email.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={subcontractorForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="(xxx) xxx-xxxx" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={subcontractorForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Street address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={subcontractorForm.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="City" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={subcontractorForm.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="State" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={subcontractorForm.control}
                              name="zip"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>ZIP Code *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="ZIP code" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={subcontractorForm.control}
                            name="website"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://www.example.com" {...field} />
                                </FormControl>
                                <FormDescription>Optional</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Service Information</h3>
                          
                          <FormField
                            control={subcontractorForm.control}
                            name="serviceTypes"
                            render={() => (
                              <FormItem>
                                <FormLabel>Service Types *</FormLabel>
                                <FormDescription>
                                  Select all services that you provide
                                </FormDescription>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                  {SERVICE_TYPES.map((type) => (
                                    <Button
                                      type="button"
                                      key={type}
                                      variant={selectedServiceTypes.includes(type) ? "default" : "outline"}
                                      className="justify-start h-auto py-2 px-3 text-left"
                                      onClick={() => handleServiceTypeSelect(type)}
                                    >
                                      {type}
                                    </Button>
                                  ))}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {selectedServiceTypes.map((type) => (
                                    <Badge key={type} variant="secondary" className="pl-2 pr-1 py-1.5">
                                      {type}
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-0 ml-1"
                                        onClick={() => handleServiceTypeSelect(type)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </Badge>
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={subcontractorForm.control}
                            name="serviceDescription"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Service Description *</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe the services you provide, your specialties, and any unique capabilities..." 
                                    className="min-h-32" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={subcontractorForm.control}
                            name="yearsInBusiness"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Years in Business *</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select years in business" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {YEARS_IN_BUSINESS_OPTIONS.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={subcontractorForm.control}
                              name="insurance"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="cursor-pointer">
                                      Liability Insurance
                                    </FormLabel>
                                    <FormDescription>
                                      Do you have liability insurance?
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={subcontractorForm.control}
                              name="bondable"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="cursor-pointer">
                                      Bondable
                                    </FormLabel>
                                    <FormDescription>
                                      Are you bondable?
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={subcontractorForm.control}
                            name="licenses"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Licenses & Certifications</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="List any relevant licenses or certifications..." 
                                    className="min-h-24" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormDescription>Optional</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={subcontractorForm.control}
                            name="references"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>References</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="List any relevant references..." 
                                    className="min-h-24" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormDescription>Optional</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={subcontractorForm.control}
                            name="howDidYouHear"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>How Did You Hear About Us?</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select option" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {HOW_DID_YOU_HEAR_OPTIONS.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormDescription>Optional</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full md:w-auto md:min-w-32"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            'Submit Application'
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Vendor Form */}
              <TabsContent value="vendor" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold mb-4">Vendor Registration</h2>
                      <p className="text-muted-foreground">
                        Complete the form below to register as a vendor with ARCEM. We will review your information and contact you if there are opportunities to work together.
                      </p>
                    </div>
                    
                    <Form {...vendorForm}>
                      <form onSubmit={vendorForm.handleSubmit(onSubmitVendor, () => showFormErrors(vendorForm))} className="space-y-8">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Company Information</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={vendorForm.control}
                              name="companyName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Company Name *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your company name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={vendorForm.control}
                              name="contactName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Contact Name *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Full name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={vendorForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email *</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="your@email.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={vendorForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="(xxx) xxx-xxxx" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={vendorForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Street address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={vendorForm.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="City" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={vendorForm.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="State" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={vendorForm.control}
                              name="zip"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>ZIP Code *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="ZIP code" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={vendorForm.control}
                            name="website"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://www.example.com" {...field} />
                                </FormControl>
                                <FormDescription>Optional</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Product/Supply Information</h3>
                          
                          <FormField
                            control={vendorForm.control}
                            name="supplyTypes"
                            render={() => (
                              <FormItem>
                                <FormLabel>Product/Supply Types *</FormLabel>
                                <FormDescription>
                                  Select all products or supplies that you provide
                                </FormDescription>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                  {SUPPLY_TYPES.map((type) => (
                                    <Button
                                      type="button"
                                      key={type}
                                      variant={selectedSupplyTypes.includes(type) ? "default" : "outline"}
                                      className="justify-start h-auto py-2 px-3 text-left"
                                      onClick={() => handleSupplyTypeSelect(type)}
                                    >
                                      {type}
                                    </Button>
                                  ))}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {selectedSupplyTypes.map((type) => (
                                    <Badge key={type} variant="secondary" className="pl-2 pr-1 py-1.5">
                                      {type}
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-0 ml-1"
                                        onClick={() => handleSupplyTypeSelect(type)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </Badge>
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={vendorForm.control}
                            name="serviceDescription"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product/Service Description *</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe your products/supplies, pricing structure, lead times, etc..." 
                                    className="min-h-32" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={vendorForm.control}
                            name="yearsInBusiness"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Years in Business *</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select years in business" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {YEARS_IN_BUSINESS_OPTIONS.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={vendorForm.control}
                            name="references"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>References</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="List any relevant references..." 
                                    className="min-h-24" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormDescription>Optional</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={vendorForm.control}
                            name="howDidYouHear"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>How Did You Hear About Us?</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select option" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {HOW_DID_YOU_HEAR_OPTIONS.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormDescription>Optional</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full md:w-auto md:min-w-32"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            'Submit Application'
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubcontractorVendorRegistration;