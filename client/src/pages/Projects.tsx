import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { initializeRevealEffects, scrollToTop } from "@/lib/utils";
import ProjectCard from "@/components/common/ProjectCard";
import { Project } from "@shared/schema";
import { motion } from "framer-motion";

const Projects = () => {
  useEffect(() => {
    scrollToTop();
    document.title = "Projects - ARCEM";
    const cleanup = initializeRevealEffects(true);
    return cleanup;
  }, []);

  const {
    data: projects,
    isLoading,
    error,
  } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Filter state
  const [filter, setFilter] = useState("all");

  // Get unique categories from projects
  const categories = projects
    ? [
        "all",
        ...Array.from(new Set(projects.map((project) => project.category))),
      ]
    : ["all"];

  // Filter projects based on selected category
  const filteredProjects =
    filter === "all"
      ? projects
      : projects?.filter((project) => project.category === filter);

  return (
    <>
      {/* Page Banner */}
      <div
        className="relative h-[350px] flex items-center justify-center"
        style={{
          backgroundImage: "url('/uploads/images/construction-projects.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-75"></div>
        <motion.div
          className="container relative z-10 px-4 md:px-8 text-white py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-6">
            Our Projects
          </h1>
          <p className="text-lg max-w-3xl">
            Browse our portfolio of completed projects showcasing our expertise
            across diverse sectors.
          </p>
        </motion.div>
      </div>

      {/* Projects Gallery */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-12 reveal active">
            <h2 className="text-3xl font-montserrat font-bold mb-8 text-center">
              Our Featured Work
            </h2>

            {/* Category filter */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-6 py-2 font-montserrat text-sm transition-colors ${
                    filter === category
                      ? "bg-[#1E90DB] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            // Loading state
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col">
                  <div className="h-72 bg-gray-200 animate-pulse rounded-lg"></div>
                  <div className="p-4 border border-t-0 border-gray-200 rounded-b-lg">
                    <div className="h-5 bg-gray-200 animate-pulse rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              Failed to load projects. Please try again later.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects?.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  title={project.title}
                  category={project.category}
                  imageUrl={project.image}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-black text-white text-center">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto reveal active">
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-6">
              Ready to Build Your Vision?
            </h2>
            <p className="text-lg mb-8">
              Let's discuss how ARCEM can bring your construction project to
              life.
            </p>
            <a
              href="/contact"
              className="bg-[#1E90DB] hover:bg-[#1670B0] text-white py-3 px-8 font-montserrat font-medium text-sm tracking-wider inline-block transition-colors"
            >
              START YOUR PROJECT
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Projects;
