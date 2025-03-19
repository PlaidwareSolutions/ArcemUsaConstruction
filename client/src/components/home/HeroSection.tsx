import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { scrollToElement } from "@/lib/utils";
import ImageSlider from "./ImageSlider";

const HeroSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    // Animate content reveal
    const reveal = document.querySelectorAll(".reveal");
    const timeout = setTimeout(() => {
      reveal.forEach((element) => element.classList.add("active"));
    }, 100);

    // Setup event handlers for user interaction
    const handleUserInteraction = () => {
      if (!userInteracted) {
        console.log("User interaction detected, loading video");
        setUserInteracted(true);
        setShowVideo(true);

        // Try to play the video
        if (videoRef.current) {
          videoRef.current.play().catch((err) => {
            console.error("Video playback failed:", err);
          });
        }

        // Remove event listeners
        document.removeEventListener("mousemove", handleUserInteraction);
        document.removeEventListener("click", handleUserInteraction);
        document.removeEventListener("scroll", handleUserInteraction);
        document.removeEventListener("keydown", handleUserInteraction);
      }
    };

    // Add event listeners
    document.addEventListener("mousemove", handleUserInteraction);
    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("scroll", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);

    return () => {
      clearTimeout(timeout);
      // Clean up event listeners
      document.removeEventListener("mousemove", handleUserInteraction);
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("scroll", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };
  }, [userInteracted]);

  const handleScrollDown = () => {
    scrollToElement("about");
  };

  return (
    <div className="hero-section-container relative h-screen">
      {/* Background media layer */}
      <div className="absolute inset-0 z-0 bg-gray-900 overflow-hidden">
        {/* Static image background (visible initially) */}
        <img
          src="https://images.unsplash.com/photo-1535732759880-bbd5c7265e3f?q=80&w=3764&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"
          alt="ARCEM construction projects showcase"
          className={`w-full h-full object-cover transition-opacity duration-1000 ${showVideo ? "opacity-0" : "opacity-100"}`}
        />

        {/* Video (loads in background, becomes visible after user interaction) */}
        <video
          ref={videoRef}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${showVideo ? "opacity-100" : "opacity-0"}`}
          muted
          loop
          playsInline
          poster="/uploads/hero/heroposter.avif"
          /* poster="https://images.unsplash.com/photo-1535732759880-bbd5c7265e3f?q=80&w=3764&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80" */
aria-label="Construction site timelapse video showing building progress"
        >
          <source
            src="/uploads/hero/herovideo.mp4"
            /* src="https://video.wixstatic.com/video/6331e9_e98391c4a6dc4d85b10501c7aac5caee/1080p/mp4/file.mp4" */
type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Image Slider - positioned at 80% from the top */}
      <div className="absolute left-0 right-0 z-30" style={{ top: "75%" }}>
        <div className="text-center mb-2">
          <h3 className="text-xl font-semibold text-amber-400" style={{ color: "#1e90db" }}>OUR CLIENTS</h3>
        </div>
        <ImageSlider className="py-4 px-2 bg-black bg-opacity-0 backdrop-blur-sm" />
      </div>

      {/* Overlay */}
      <div className="hero-overlay absolute inset-0 z-10"></div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl text-white font-montserrat font-bold leading-tight mb-6 reveal">
            Building Excellence, <br />
            Crafting Futures
          </h1>
          <p
            className="text-white text-lg md:text-xl mb-8 reveal"
            style={{ animationDelay: "0.2s" }}
          >
            ARCEM LLC is a premier construction Engineering and Management company delivering exceptional quality and innovative solutions for complex projects.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 reveal"
            style={{ animationDelay: "0.4s" }}
          >
            <Link href="/contact">
              <Button variant="gold">REACH US</Button>
            </Link>
            <Link href="/projects">
              <Button variant="white">OUR PROJECTS</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center">
        <button
          onClick={handleScrollDown}
          className="text-white animate-bounce p-2"
          aria-label="Scroll down"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default HeroSection;
