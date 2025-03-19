import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNewsletter } from "@/hooks/useNewsletter";
import { Mail } from "lucide-react";

// Form validation schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface NewsletterSubscriptionProps {
  // Only include email by default, but allow for extended form
  extendedForm?: boolean;
  className?: string;
}

const NewsletterSubscription = ({ extendedForm = false, className = "" }: NewsletterSubscriptionProps) => {
  const { subscribe, subscriptionMutation } = useNewsletter();
  
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: ""
    }
  });

  // Submit handler
  const onSubmit = (data: FormValues) => {
    subscriptionMutation.mutate(data, {
      onSuccess: () => {
        form.reset();
      }
    });
  };

  return (
    <div className={`newsletter-subscription ${className} p-4 rounded-lg bg-primary-50 dark:bg-gray-800`}>
      {!className.includes("bg-transparent") && (
        <div className="mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Stay Updated
          </h3>
          <p className="text-sm text-muted-foreground">
            Subscribe to our newsletter for the latest construction news and updates.
          </p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          {extendedForm && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="First Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Last Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input 
                      placeholder="Your Email" 
                      type="email" 
                      {...field}
                      className={className.includes("text-white") ? 
                        "bg-gray-800 border-gray-700 focus:border-[#1E90DB] text-white" : ""}
                    />
                  </FormControl>
                  <FormMessage className={className.includes("text-white") ? "text-red-300" : ""} />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className={`whitespace-nowrap ${className.includes("text-white") ? 
                "bg-[#1E90DB] hover:bg-[#1670B0] text-sm px-4 py-2" : ""}`}
              disabled={subscriptionMutation.isPending}
            >
              {subscriptionMutation.isPending ? "Subscribing..." : "SUBSCRIBE"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewsletterSubscription;