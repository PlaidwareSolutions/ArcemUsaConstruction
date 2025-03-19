import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { scrollToTop, cn, initializeRevealEffects } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { X, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useSubcontractors } from "@/hooks/useSubcontractors";

// Form schema with comprehensive validations
const formSchema = z.object({
  companyName: z
    .string()
    .min(2, {
      message:
        "Company name is required and must be at least 2 characters long",
    })
    .max(100, { message: "Company name must be less than 100 characters" }),

  contactName: z
    .string()
    .min(2, {
      message:
        "Contact name is required and must be at least 2 characters long",
    })
    .max(100, { message: "Contact name must be less than 100 characters" }),

  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .min(5, { message: "Email is required" })
    .max(100, { message: "Email must be less than 100 characters" }),

  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(20, { message: "Phone number must be less than 20 characters" })
    .refine((val) => /^[0-9()\-\s+]+$/.test(val), {
      message:
        "Phone number can only contain digits, spaces, and the characters ()+-",
    }),

  address: z
    .string()
    .min(5, {
      message: "Address is required and must be at least 5 characters long",
    })
    .max(200, { message: "Address must be less than 200 characters" }),

  city: z
    .string()
    .min(2, {
      message: "City is required and must be at least 2 characters long",
    })
    .max(100, { message: "City must be less than 100 characters" }),

  state: z
    .string()
    .min(2, {
      message: "State is required and must be at least 2 characters long",
    })
    .max(50, { message: "State must be less than 50 characters" }),

  zip: z
    .string()
    .min(5, {
      message: "ZIP code is required and must be at least 5 characters",
    })
    .max(15, { message: "ZIP code must be less than 15 characters" })
    .refine((val) => /^[0-9\-\s]+$/.test(val), {
      message: "ZIP code can only contain digits, hyphens, and spaces",
    }),

  website: z
    .string()
    .optional()
    .transform((val) =>
      val === undefined || val === null || val === "" ? undefined : val,
    )
    .refine(
      (val) =>
        !val ||
        /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(val),
      {
        message: "Please enter a valid website URL (e.g., https://example.com)",
      },
    ),

  serviceTypes: z
    .array(z.string())
    .min(1, { message: "Please select at least one service type" }),

  supplyTypes: z
    .array(z.string())
    .min(1, { message: "Please select at least one product/supply type" }),

  serviceDescription: z
    .string()
    .min(10, {
      message:
        "Please provide a description of your services (minimum 10 characters)",
    })
    .max(2000, { message: "Description must be less than 2000 characters" }),

  yearsInBusiness: z
    .string()
    .min(1, { message: "Please select years in business" }),

  insurance: z.boolean().default(false),
  bondable: z.boolean().default(false),

  licenses: z
    .string()
    .optional()
    .transform((val) => (val === undefined || val === null ? "" : val)),

  references: z
    .string()
    .optional()
    .transform((val) => (val === undefined || val === null ? "" : val)),

  howDidYouHear: z
    .string()
    .optional()
    .transform((val) => (val === undefined || val === null ? "" : val)),
});

type FormValues = z.infer<typeof formSchema>;

const Subcontractors = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("subcontractor");
  const { toast } = useToast();
  const [location] = useLocation();
  const { submitSubcontractorApplication, submitVendorApplication } =
    useSubcontractors();

  // Check for tab parameter in URL
  useEffect(() => {
    // Parse URL query parameters
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");

    // Set active tab if parameter exists and is valid
    if (tabParam === "vendor") {
      setActiveTab("vendor");
    }

    scrollToTop();
    document.title = "Subcontractors & Vendors - ARCEM";
    initializeRevealEffects();
  }, [location]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      website: "",
      serviceTypes: [],
      supplyTypes: [],
      serviceDescription: "",
      yearsInBusiness: "",
      insurance: false,
      bondable: false,
      licenses: "",
      references: "",
      howDidYouHear: "",
    },
  });

  // Show toast for form field errors with better guidance
  const showFormErrors = () => {
    // Get all error messages in a readable format
    const errorMessages = Object.entries(form.formState.errors)
      .map(([field, error]) => `${field}: ${error?.message}`)
      .join("\n");

    // Log for debugging
    console.error("Form validation errors:", form.formState.errors);

    // Show toast with error summary
    toast({
      title: "Please Fix Form Errors",
      description:
        "There are issues with your form submission. Check highlighted fields for details.",
      variant: "destructive",
    });

    // Scroll to the first field with an error
    const firstErrorField = Object.keys(form.formState.errors)[0];
    if (firstErrorField) {
      const errorElement = document.querySelector(
        `[name="${firstErrorField}"]`,
      );
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    return false;
  };

  // Enhanced form submission function
  const onSubmit = async (data: FormValues) => {
    console.log("Form submission started", { data, activeTab });

    // Pre-validation check
    const hasErrors = Object.keys(form.formState.errors).length > 0;
    if (hasErrors) {
      return showFormErrors();
    }

    // Block duplicate submissions
    if (isSubmitting) {
      console.log("Submission already in progress, ignoring duplicate request");
      return false;
    }

    // Start submission process
    setIsSubmitting(true);

    // User feedback - submission started
    toast({
      title: "Submitting Application",
      description: `Your ${activeTab} application is being submitted...`,
    });

    // Progress indicator for better UX
    const progressToastId = setTimeout(() => {
      if (isSubmitting) {
        toast({
          title: "Still Processing",
          description:
            "Your application is still being processed. Please wait...",
        });
      }
    }, 3000);

    try {
      // Prepare submission data based on active tab
      if (activeTab === "subcontractor") {
        // Validate service types array
        if (
          !Array.isArray(data.serviceTypes) ||
          data.serviceTypes.length === 0
        ) {
          form.setError("serviceTypes", {
            type: "manual",
            message: "Please select at least one service type",
          });
          clearTimeout(progressToastId);
          return showFormErrors();
        }

        // Build subcontractor data object with proper handling of optional fields
        const subcontractorData = {
          companyName: data.companyName.trim(),
          contactName: data.contactName.trim(),
          email: data.email.trim(),
          phone: data.phone.trim(),
          address: data.address.trim(),
          city: data.city.trim(),
          state: data.state.trim(),
          zip: data.zip.trim(),
          website: data.website ? data.website.trim() : undefined,
          serviceTypes: data.serviceTypes,
          serviceDescription: data.serviceDescription.trim(),
          yearsInBusiness: data.yearsInBusiness,
          insurance: !!data.insurance,
          bondable: !!data.bondable,
          licenses: data.licenses ? data.licenses.trim() : "",
          references: data.references ? data.references.trim() : "",
          howDidYouHear: data.howDidYouHear ? data.howDidYouHear.trim() : "",
        };

        console.log("Submitting subcontractor application", subcontractorData);

        // Submit with promise handling for proper success/failure states
        await new Promise<void>((resolve, reject) => {
          try {
            submitSubcontractorApplication(subcontractorData);

            // Success case
            toast({
              title: "Application Submitted Successfully",
              description:
                "Thank you for submitting your subcontractor application. We'll review your information and contact you soon.",
              variant: "default",
            });

            // Reset form to initial state
            form.reset({
              companyName: "",
              contactName: "",
              email: "",
              phone: "",
              address: "",
              city: "",
              state: "",
              zip: "",
              website: "",
              serviceTypes: [],
              supplyTypes: [],
              serviceDescription: "",
              yearsInBusiness: "",
              insurance: false,
              bondable: false,
              licenses: "",
              references: "",
              howDidYouHear: "",
            });

            resolve();
          } catch (error) {
            reject(error);
          }
        });
      } else {
        // Vendor tab selected

        // Validate supply types array
        if (!Array.isArray(data.supplyTypes) || data.supplyTypes.length === 0) {
          form.setError("supplyTypes", {
            type: "manual",
            message: "Please select at least one product/supply type",
          });
          clearTimeout(progressToastId);
          return showFormErrors();
        }

        // Build vendor data object with proper handling of optional fields
        const vendorData = {
          companyName: data.companyName.trim(),
          contactName: data.contactName.trim(),
          email: data.email.trim(),
          phone: data.phone.trim(),
          address: data.address.trim(),
          city: data.city.trim(),
          state: data.state.trim(),
          zip: data.zip.trim(),
          website: data.website ? data.website.trim() : undefined,
          supplyTypes: data.supplyTypes,
          serviceDescription: data.serviceDescription.trim(),
          yearsInBusiness: data.yearsInBusiness,
          references: data.references ? data.references.trim() : "",
          howDidYouHear: data.howDidYouHear ? data.howDidYouHear.trim() : "",
        };

        console.log("Submitting vendor application", vendorData);

        // Submit with promise handling for proper success/failure states
        await new Promise<void>((resolve, reject) => {
          try {
            submitVendorApplication(vendorData);

            // Success case
            toast({
              title: "Application Submitted Successfully",
              description:
                "Thank you for submitting your vendor application. We'll review your information and contact you soon.",
              variant: "default",
            });

            // Reset form to initial state
            form.reset({
              companyName: "",
              contactName: "",
              email: "",
              phone: "",
              address: "",
              city: "",
              state: "",
              zip: "",
              website: "",
              serviceTypes: [],
              supplyTypes: [],
              serviceDescription: "",
              yearsInBusiness: "",
              insurance: false,
              bondable: false,
              licenses: "",
              references: "",
              howDidYouHear: "",
            });

            resolve();
          } catch (error) {
            reject(error);
          }
        });
      }

      // Scroll to top after successful submission
      scrollToTop();
    } catch (error) {
      // Comprehensive error handling
      console.error("Error submitting application:", error);
      toast({
        title: "Submission Failed",
        description:
          error instanceof Error
            ? error.message
            : "There was a problem submitting your application. Please try again later.",
        variant: "destructive",
      });
    } finally {
      // Always clean up
      clearTimeout(progressToastId);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div
        className="relative h-[350px] flex items-center justify-center"
        style={{
          backgroundImage: "url('/images/our-passion-led-us-here.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-70"></div>
        <motion.div 
          className="relative z-10 text-center px-4 py-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-white text-5xl md:text-6xl font-montserrat font-bold mb-6">
            Subcontractors & Vendors
          </h1>
          <p className="text-white text-xl md:text-2xl font-light max-w-3xl mx-auto mb-8">
            Partner with ARCEM for construction excellence
          </p>
          <Button size="lg" className="bg-[#1E90DB] hover:bg-[#1670B0] text-lg" onClick={() => {
            const element = document.querySelector('#registration-form');
            if (element) element.scrollIntoView({ behavior: 'smooth' });
          }}>
            Register Now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <Tabs id="registration-form" defaultValue={activeTab} className="mb-12">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="subcontractor"
                  onClick={() => {
                    console.log("Switching to subcontractor tab");
                    setActiveTab("subcontractor");
                    // Clear any previous errors
                    form.clearErrors();
                    // Reset specific fields for subcontractor form
                    form.setValue("serviceTypes", []);
                  }}
                  className="text-lg font-medium"
                >
                  Subcontractor Registration
                </TabsTrigger>
                <TabsTrigger
                  value="vendor"
                  onClick={() => {
                    console.log("Switching to vendor tab");
                    setActiveTab("vendor");
                    // Clear any previous errors
                    form.clearErrors();
                    // Reset specific fields for vendor form
                    form.setValue("supplyTypes", []);
                  }}
                  className="text-lg font-medium"
                >
                  Vendor Registration
                </TabsTrigger>
              </TabsList>
              <TabsContent value="subcontractor" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="mb-8">
                      <h2 className="text-2xl font-montserrat font-bold mb-4">
                        Subcontractor Registration
                      </h2>
                      <p className="text-gray-600">
                        Thank you for your interest in working with ARCEM.
                        Please complete the form below to register as a
                        subcontractor. We will review your information and
                        contact you if there are opportunities that match your
                        services.
                      </p>
                    </div>

                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Name *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Your company name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
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
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="(xxx) xxx-xxxx"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div>
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Street address"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
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
                            control={form.control}
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
                            control={form.control}
                            name="zip"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ZIP Code *</FormLabel>
                                <FormControl>
                                  <Input placeholder="ZIP" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website (optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://www.yourcompany.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="serviceTypes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Type *</FormLabel>
                              <div className="flex flex-col space-y-4">
                                <div className="flex flex-wrap gap-2">
                                  {field.value.map((service) => (
                                    <Badge
                                      key={service}
                                      className="py-1.5 px-2 flex items-center gap-1"
                                    >
                                      {service.charAt(0).toUpperCase() +
                                        service.slice(1)}
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0 hover:bg-transparent"
                                        onClick={() => {
                                          const newValue = field.value.filter(
                                            (s) => s !== service,
                                          );
                                          field.onChange(newValue);
                                        }}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </Badge>
                                  ))}
                                </div>
                                <Select
                                  onValueChange={(value) => {
                                    if (!field.value.includes(value)) {
                                      field.onChange([...field.value, value]);
                                    }
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select service type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="concrete">
                                      Concrete
                                    </SelectItem>
                                    <SelectItem value="carpentry">
                                      Carpentry
                                    </SelectItem>
                                    <SelectItem value="electrical">
                                      Electrical
                                    </SelectItem>
                                    <SelectItem value="plumbing">
                                      Plumbing
                                    </SelectItem>
                                    <SelectItem value="hvac">HVAC</SelectItem>
                                    <SelectItem value="roofing">
                                      Roofing
                                    </SelectItem>
                                    <SelectItem value="drywall">
                                      Drywall
                                    </SelectItem>
                                    <SelectItem value="painting">
                                      Painting
                                    </SelectItem>
                                    <SelectItem value="flooring">
                                      Flooring
                                    </SelectItem>
                                    <SelectItem value="landscaping">
                                      Landscaping
                                    </SelectItem>
                                    <SelectItem value="masonry">
                                      Masonry
                                    </SelectItem>
                                    <SelectItem value="glazing">
                                      Glazing
                                    </SelectItem>
                                    <SelectItem value="steel">
                                      Steel/Metal Work
                                    </SelectItem>
                                    <SelectItem value="other">
                                      Other (Please specify)
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="serviceDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description of Services *</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Please provide details about the services your company offers"
                                  className="min-h-[120px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
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
                                  <SelectItem value="0-1">
                                    Less than 1 year
                                  </SelectItem>
                                  <SelectItem value="1-3">1-3 years</SelectItem>
                                  <SelectItem value="3-5">3-5 years</SelectItem>
                                  <SelectItem value="5-10">
                                    5-10 years
                                  </SelectItem>
                                  <SelectItem value="10+">10+ years</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">
                            Additional Information
                          </h3>

                          <div className="flex items-center space-x-2">
                            <FormField
                              control={form.control}
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
                                    <FormLabel>
                                      We carry general liability and workers'
                                      compensation insurance
                                    </FormLabel>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <FormField
                              control={form.control}
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
                                    <FormLabel>We are bondable</FormLabel>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <FormField
                          control={form.control}
                          name="licenses"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Licenses & Certifications (optional)
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Please list any relevant licenses or certifications"
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="references"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>References (optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Please provide references from past projects"
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="howDidYouHear"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                How did you hear about us? (optional)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Google, Referral, Social Media, etc."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="pt-4">
                          <Button
                            type="submit"
                            className="w-full sm:w-auto bg-[#1E90DB] hover:bg-[#1670B0]"
                            disabled={isSubmitting}
                          >
                            {isSubmitting
                              ? "Submitting..."
                              : "Submit Registration"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vendor" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="mb-8">
                      <h2 className="text-2xl font-montserrat font-bold mb-4">
                        Vendor Registration
                      </h2>
                      <p className="text-gray-600">
                        We're always looking for reliable vendors to join our
                        network. Please complete this form to register as a
                        vendor with ARCEM. We will review your information and
                        contact you regarding potential partnerships.
                      </p>
                    </div>

                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Name *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Your company name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
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
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="(xxx) xxx-xxxx"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div>
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Street address"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
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
                            control={form.control}
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
                            control={form.control}
                            name="zip"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ZIP Code *</FormLabel>
                                <FormControl>
                                  <Input placeholder="ZIP" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website (optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://www.yourcompany.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="supplyTypes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product/Supply Type *</FormLabel>
                              <div className="flex flex-col space-y-4">
                                <div className="flex flex-wrap gap-2">
                                  {field.value.map((supply) => (
                                    <Badge
                                      key={supply}
                                      className="py-1.5 px-2 flex items-center gap-1"
                                    >
                                      {supply
                                        .split("-")
                                        .map(
                                          (word) =>
                                            word.charAt(0).toUpperCase() +
                                            word.slice(1),
                                        )
                                        .join(" ")}
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0 hover:bg-transparent"
                                        onClick={() => {
                                          const newValue = field.value.filter(
                                            (s) => s !== supply,
                                          );
                                          field.onChange(newValue);
                                        }}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </Badge>
                                  ))}
                                </div>
                                <Select
                                  onValueChange={(value) => {
                                    if (!field.value.includes(value)) {
                                      field.onChange([...field.value, value]);
                                    }
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select product/supply type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="building-materials">
                                      Building Materials
                                    </SelectItem>
                                    <SelectItem value="lumber">
                                      Lumber
                                    </SelectItem>
                                    <SelectItem value="electrical">
                                      Electrical Supplies
                                    </SelectItem>
                                    <SelectItem value="plumbing">
                                      Plumbing Supplies
                                    </SelectItem>
                                    <SelectItem value="hvac">
                                      HVAC Equipment
                                    </SelectItem>
                                    <SelectItem value="tools">
                                      Tools & Equipment
                                    </SelectItem>
                                    <SelectItem value="hardware">
                                      Hardware
                                    </SelectItem>
                                    <SelectItem value="concrete">
                                      Concrete & Masonry
                                    </SelectItem>
                                    <SelectItem value="paint">
                                      Paint & Finishes
                                    </SelectItem>
                                    <SelectItem value="flooring">
                                      Flooring Materials
                                    </SelectItem>
                                    <SelectItem value="safety">
                                      Safety Equipment
                                    </SelectItem>
                                    <SelectItem value="other">
                                      Other (Please specify)
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="serviceDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Description of Products/Services *
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Please provide details about the products or services your company offers"
                                  className="min-h-[120px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
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
                                  <SelectItem value="0-1">
                                    Less than 1 year
                                  </SelectItem>
                                  <SelectItem value="1-3">1-3 years</SelectItem>
                                  <SelectItem value="3-5">3-5 years</SelectItem>
                                  <SelectItem value="5-10">
                                    5-10 years
                                  </SelectItem>
                                  <SelectItem value="10+">10+ years</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="references"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Client References (optional)
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Please provide references from past clients or projects"
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="howDidYouHear"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                How did you hear about us? (optional)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Google, Referral, Social Media, etc."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="pt-4">
                          <Button
                            type="submit"
                            className="w-full sm:w-auto bg-[#1E90DB] hover:bg-[#1670B0]"
                            disabled={isSubmitting}
                          >
                            {isSubmitting
                              ? "Submitting..."
                              : "Submit Registration"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#1E90DB] py-12">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-white text-3xl font-montserrat font-bold mb-4">
            Join Our Network Today
          </h2>
          <p className="text-white text-lg mb-0 max-w-3xl mx-auto">
            Become a part of ARCEM's trusted network of subcontractors and
            vendors.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Subcontractors;
