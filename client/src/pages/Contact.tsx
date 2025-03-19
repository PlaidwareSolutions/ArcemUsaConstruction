import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { initializeRevealEffects, scrollToTop } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { MapPin, Phone, Mail, Facebook, Github, Instagram, Linkedin } from 'lucide-react';
import { InsertMessage, insertMessageSchema } from '@shared/schema';
import { motion } from 'framer-motion';

const Contact = () => {
  const { toast } = useToast();
  
  useEffect(() => {
    scrollToTop();
    document.title = 'Contact Us - ARCEM';
    const cleanup = initializeRevealEffects();
    return cleanup;
  }, []);
  
  const form = useForm<InsertMessage>({
    resolver: zodResolver(insertMessageSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      service: '',
      message: ''
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: InsertMessage) => {
      return apiRequest('POST', '/api/contact', data);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully. We'll get back to you soon.",
        variant: "default"
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      console.error("Error sending message:", error);
    }
  });

  const onSubmit = (data: InsertMessage) => {
    contactMutation.mutate(data);
  };

  return (
    <>
      {/* Page Banner */}
      <div 
        className="relative h-[350px] flex items-center justify-center" 
        style={{
          backgroundImage: "url('/uploads/images/contact/office-desk.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <motion.div 
          className="container relative z-10 px-4 md:px-8 text-white py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-6">Contact Us</h1>
          <p className="text-lg max-w-3xl">
            Get in touch with our team to discuss your construction needs and how we can help bring your vision to life.
          </p>
        </motion.div>
      </div>

      {/* Contact Form Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="reveal">
              <h2 className="text-sm font-montserrat text-[#1E90DB] mb-4">GET IN TOUCH</h2>
              <h3 className="text-3xl md:text-4xl font-montserrat font-bold mb-6">Contact Information</h3>
              <p className="mb-8 leading-relaxed text-gray-600">
                Contact us today to discuss your construction needs. Our team is ready to bring your vision to life with expertise, quality craftsmanship, and dedication to excellence.
              </p>
              
              <div className="flex items-start mb-6">
                <div className="text-[#1E90DB] mr-4 mt-1">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-montserrat font-bold mb-2">Our Location</h4>
                  <p className="text-gray-600">215 Birch Hill Dr, </p>
                  <p className="text-gray-600">Sugar Land, TX 77479</p>
                </div>
              </div>
              
              <div className="flex items-start mb-6">
                <div className="text-[#1E90DB] mr-4 mt-1">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-montserrat font-bold mb-2">Phone Numbers</h4>
                  <p className="text-gray-600">Cell: (713) 624-0083</p>
                  <p className="text-gray-600">Office: (713) 624-0313</p>
                </div>
              </div>
              
              <div className="flex items-start mb-8">
                <div className="text-[#1E90DB] mr-4 mt-1">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-montserrat font-bold mb-2">Email Addresses</h4>
                  <p className="text-gray-600">aj@arcemusa.com</p>
                  <p className="text-gray-600">admin@arcemusa.com</p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-[#1E90DB] transition-colors" aria-label="Facebook">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-[#1E90DB] transition-colors" aria-label="GitHub">
                  <Github className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-[#1E90DB] transition-colors" aria-label="Instagram">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-[#1E90DB] transition-colors" aria-label="LinkedIn">
                  <Linkedin className="w-6 h-6" />
                </a>
              </div>

              {/* Office Hours */}
              <div className="mt-12 p-6 bg-gray-100 rounded-lg shadow-sm">
                <h4 className="font-montserrat font-bold mb-4">Office Hours</h4>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span>8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span>9:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span>Closed</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="reveal">
              <h2 className="text-3xl font-montserrat font-bold mb-6">Send Us a Message</h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-montserrat">Your Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="px-4 py-3 border border-gray-300 focus:border-[#1E90DB] outline-none transition-colors rounded-md"
                              required
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-montserrat">Email Address</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              className="px-4 py-3 border border-gray-300 focus:border-[#1E90DB] outline-none transition-colors rounded-md"
                              required
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-montserrat">Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            value={field.value || ''} // Ensure value is never null or undefined
                            className="px-4 py-3 border border-gray-300 focus:border-[#1E90DB] outline-none transition-colors rounded-md"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="service"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-montserrat">Service Interested In</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                          <FormControl>
                            <SelectTrigger className="px-4 py-3 border border-gray-300 focus:border-[#1E90DB] outline-none transition-colors rounded-md">
                              <SelectValue placeholder="Select a service" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="commercial">Commercial Construction</SelectItem>
                            <SelectItem value="residential">Residential Construction</SelectItem>
                            <SelectItem value="renovation">Renovation & Remodeling</SelectItem>
                            <SelectItem value="planning">Project Planning & Design</SelectItem>
                            <SelectItem value="industrial">Industrial Construction</SelectItem>
                            <SelectItem value="management">Construction Management</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-montserrat">Your Message</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={5}
                            className="px-4 py-3 border border-gray-300 focus:border-[#1E90DB] outline-none transition-colors rounded-md"
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    variant="blue"
                    className="rounded-md"
                    disabled={contactMutation.isPending}
                  >
                    {contactMutation.isPending ? 'SENDING...' : 'SEND MESSAGE'}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-gray-100 py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12 reveal">
            <h2 className="text-3xl font-montserrat font-bold mb-4">Find Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Visit our office to meet our team and discuss your project in person.
            </p>
          </div>
          
          <div className="reveal h-96 bg-gray-300 w-full rounded-lg overflow-hidden shadow-md">
            {/* In a real implementation, this would be a Google Map */}
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <p className="text-gray-500">Map would be displayed here</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
