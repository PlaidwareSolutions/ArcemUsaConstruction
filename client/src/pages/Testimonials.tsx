import { useEffect } from 'react';
import TestimonialForm from '@/components/common/TestimonialForm';
import TestimonialCard from '@/components/common/TestimonialCard';
import PageBanner from '@/components/common/PageBanner';
import { scrollToTop } from '@/lib/utils';
import { useTestimonials } from '@/hooks/useTestimonials';
import { Loader2 } from 'lucide-react';
import { Testimonial } from '@shared/schema';

const Testimonials = () => {
  const { testimonials: testimonialsData, isLoadingTestimonials } = useTestimonials();
  const testimonials: Testimonial[] = Array.isArray(testimonialsData) ? testimonialsData : [];

  useEffect(() => {
    scrollToTop();
    document.title = 'Testimonials - ARCEM Construction';
  }, []);

  return (
    <div>
      <PageBanner
        title="Client Testimonials"
        description="Hear what our clients have to say about working with ARCEM Construction."
        backgroundImage="/images/testimonials-banner.jpg"
      />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold mb-8">What Our Clients Say</h2>
              
              {isLoadingTestimonials ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : testimonials.length === 0 ? (
                <div className="bg-secondary/5 rounded-lg p-8 text-center">
                  <h3 className="text-xl font-medium mb-2">No Testimonials Yet</h3>
                  <p className="text-muted-foreground">
                    Be the first to share your experience with ARCEM Construction.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {testimonials.map((testimonial) => (
                    <TestimonialCard
                      key={testimonial.id}
                      name={testimonial.name}
                      position={testimonial.position || 'Client'}
                      company={testimonial.company || 'Happy Customer'}
                      content={testimonial.content}
                      rating={testimonial.rating}
                      image={testimonial.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=random`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <TestimonialForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Testimonials;