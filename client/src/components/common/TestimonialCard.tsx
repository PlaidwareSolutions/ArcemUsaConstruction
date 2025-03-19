import React from "react";
import { Star, StarHalf } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  name: string;
  position: string;
  company: string;
  content: string;
  rating: number;
  image: string; // We already handle null values in the parent component
}

const TestimonialCard = ({ name, position, company, content, rating, image }: TestimonialCardProps) => {
  // Generate star rating display
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star 
          key={`star-${i}`} 
          className="h-4 w-4 fill-[#1E90DB] text-[#1E90DB]" 
          aria-hidden="true"
        />
      );
    }

    // Add half star if necessary
    if (hasHalfStar) {
      stars.push(
        <StarHalf 
          key="half-star" 
          className="h-4 w-4 fill-[#1E90DB] text-[#1E90DB]" 
          aria-hidden="true"
        />
      );
    }

    // Add empty stars to make 5 total
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star 
          key={`empty-${i}`} 
          className="h-4 w-4 text-[#1E90DB]" 
          aria-hidden="true"
        />
      );
    }

    return stars;
  };

  return (
    <Card className="h-full bg-primary/5 hover:bg-primary/10 transition-colors border-none">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex flex-row items-center mb-4">
          <Avatar className="h-12 w-12 mr-4 border border-primary/20">
            <AvatarImage src={image} alt={name} />
            <AvatarFallback>
              {name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-lg">{name}</h3>
            <p className="text-sm text-muted-foreground">
              {position}, {company}
            </p>
          </div>
        </div>
        
        <div className="flex mb-4" aria-label={`Rating: ${rating} out of 5 stars`}>
          <span className="sr-only">{rating} out of 5 stars</span>
          {renderStars()}
        </div>
        
        <p className="text-sm flex-grow italic">"{content}"</p>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;