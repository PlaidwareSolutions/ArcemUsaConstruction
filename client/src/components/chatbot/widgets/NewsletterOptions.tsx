import React, { useState } from 'react';
import { useNewsletter } from '@/hooks/useNewsletter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, Check } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type FormValues = z.infer<typeof formSchema>;

const NewsletterOptions = () => {
  const { subscribe } = useNewsletter();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await subscribe({
        email: data.email,
        firstName: "",
        lastName: ""
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
    }
  };

  return (
    <div className="newsletter-options-widget py-2">
      {!isSubmitted ? (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-2">
          <div className="flex flex-col space-y-2">
            <input
              type="email"
              placeholder="Your email address"
              {...register('email')}
              className={`p-2 border rounded-md w-full ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email.message}</p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center bg-[#1E90DB] hover:bg-[#1670B0] text-white p-2 rounded-md transition-colors"
            >
              {isSubmitting ? 'Subscribing...' : (
                <>
                  <span className="mr-1">Subscribe</span>
                  <Send className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-2 flex items-start">
          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
          <div>
            <p className="text-green-800 font-medium">Successfully subscribed!</p>
            <p className="text-green-700 text-sm">Thank you for subscribing to our newsletter.</p>
          </div>
        </div>
      )}
      <div className="mt-4 text-sm text-gray-600">
        <p>By subscribing, you'll receive:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Project updates and case studies</li>
          <li>Industry insights and trends</li>
          <li>Construction tips and best practices</li>
          <li>Special promotions and events</li>
        </ul>
      </div>
    </div>
  );
};

export default NewsletterOptions;