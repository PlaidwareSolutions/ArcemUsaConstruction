import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackToTop from "@/components/common/BackToTop";
import ScrollProgressBar from "@/components/common/ScrollProgressBar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SeoProvider } from "@/contexts/SeoContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ChatbotWidget from "@/components/custom/ChatbotWidget";
import ElectronCleanupHandler from "@/components/system/ElectronCleanupHandler";
import GlobalCleanupHandler from "@/components/system/GlobalCleanupHandler";

// Pages
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Contact from "@/pages/Contact";
import RequestQuote from "@/pages/RequestQuote";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import Sitemap from "@/pages/Sitemap";
import JoinUs from "@/pages/JoinUs";
import Careers from "@/pages/Careers";
import CareerDetail from "@/pages/CareerDetail";
import SubcontractorVendorRegistration from "@/pages/SubcontractorVendorRegistration";
import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/admin/Dashboard";
import ProjectManagement from "@/pages/admin/ProjectManagement";
import BlogManagement from "@/pages/admin/BlogManagement";
import ServicesManagement from "@/pages/admin/ServicesManagement";
import MessagesManagement from "@/pages/admin/MessagesManagement";
import TestimonialsManagement from "@/pages/admin/TestimonialsManagement";
import NewsletterManagement from "@/pages/admin/NewsletterManagement";
import QuoteRequestsManagement from "@/pages/admin/QuoteRequestsManagement";
import CareersManagement from "@/pages/admin/CareersManagement";
import TeamMembersManagement from "@/pages/admin/TeamMembersManagement";
import SettingsPage from "@/pages/admin/Settings";
import AccessibilityCheckerPage from "@/pages/admin/AccessibilityChecker";
import SubcontractorManagement from "@/pages/admin/SubcontractorManagement";
import FileUploadTest from "@/pages/admin/FileUploadTest";
import Resources from "@/pages/Resources";
import JoinTogether from "@/pages/JoinTogether";
import NotFound from "@/pages/not-found";
import RequestQuoteButton from "@/components/common/A11yFloatingButton";

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <Route>
      <ProtectedRoute>
        <Component />
      </ProtectedRoute>
    </Route>
  );
}

function Router() {
  // Always keep navbar in scrolled state
  const [isScrolled, setIsScrolled] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  // Check if we're on an admin page
  const isAdminPage = currentPath.startsWith('/admin');
  
  // Listen for location changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Set up event listener for path changes
    window.addEventListener('popstate', handleLocationChange);
    
    // Check for changes when clicking on links
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      history.pushState = originalPushState;
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Show scroll progress indicator on non-admin pages */}
      {!isAdminPage && <ScrollProgressBar />}
      {/* Show Navbar on all pages */}
      <Navbar isScrolled={isScrolled} />
      
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/services" component={Services} />
          <Route path="/services/:id/:slug" component={ServiceDetail} />
          <Route path="/projects" component={Projects} />
          <Route path="/projects/:id" component={ProjectDetail} />
          <Route path="/blog" component={Blog} />
          <Route path="/blog/:slug" component={BlogPost} />
          <Route path="/contact" component={Contact} />
          <Route path="/request-quote" component={RequestQuote} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />
          <Route path="/sitemap" component={Sitemap} />
          <Route path="/join-us" component={JoinUs} />
          <Route path="/join-together" component={JoinTogether} />
          <Route path="/careers" component={Careers} />
          <Route path="/careers/:id" component={CareerDetail} />
          <Route path="/resources" component={Resources} />
          <Route path="/subcontractors" component={SubcontractorVendorRegistration} />
          <Route path="/auth">
            <Login />
          </Route>
          
          <Route path="/auth/login">
            <Login />
          </Route>
          
          {/* Protected Admin Routes */}
          <Route path="/admin">
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/projects">
            <ProtectedRoute>
              <ProjectManagement />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/blog">
            <ProtectedRoute>
              <BlogManagement />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/services">
            <ProtectedRoute>
              <ServicesManagement />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/messages">
            <ProtectedRoute>
              <MessagesManagement />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/testimonials">
            <ProtectedRoute>
              <TestimonialsManagement />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/newsletter">
            <ProtectedRoute>
              <NewsletterManagement />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/quotes">
            <ProtectedRoute>
              <QuoteRequestsManagement />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/settings">
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/accessibility">
            <ProtectedRoute>
              <AccessibilityCheckerPage />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/subcontractors">
            <ProtectedRoute>
              <SubcontractorManagement />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/careers">
            <ProtectedRoute>
              <CareersManagement />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/team-members">
            <ProtectedRoute>
              <TeamMembersManagement />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/file-upload-test">
            <ProtectedRoute>
              <FileUploadTest />
            </ProtectedRoute>
          </Route>
          
          <Route component={NotFound} />
        </Switch>
      </main>
      
      <BackToTop />
      {/* Show Chatbot on non-admin pages */}
      {!isAdminPage && <ChatbotWidget />}
      {/* Show Footer on all pages */}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SeoProvider>
          <Router />
          <Toaster />
          <AdminAccessibilityButton />
          {/* Invisible components to handle file cleanup */}
          <ElectronCleanupHandler />
          <GlobalCleanupHandler />
        </SeoProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// A separate component to handle request quote button
function AdminAccessibilityButton() {
  return <RequestQuoteButton />;
}

export default App;
