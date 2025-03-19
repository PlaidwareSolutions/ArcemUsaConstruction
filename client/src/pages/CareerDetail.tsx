import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { JobPosting } from "@shared/schema";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, scrollToTop } from "@/lib/utils";
import { BriefcaseIcon, MapPinIcon, CalendarIcon, ExternalLinkIcon, ArrowLeftIcon } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function CareerDetail() {
  const params = useParams<{ id: string }>();
  const jobId = params.id ? parseInt(params.id) : undefined;
  
  // Direct API call to get job details
  const { data: jobPosting, isLoading: isLoadingJob } = useQuery<JobPosting>({
    queryKey: [`/api/careers/${jobId}`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!jobId,
  });

  useEffect(() => {
    scrollToTop();
  }, []);

  const formatBulletPoints = (text: string) => {
    if (!text) return null;
    
    // Split by newline and filter out empty lines
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) return <p>{text}</p>;
    
    // If there's only one line, just return as paragraph
    if (lines.length === 1) return <p>{text}</p>;
    
    // Otherwise, format as bullet points
    return (
      <ul className="list-disc pl-5 space-y-1 mt-2">
        {lines.map((line, index) => (
          <li key={index}>{line.trim()}</li>
        ))}
      </ul>
    );
  };

  if (isLoadingJob) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-8" />
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!jobPosting) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Alert variant="destructive">
            <AlertTitle>Job Not Found</AlertTitle>
            <AlertDescription>
              The job posting you're looking for doesn't exist or has been removed.
            </AlertDescription>
          </Alert>
          <div className="mt-6">
            <Button asChild>
              <Link to="/careers" onClick={scrollToTop}>
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Careers
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title={jobPosting.title}
        backgroundImage="/uploads/images/careers/daniel-mccullough--FPFq_trr2Y-unsplash.jpg"
      >
        <div className="flex flex-wrap gap-4 items-center mt-4">
          <div className="flex items-center">
            <BriefcaseIcon className="h-4 w-4 mr-2" />
            <span>{jobPosting.department}</span>
          </div>
          <div className="flex items-center">
            <MapPinIcon className="h-4 w-4 mr-2" />
            <span>{jobPosting.location}</span>
          </div>
          <Badge className="capitalize bg-white/20 hover:bg-white/30 text-white">
            {jobPosting.type ? jobPosting.type.replace('-', ' ') : 'Full Time'}
          </Badge>
          <div className="flex items-center text-white/80">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span className="text-sm">Posted {formatDate(jobPosting.createdAt)}</span>
          </div>
        </div>
      </PageHeader>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" asChild>
              <Link to="/careers" onClick={scrollToTop}>
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Careers
              </Link>
            </Button>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>{jobPosting.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {formatBulletPoints(jobPosting.responsibilities)}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {formatBulletPoints(jobPosting.requirements)}
              </div>
            </CardContent>
          </Card>

          {jobPosting.benefits && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {formatBulletPoints(jobPosting.benefits)}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="bg-muted p-6 rounded-lg mb-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">Apply for this Position</h3>
                {jobPosting.salary && (
                  <p className="text-muted-foreground mb-2">
                    Salary Range: <span className="font-medium">{jobPosting.salary}</span>
                  </p>
                )}
              </div>
              {jobPosting.applyUrl ? (
                <Button size="lg" asChild>
                  <a href={jobPosting.applyUrl} target="_blank" rel="noopener noreferrer">
                    Apply Now
                    <ExternalLinkIcon className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <Button size="lg" asChild>
                  <Link to="/contact">
                    Contact Us to Apply
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="text-center mt-12 mb-8">
            <h3 className="text-xl font-bold mb-2">Interested in Other Opportunities?</h3>
            <p className="text-muted-foreground mb-4">
              Explore all open positions at ARCEM Construction.
            </p>
            <Button asChild>
              <Link to="/careers" onClick={scrollToTop}>
                View All Jobs
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}