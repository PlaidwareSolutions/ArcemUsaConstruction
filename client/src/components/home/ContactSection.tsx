import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { initializeRevealEffects } from '@/lib/utils';
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

const ContactSection = () => {
  const { toast } = useToast();
  
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
        description: "Your message has been sent successfully.",
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

  useEffect(() => {
    const cleanup = initializeRevealEffects();
    return cleanup;
  }, []);

  return (
    <section id="contact" className="py-20 md:py-32 bg-black text-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="reveal">
            <h2 className="text-sm font-montserrat text-[#1E90DB] mb-4">REACH US</h2>
            <h3 className="text-3xl md:text-4xl font-montserrat font-bold mb-6">Ready to Start Your Project?</h3>
            <p className="mb-8 leading-relaxed">
              Contact us today to discuss your construction needs. Our team is ready to bring your vision to life with expertise, quality craftsmanship, and dedication to excellence.
            </p>
            
            <div className="flex items-start mb-6">
              <div className="text-[#1E90DB] mr-4 mt-1">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-montserrat font-bold mb-2">Our Location</h4>
                <p>215 Birch Hill Dr </p>
                <p>Sugar Land, TX 77479</p>
              </div>
            </div>
            
            <div className="flex items-start mb-6">
              <div className="text-[#1E90DB] mr-4 mt-1">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-montserrat font-bold mb-2">Phone Numbers</h4>
                <p>Cell: (713) 624-0083</p>
                <p>Office: (713) 624-0313</p>
              </div>
            </div>
            
            <div className="flex items-start mb-8">
              <div className="text-[#1E90DB] mr-4 mt-1">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-montserrat font-bold mb-2">Email Addresses</h4>
                <p>aj@arcemusa.com</p>
                <p>admin@arcemusa.com</p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-[#1E90DB] transition-colors" aria-label="Facebook">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-white hover:text-[#1E90DB] transition-colors" aria-label="GitHub">
                <Github className="w-6 h-6" />
              </a>
              <a href="#" className="text-white hover:text-[#1E90DB] transition-colors" aria-label="Instagram">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-white hover:text-[#1E90DB] transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          <div className="reveal">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-montserrat">Your Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="px-4 py-3 bg-gray-800 border border-gray-700 focus:border-[#1E90DB] outline-none transition-colors text-white"
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
                        <FormLabel className="text-sm font-montserrat">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            className="px-4 py-3 bg-gray-800 border border-gray-700 focus:border-[#1E90DB] outline-none transition-colors text-white"
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
                      <FormLabel className="text-sm font-montserrat">Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          value={field.value || ''} // Ensure value is never null or undefined
                          className="px-4 py-3 bg-gray-800 border border-gray-700 focus:border-[#1E90DB] outline-none transition-colors text-white"
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
                      <FormLabel className="text-sm font-montserrat">Service Interested In</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="px-4 py-3 bg-gray-800 border border-gray-700 focus:border-[#1E90DB] outline-none transition-colors text-white">
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
                      <FormLabel className="text-sm font-montserrat">Your Message</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={5}
                          className="px-4 py-3 bg-gray-800 border border-gray-700 focus:border-[#1E90DB] outline-none transition-colors text-white"
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  variant="gold"
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
  );
};

export default ContactSection;
