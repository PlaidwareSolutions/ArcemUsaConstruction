import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { InsertSubcontractor, InsertVendor } from '@shared/schema';

interface SubmissionResult {
  success: boolean;
  message?: string;
  data?: any;
}

export const useApplicationSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitSubcontractorApplication = async (
    data: InsertSubcontractor
  ): Promise<SubmissionResult> => {
    setIsSubmitting(true);

    try {
      // Input validation
      if (!data) {
        throw new Error('No application data provided');
      }

      // Required fields check
      const requiredFields = [
        'companyName',
        'contactName',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'zip',
        'serviceTypes',
        'serviceDescription',
        'yearsInBusiness',
      ];

      const missingFields = requiredFields.filter(
        (field) => !data[field as keyof InsertSubcontractor]
      );

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Array validation
      if (!Array.isArray(data.serviceTypes) || data.serviceTypes.length === 0) {
        throw new Error('Please select at least one service type');
      }

      // Prepare clean data for submission
      const formattedData = {
        ...data,
        // Trim string fields
        companyName: data.companyName.trim(),
        contactName: data.contactName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        zip: data.zip.trim(),
        website: data.website || undefined,
        serviceDescription: data.serviceDescription.trim(),
        licenses: data.licenses || '',
        references: data.references || '',
        howDidYouHear: data.howDidYouHear || '',
      };

      // Make the API request
      const response = await apiRequest(
        'POST',
        '/api/subcontractors/apply',
        formattedData
      );

      // Handle API response
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Server error: ${response.status}`
        );
      }

      const responseData = await response.json();

      // Show success notification
      toast({
        title: 'Application Submitted Successfully',
        description:
          'Thank you for your interest in working with ARCEM. We will review your application and contact you soon.',
      });

      return {
        success: true,
        data: responseData,
      };
    } catch (error) {
      console.error('Error submitting subcontractor application:', error);

      // Error notification
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'There was a problem submitting your application. Please try again.';

      toast({
        title: 'Submission Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitVendorApplication = async (
    data: InsertVendor
  ): Promise<SubmissionResult> => {
    setIsSubmitting(true);

    try {
      // Input validation
      if (!data) {
        throw new Error('No application data provided');
      }

      // Required fields check
      const requiredFields = [
        'companyName',
        'contactName',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'zip',
        'supplyTypes',
        'serviceDescription',
        'yearsInBusiness',
      ];

      const missingFields = requiredFields.filter(
        (field) => !data[field as keyof InsertVendor]
      );

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Array validation
      if (!Array.isArray(data.supplyTypes) || data.supplyTypes.length === 0) {
        throw new Error('Please select at least one product/supply type');
      }

      // Prepare clean data for submission
      const formattedData = {
        ...data,
        // Trim string fields
        companyName: data.companyName.trim(),
        contactName: data.contactName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        zip: data.zip.trim(),
        website: data.website || undefined,
        serviceDescription: data.serviceDescription.trim(),
        references: data.references || '',
        howDidYouHear: data.howDidYouHear || '',
      };

      // Make the API request
      const response = await apiRequest(
        'POST',
        '/api/vendors/apply',
        formattedData
      );

      // Handle API response
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Server error: ${response.status}`
        );
      }

      const responseData = await response.json();

      // Show success notification
      toast({
        title: 'Application Submitted Successfully',
        description:
          'Thank you for your interest in working with ARCEM. We will review your application and contact you soon.',
      });

      return {
        success: true,
        data: responseData,
      };
    } catch (error) {
      console.error('Error submitting vendor application:', error);

      // Error notification
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'There was a problem submitting your application. Please try again.';

      toast({
        title: 'Submission Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitSubcontractorApplication,
    submitVendorApplication,
  };
};