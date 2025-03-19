import { useEffect, useState } from "react";

interface ImageSliderProps {
  className?: string;
}

interface ClientLogo {
  src: string;
  alt: string;
}

const ImageSlider = ({ className = "" }: ImageSliderProps) => {
  const [clientLogos, setClientLogos] = useState<ClientLogo[]>([]);

  useEffect(() => {
    // Client logos for the slider
    const logos: ClientLogo[] = [
      { src: "/uploads/client-logos/Metro-by-T-Mobile.jpg", alt: "Shell logo" },
      { src: "/uploads/client-logos/rocknrollit-logo.png", alt: "Shell logo" },
      { src: "/uploads/client-logos/pitstopexpress.jpg", alt: "Shell logo" },
      { src: "/uploads/client-logos/chevron.png", alt: "Chevron logo" },
      { src: "/uploads/client-logos/dairy-queen.png", alt: "Dairy Queen logo" },
      { src: "/uploads/client-logos/hilton.png", alt: "Hilton Garden logo" },
      { src: "/uploads/client-logos/little-caesars.png", alt: "Little Caesars logo"},
      { src: "/uploads/client-logos/shell.png", alt: "Shell logo" },
    ];

    setClientLogos(logos);
  }, []);

  if (clientLogos.length === 0) {
    return null;
  }

  return (
    <div className={`image-slider-container ${className}`}>
      <div className="slider-track flex items-center">
        {/* First set of client logos */}
        {clientLogos.map((logo, index) => (
          <div
            key={`logo-${index}`}
            className="slider-item flex-shrink-0 min-w-[180px] sm:min-w-[220px] md:min-w-[250px] h-16 mx-4 flex items-center justify-center rounded-md px-4"
          >
            <img
              src={logo.src}
              alt={logo.alt}
              className="max-h-14 max-w-full object-contain"
              loading="lazy"
            />
          </div>
        ))}

        {/* Duplicate the logos for continuous scroll effect */}
        {clientLogos.map((logo, index) => (
          <div
            key={`logo-dup-${index}`}
            className="slider-item flex-shrink-0 min-w-[180px] sm:min-w-[220px] md:min-w-[250px] h-16 mx-4 flex items-center justify-center rounded-md px-4"
          >
            <img
              src={logo.src}
              alt={logo.alt}
              className="max-h-14 max-w-full object-contain"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
