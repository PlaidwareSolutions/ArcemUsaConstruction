import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Testimonial } from '@shared/schema';

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoplaySpeed?: number;
}

const TestimonialCarousel = ({ 
  testimonials, 
  autoplaySpeed = 5000 
}: TestimonialCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Animation directions
  type Direction = 'left' | 'right' | 'up' | 'down' | 'fade';
  const directions: Direction[] = ['left', 'right', 'up', 'down', 'fade'];
  const [transitionDirection, setTransitionDirection] = useState<Direction>('fade');

  // Get random direction for next transition
  const getRandomDirection = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * directions.length);
    return directions[randomIndex];
  }, []);

  // Handle navigation
  const goToNext = useCallback(() => {
    if (isTransitioning || testimonials.length <= 1) return;
    
    setIsTransitioning(true);
    setTransitionDirection(getRandomDirection());
    
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    }, 500);
  }, [currentIndex, isTransitioning, testimonials.length, getRandomDirection]);

  const goToPrevious = useCallback(() => {
    if (isTransitioning || testimonials.length <= 1) return;
    
    setIsTransitioning(true);
    setTransitionDirection(getRandomDirection());
    
    setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
      );
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    }, 500);
  }, [currentIndex, isTransitioning, testimonials.length, getRandomDirection]);

  // Set up autoplay
  useEffect(() => {
    if (isPaused || testimonials.length <= 1) return;
    
    const interval = setInterval(() => {
      goToNext();
    }, autoplaySpeed);
    
    return () => clearInterval(interval);
  }, [goToNext, autoplaySpeed, isPaused, testimonials.length]);

  // If no testimonials, don't render anything
  if (!testimonials || testimonials.length === 0) return null;

  const currentTestimonial = testimonials[currentIndex];

  // Define animation classes based on transition direction
  const getAnimationClasses = (entering: boolean) => {
    if (entering) {
      // Entering animations
      switch (transitionDirection) {
        case 'left': return 'animate-slide-in-right';
        case 'right': return 'animate-slide-in-left';
        case 'up': return 'animate-slide-in-down';
        case 'down': return 'animate-slide-in-up';
        case 'fade': return 'animate-fade-in';
        default: return 'animate-fade-in';
      }
    } else {
      // Exiting animations
      switch (transitionDirection) {
        case 'left': return 'animate-slide-out-left';
        case 'right': return 'animate-slide-out-right';
        case 'up': return 'animate-slide-out-up';
        case 'down': return 'animate-slide-out-down';
        case 'fade': return 'animate-fade-out';
        default: return 'animate-fade-out';
      }
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div 
      className="relative overflow-hidden bg-opacity-80 rounded-lg shadow-xl w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Quote icon */}
      <div className="absolute top-6 left-6 text-[#1E90DB] opacity-20">
        <Quote size={60} />
      </div>

      <div className="p-8 md:p-12 relative">
        {/* Testimonial Content */}
        <div className="min-h-[300px] flex flex-col items-center justify-center relative">
          <div 
            key={currentTestimonial.id}
            className={cn(
              "text-center w-full absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000",
              isTransitioning ? getAnimationClasses(false) : getAnimationClasses(true)
            )}
          >
            <Avatar className="w-24 h-24 border-4 border-[#1E90DB] mb-6 shadow-lg">
              {currentTestimonial.image ? (
                <AvatarImage src={currentTestimonial.image} alt={currentTestimonial.name} />
              ) : (
                <AvatarFallback className="bg-[#262626] text-white text-2xl">
                  {getInitials(currentTestimonial.name)}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={cn(
                      "w-5 h-5 mx-0.5",
                      i < currentTestimonial.rating 
                        ? "text-[#1E90DB] fill-[#1E90DB]" 
                        : "text-gray-300"
                    )} 
                  />
                ))}
              </div>
              
              <p className="text-lg md:text-xl font-light mb-6 italic text-gray-100">
                "{currentTestimonial.content}"
              </p>
              
              <div>
                <h4 className="text-xl font-bold text-white">{currentTestimonial.name}</h4>
                <p className="text-[#1E90DB]">
                  {currentTestimonial.position}
                  {currentTestimonial.company && ` at ${currentTestimonial.company}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        {testimonials.length > 1 && (
          <div className="flex justify-between mt-6">
            <Button 
              onClick={goToPrevious} 
              disabled={isTransitioning}
              className="bg-[#21201F]/50 hover:bg-[#1E90DB] text-white w-12 h-12 rounded-full p-0 transition-all duration-300"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            
            <div className="flex space-x-2 items-center">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (isTransitioning) return;
                    setIsTransitioning(true);
                    setTransitionDirection(getRandomDirection());
                    
                    setTimeout(() => {
                      setCurrentIndex(index);
                      setTimeout(() => {
                        setIsTransitioning(false);
                      }, 500);
                    }, 500);
                  }}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-300",
                    index === currentIndex 
                      ? "bg-[#1E90DB] scale-110" 
                      : "bg-gray-400 opacity-50 hover:opacity-75"
                  )}
                  aria-label={`Go to testimonial ${index + 1}`}
                ></button>
              ))}
            </div>
            
            <Button 
              onClick={goToNext} 
              disabled={isTransitioning}
              className="bg-[#21201F]/50 hover:bg-[#1E90DB] text-white w-12 h-12 rounded-full p-0 transition-all duration-300"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialCarousel;