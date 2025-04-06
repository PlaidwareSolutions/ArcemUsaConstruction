import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuoteRequest } from "@/hooks/useQuoteRequest";
import { Loader2 } from "lucide-react";
import UploadThingFileUpload from "./UploadThingFileUpload";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

// Interface for file attachments
interface FileAttachment {
  fileName: string;
  fileUrl: string;
  fileKey: string;
  fileSize: number;
  fileType: string;
}

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(1, "Phone number is required"),
  company: z.string().optional(),
  projectType: z.string().min(1, "Please select a project type"),
  projectSize: z.string().optional(),
  budget: z.string().optional(),
  timeframe: z.string().optional(),
  description: z.string().min(10, "Please provide at least a brief description of your project")
});

type FormValues = z.infer<typeof formSchema>;

interface QuoteRequestFormProps {
  className?: string;
  onSuccess?: () => void;
}

const QuoteRequestForm = ({ className = "", onSuccess }: QuoteRequestFormProps) => {
  const { submitQuoteRequest, quoteRequestMutation } = useQuoteRequest();
  const [fileAttachments, setFileAttachments] = useState<FileAttachment[]>([]);
  
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      projectType: "",
      projectSize: "",
      budget: "",
      timeframe: "",
      description: ""
    }
  });

  // Submit handler
  const onSubmit = (data: FormValues) => {
    // Include the file attachments with the form data and map form fields to match backend schema
    const requestData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      projectType: data.projectType,
      projectSize: data.projectSize,
      budget: data.budget,
      timeframe: data.timeframe,
      description: data.description,
      attachments: fileAttachments
    };
    
    submitQuoteRequest(requestData);
  };
  
  // Reset form on successful submission
  useEffect(() => {
    if (quoteRequestMutation.isSuccess) {
      form.reset();
      setFileAttachments([]); // Clear the attachments
      if (onSuccess) onSuccess();
    }
  }, [quoteRequestMutation.isSuccess, form, onSuccess]);
  
  // Handle file upload completion
  const handleFileUploadComplete = (files: FileAttachment[]) => {
    setFileAttachments(files);
  };

  return (
    <div className={`quote-request-form ${className} bg-white p-6 rounded-lg shadow-md border border-gray-100`}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Full Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="John Doe" 
                      className="border-gray-300 focus:border-[#1E90DB] focus:ring-[#1E90DB] text-gray-800"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Email Address *</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="email@example.com"
                      className="border-gray-300 focus:border-[#1E90DB] focus:ring-[#1E90DB] text-gray-800"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Phone Field */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Phone Number *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(123) 456-7890"
                      className="border-gray-300 focus:border-[#1E90DB] focus:ring-[#1E90DB] text-gray-800"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Company Field */}
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Company</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Company Name"
                      className="border-gray-300 focus:border-[#1E90DB] focus:ring-[#1E90DB] text-gray-800"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Type Field */}
            <FormField
              control={form.control}
              name="projectType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Project Type *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-[#1E90DB] focus:ring-[#1E90DB] text-gray-800">
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="commercial">Commercial Construction</SelectItem>
                      <SelectItem value="residential">Residential Construction</SelectItem>
                      <SelectItem value="renovation">Renovation</SelectItem>
                      <SelectItem value="industrial">Industrial Construction</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Project Size Field */}
            <FormField
              control={form.control}
              name="projectSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Project Size</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-[#1E90DB] focus:ring-[#1E90DB] text-gray-800">
                        <SelectValue placeholder="Select project size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="small">Small (Under 1,000 sq ft)</SelectItem>
                      <SelectItem value="medium">Medium (1,000 - 5,000 sq ft)</SelectItem>
                      <SelectItem value="large">Large (5,000 - 20,000 sq ft)</SelectItem>
                      <SelectItem value="xlarge">X-Large (Over 20,000 sq ft)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Budget Field */}
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Budget Range</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-[#1E90DB] focus:ring-[#1E90DB] text-gray-800">
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="under50k">Under $50,000</SelectItem>
                      <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                      <SelectItem value="100k-250k">$100,000 - $250,000</SelectItem>
                      <SelectItem value="250k-500k">$250,000 - $500,000</SelectItem>
                      <SelectItem value="500k-1m">$500,000 - $1 million</SelectItem>
                      <SelectItem value="over1m">Over $1 million</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Timeframe Field */}
            <FormField
              control={form.control}
              name="timeframe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Timeframe</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-[#1E90DB] focus:ring-[#1E90DB] text-gray-800">
                        <SelectValue placeholder="Select timeframe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate (1-3 months)</SelectItem>
                      <SelectItem value="soon">Soon (3-6 months)</SelectItem>
                      <SelectItem value="planning">Planning Phase (6-12 months)</SelectItem>
                      <SelectItem value="future">Future Project (Over 12 months)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Project Description Field */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Project Description *</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Please provide details about your project, requirements, and any specific needs."
                    className="min-h-[120px] border-gray-300 focus:border-[#1E90DB] focus:ring-[#1E90DB] text-gray-800"
                    {...field} 
                  />
                </FormControl>
                <FormDescription className="text-gray-600 text-sm italic">
                  Include as much detail as possible to help us provide an accurate quote.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* File Attachments Section */}
          <div className="space-y-2">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="attachments">
                <AccordionTrigger className="text-gray-700 font-medium py-2">
                  Attach Supporting Documents
                </AccordionTrigger>
                <AccordionContent>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-gray-600">
                      Upload up to 3 files (images or PDF documents) to help us better understand your project.
                    </p>
                    
                    <UploadThingFileUpload 
                      onUploadComplete={handleFileUploadComplete}
                      uploadType="quoteDocumentUploader"
                      maxFiles={3}
                      maxFileSize={8} // 8MB max file size
                      allowedFileTypes={['image/jpeg', 'image/png', 'image/webp', 'application/pdf']}
                    />
                    
                    {fileAttachments.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Attached Files ({fileAttachments.length})
                        </p>
                        <div className="bg-gray-50 p-2 rounded">
                          {fileAttachments.map((file, index) => (
                            <div key={index} className="text-sm text-gray-600 py-1">
                              ✓ {file.fileName} ({(file.fileSize / (1024 * 1024)).toFixed(2)} MB)
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          <Separator className="my-2" />
          
          <Button 
            type="submit" 
            className="w-full md:w-auto bg-[#1E90DB] hover:bg-[#1670B0] text-white font-semibold"
            disabled={quoteRequestMutation.isPending}
          >
            {quoteRequestMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "REQUEST A QUOTE"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default QuoteRequestForm;