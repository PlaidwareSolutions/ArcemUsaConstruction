import React from "react";
import PageBanner from "@/components/common/PageBanner";
import QuoteRequestForm from "@/components/common/QuoteRequestForm";
import { Briefcase, Clock, CheckCircle, Target } from "lucide-react";

const RequestQuote = () => {
  return (
    <div className="request-quote-page">
      <PageBanner 
        title="Request a Quote" 
        description="Get a detailed estimate for your construction project"
        backgroundImage="/images/quote-banner.jpg"
      />
      
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6">Tell Us About Your Project</h2>
              <QuoteRequestForm />
            </div>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            {/* Why choose us section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Why Choose ARCEM</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold">Expert Team</h4>
                    <p className="text-sm text-muted-foreground">Our professionals have decades of combined experience in all types of construction.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold">Quality Guaranteed</h4>
                    <p className="text-sm text-muted-foreground">We stand by our work with extensive warranties and quality assurance processes.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold">Transparent Pricing</h4>
                    <p className="text-sm text-muted-foreground">No hidden fees or surprise costs - we provide detailed and accurate quotes.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold">Timely Completion</h4>
                    <p className="text-sm text-muted-foreground">We value your time and consistently deliver projects on schedule.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            {/* Process overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Our Quote Process</h3>
              <ol className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">1</div>
                  <div className="ml-3">
                    <h4 className="font-semibold flex items-center">
                      <Briefcase className="h-4 w-4 mr-1" />
                      Submit Request
                    </h4>
                    <p className="text-sm text-muted-foreground">Fill out the form with your project details.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">2</div>
                  <div className="ml-3">
                    <h4 className="font-semibold flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Initial Contact
                    </h4>
                    <p className="text-sm text-muted-foreground">We'll contact you within 24-48 hours to discuss your project.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">3</div>
                  <div className="ml-3">
                    <h4 className="font-semibold flex items-center">
                      <Target className="h-4 w-4 mr-1" />
                      Site Evaluation
                    </h4>
                    <p className="text-sm text-muted-foreground">If needed, we'll schedule a site visit to gather more information.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">4</div>
                  <div className="ml-3">
                    <h4 className="font-semibold flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Detailed Quote
                    </h4>
                    <p className="text-sm text-muted-foreground">Receive a comprehensive quote with cost breakdowns and timeline.</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestQuote;