import React, { useState } from "react";
import { Link } from "wouter";
import { useCareers } from "@/hooks/useCareers";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, scrollToTop } from "@/lib/utils";
import { JobPosting } from "@shared/schema";
import { BriefcaseIcon, CalendarIcon, StarIcon, SearchIcon, FilterIcon, MapPinIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useIsMobile } from "@/hooks/use-mobile";
import PageHeader from "@/components/PageHeader";

export default function Careers() {
  const { activeJobPostings, featuredJobPostings, isLoadingActive, isLoadingFeatured } = useCareers();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const isMobile = useIsMobile();

  // Extract unique departments and locations for filters
  const departments = activeJobPostings 
    ? Array.from(new Set(activeJobPostings.map((job: JobPosting) => job.department)))
    : [];
  
  const locations = activeJobPostings 
    ? Array.from(new Set(activeJobPostings.map((job: JobPosting) => job.location)))
    : [];
  
  const jobTypes = ["full-time", "part-time", "contract", "temporary", "internship"];

  // Filter jobs based on search and filters
  const filteredJobs = activeJobPostings 
    ? activeJobPostings.filter((job: JobPosting) => {
        // Search query filter
        const matchesSearch = 
          searchQuery === "" || 
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Job type filter
        const matchesType = 
          filterType === "all" || 
          job.type === filterType;
        
        // Department filter
        const matchesDepartment = 
          filterDepartment === "all" || 
          job.department === filterDepartment;
        
        // Location filter
        const matchesLocation = 
          filterLocation === "all" || 
          job.location === filterLocation;
        
        return matchesSearch && matchesType && matchesDepartment && matchesLocation;
      })
    : [];

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setFilterDepartment("all");
    setFilterLocation("all");
  };

  // Job card component
  const JobCard = ({ job }: { job: JobPosting }) => (
    <Card className="hover:shadow-md transition-shadow border-muted">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 mb-1">
              {job.title}
              {job.featured && (
                <StarIcon className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
              )}
            </CardTitle>
            <CardDescription className="flex flex-wrap gap-1 items-center mb-1">
              <BriefcaseIcon className="h-4 w-4 mr-1" />
              {job.department}
              <span className="mx-1">•</span>
              <MapPinIcon className="h-4 w-4 mr-1" />
              {job.location}
            </CardDescription>
          </div>
          <Badge className="capitalize">{job.type.replace("-", " ")}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm line-clamp-3">
          {job.description}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2">
        <div className="flex items-center">
          <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Posted {formatDate(job.createdAt)}
          </span>
        </div>
        <Button asChild size="sm">
          <Link to={`/careers/${job.id}`} onClick={scrollToTop}>
            View Job
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );

  // Featured Jobs section
  const FeaturedJobs = () => {
    if (isLoadingFeatured) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[200px] w-full rounded-lg" />
            </div>
          ))}
        </div>
      );
    }

    if (!featuredJobPostings || featuredJobPostings.length === 0) {
      return null;
    }

    return (
      <div className="my-8">
        <h2 className="text-2xl font-bold mb-4">Featured Opportunities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredJobPostings.map((job: JobPosting) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <PageHeader 
        title="Careers at ARCEM" 
        subtitle="Join our team of talented professionals and help us build exceptional spaces. Explore current opportunities and find your perfect role."
        backgroundImage="/uploads/images/careers/silvia-brazzoduro-YSxcf6C_SEg-unsplash.jpg"
      />
      
      <div className="container mx-auto px-4 py-8">
        <FeaturedJobs />

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">All Open Positions</h2>
          
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {jobTypes.map((type) => (
                      <SelectItem key={type} value={type} className="capitalize">
                        {type.replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filterLocation} onValueChange={setFilterLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button variant="outline" onClick={resetFilters} className="whitespace-nowrap">
                <FilterIcon className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
            
            {/* Active filters display */}
            {(filterType !== "all" || filterDepartment !== "all" || filterLocation !== "all" || searchQuery) && (
              <div className="flex flex-wrap gap-2 mt-2">
                {searchQuery && (
                  <Badge variant="outline" className="py-1">
                    Search: {searchQuery}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 ml-1 p-0"
                      onClick={() => setSearchQuery("")}
                    >
                      ×
                    </Button>
                  </Badge>
                )}
                {filterType !== "all" && (
                  <Badge variant="outline" className="py-1 capitalize">
                    Type: {filterType.replace('-', ' ')}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 ml-1 p-0"
                      onClick={() => setFilterType("all")}
                    >
                      ×
                    </Button>
                  </Badge>
                )}
                {filterDepartment !== "all" && (
                  <Badge variant="outline" className="py-1">
                    Department: {filterDepartment}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 ml-1 p-0"
                      onClick={() => setFilterDepartment("all")}
                    >
                      ×
                    </Button>
                  </Badge>
                )}
                {filterLocation !== "all" && (
                  <Badge variant="outline" className="py-1">
                    Location: {filterLocation}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 ml-1 p-0"
                      onClick={() => setFilterLocation("all")}
                    >
                      ×
                    </Button>
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          {isLoadingActive ? (
            <div className="grid grid-cols-1 gap-6 mt-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-[150px] w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {filteredJobs.length === 0 ? (
                <Alert>
                  <AlertTitle>No matching jobs found</AlertTitle>
                  <AlertDescription>
                    Try adjusting your search criteria or check back later for new opportunities.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {filteredJobs.map((job: JobPosting) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="bg-muted/40 p-6 rounded-lg mt-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Join Our Team</h2>
            <p className="text-muted-foreground">
              Don't see a position that matches your skills? We're always looking for talented individuals.
            </p>
          </div>
          <div className="flex justify-center">
            <Button size="lg" asChild>
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}