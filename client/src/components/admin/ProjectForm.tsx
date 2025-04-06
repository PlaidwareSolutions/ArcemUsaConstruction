import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProject } from '@/hooks/useProject';
import { InsertProject, insertProjectSchema, InsertProjectGallery, ProjectGallery, ExtendedInsertProject } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertCircle,
  ArrowLeft, 
  CheckCircle2, 
  Images,
  ImagePlus,
  LayoutDashboard,
  Loader2, 
  Trash2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import ProjectGalleryManager, { ProjectGalleryManagerHandle } from './ProjectGalleryManagerFixed';
import EmergencyGallerySaveButton from './EmergencyGallerySaveButton';
import * as fileUtils from '@/lib/fileUtils';
import UploadThingUploader from '@/components/common/UploadThingUploader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProjectFormProps {
  projectId?: number;
  onClose: () => void;
}

// Project categories
const projectCategories = [
  "Commercial",
  "Residential",
  "Industrial",
  "Infrastructure",
  "Healthcare",
  "Education",
  "Hospitality",
  "Government",
  "Mixed-Use",
  "Renovation",
  "Other"
];

// Helper function to generate session IDs for uploads
const generateSessionId = () => {
  return `project-upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const ProjectForm = ({ projectId, onClose }: ProjectFormProps) => {
  const { toast } = useToast();
  const { project, projectGallery, isLoading, createProject, updateProject } = useProject(projectId);
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSessions, setUploadSessions] = useState<string[]>([]);
  const [featureImageSession, setFeatureImageSession] = useState<string | null>(null);
  const [pendingFormData, setPendingFormData] = useState<InsertProject | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  
  // Ref for the gallery manager
  const galleryManagerRef = useRef<ProjectGalleryManagerHandle>(null);

  // Initialize form
  const form = useForm<InsertProject>({
    resolver: zodResolver(insertProjectSchema.extend({
      // Add optional fields for project details
      overview: insertProjectSchema.shape.overview.optional(),
      challenges: insertProjectSchema.shape.challenges.optional(),
      results: insertProjectSchema.shape.results.optional(),
      
      // Add optional fields for specifications
      client: insertProjectSchema.shape.client.optional(),
      location: insertProjectSchema.shape.location.optional(), 
      size: insertProjectSchema.shape.size.optional(),
      completionDate: insertProjectSchema.shape.completionDate.optional(),
      servicesProvided: insertProjectSchema.shape.servicesProvided.optional(),
    })),
    defaultValues: {
      title: '',
      category: '',
      description: '',
      image: '',
      featured: false,
      // Project details
      overview: '',
      challenges: '',
      results: '',
      // Project specifications
      client: '',
      location: '',
      size: '',
      completionDate: '',
      servicesProvided: '',
    }
  });
  
  // Track upload sessions for cleanup
  const addUploadSession = (sessionId: string) => {
    setUploadSessions(prev => [...prev, sessionId]);
  };
  
  // Load project data into form if editing
  useEffect(() => {
    if (project) {
      console.log("Setting form values for project:", project);
      form.reset({
        title: project.title,
        category: project.category,
        description: project.description,
        image: project.image,
        featured: project.featured === null ? false : project.featured,
        // Project details
        overview: project.overview ?? '',
        challenges: project.challenges ?? '',
        results: project.results ?? '',
        // Project specifications
        client: project.client ?? '',
        location: project.location ?? '',
        size: project.size ?? '',
        completionDate: project.completionDate ?? '',
        servicesProvided: project.servicesProvided ?? '',
      });
    }
  }, [form, project]);

  // Check if there are unsaved gallery changes
  const checkUnsavedGalleryChanges = (): boolean => {
    if (projectId && galleryManagerRef.current) {
      return galleryManagerRef.current.hasUnsavedChanges();
    }
    return false;
  };

  // Form submit handler for existing projects
  const onSubmit = async (data: InsertProject) => {
    if (checkUnsavedGalleryChanges()) {
      // Store form data and show confirmation dialog
      setPendingFormData(data);
      setShowUnsavedDialog(true);
    } else {
      // No unsaved gallery changes, proceed with form submission
      try {
        await saveProject(data);
        
        // If we have a gallery manager (for existing project), save the gallery images
        if (galleryManagerRef.current) {
          try {
            await galleryManagerRef.current.saveGalleryImages();
          } catch (error) {
            console.error("Error saving gallery images:", error);
            toast({
              title: "Warning",
              description: "Project was saved but there was an error saving some gallery images.",
              variant: "destructive"
            });
          }
        }
        
        toast({
          title: "Success",
          description: "Project updated successfully",
        });
        
        onClose();
      } catch (error) {
        console.error("Error saving project:", error);
        toast({
          title: "Error",
          description: "Failed to save project. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Handler for new project submission (all fields in one step)
  const handleNewProjectSubmit = async (data: InsertProject) => {
    try {
      console.log("Creating new project with data:", data);
      setIsSubmitting(true);
      
      // Save the project data first to get the project ID
      const createdProject = await saveProject(data);
      
      // Check if we received a valid project response with an ID
      if (createdProject && typeof createdProject === 'object' && 'id' in createdProject) {
        const newProjectId = createdProject.id;
        console.log("New project created with ID:", newProjectId);
        
        // Now save any pending gallery images if they exist
        if (galleryManagerRef.current && galleryManagerRef.current.hasPendingImages()) {
          console.log("Saving pending gallery images for newly created project:", newProjectId);
          try {
            // The gallery manager's projectId is initially 0 (for new projects)
            // We need to update it with the real project ID before saving
            if (galleryManagerRef.current.updateProjectId) {
              galleryManagerRef.current.updateProjectId(newProjectId);
            }
            
            // Now save the gallery images with the correct project ID
            await galleryManagerRef.current.saveGalleryImages();
            console.log("Successfully saved gallery images for new project");
          } catch (error) {
            console.error("Error saving gallery images for new project:", error);
            toast({
              title: "Warning",
              description: "Project was created but there was an error saving some gallery images.",
              variant: "destructive"
            });
          }
        }
        
        toast({
          title: "Success!",
          description: "Project created successfully",
        });
        
        // Refresh the page with the new project ID to convert to edit mode using the correct URL format
        window.location.href = `/admin/projects?edit=${newProjectId}`;
      } else {
        // Fallback in case we don't get a proper ID back
        console.warn("No project ID returned after creation, falling back to close");
        onClose();
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "There was a problem creating your project. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };
  
  // Save project data (used by both create and update paths)
  const saveProject = async (data: InsertProject) => {
    try {
      if (projectId) {
        console.log("Updating existing project:", projectId);
        
        // For existing projects, we need to make sure existing images aren't deleted
        
        // 1. Get the current project data to preserve its images
        if (project) {
          const existingImageUrl = project.image;
          
          // If the project has an existing feature image, make sure it's preserved
          // (unless it's being explicitly replaced)
          if (existingImageUrl && existingImageUrl !== data.image) {
            console.log(`[ProjectForm] Preserving existing project feature image: ${existingImageUrl}`);
            
            // Commit all sessions to preserve this image
            uploadSessions.forEach(sessionId => {
              fileUtils.commitFiles(sessionId, [existingImageUrl]);
            });
          }
        }
        
        // 2. Get any existing gallery images to preserve
        if (projectGallery && projectGallery.length > 0) {
          const galleryUrls = projectGallery.map(img => img.imageUrl).filter(Boolean);
          console.log(`[ProjectForm] Preserving ${galleryUrls.length} existing gallery images`);
          
          // Commit all sessions with these gallery URLs to make sure they aren't deleted
          uploadSessions.forEach(sessionId => {
            fileUtils.commitFiles(sessionId, galleryUrls);
          });
        }
        
        // 3. Update the project
        await updateProject(projectId, data);
        return { id: projectId }; // Return project id for consistency
      } else {
        // Create new project
        console.log("Creating new project");
        let createdProject;

        // Check if we have pending gallery images to include with the project
        if (galleryManagerRef.current && galleryManagerRef.current.hasPendingImages()) {
          console.log("Including pending gallery images with project creation");
          
          // Get the pending images from the gallery manager
          const pendingImages = galleryManagerRef.current.getPendingImages();
          
          // Create an ExtendedInsertProject that includes gallery images
          const extendedData: ExtendedInsertProject = {
            ...data,
            galleryImages: pendingImages.map(img => ({
              imageUrl: img.url,
              caption: img.caption,
              displayOrder: img.displayOrder,
              isFeature: false // We'll set the first one as feature by default in the backend
            }))
          };
          
          // Create the project with the gallery images included
          createdProject = await createProject(extendedData);
        } else {
          // Create the project without gallery images
          createdProject = await createProject(data);
        }
        
        // Commit any pending uploads
        uploadSessions.forEach(sessionId => {
          fileUtils.commitFiles(sessionId);
        });
        
        return createdProject;
      }
    } catch (error) {
      console.error("Error in saveProject:", error);
      throw error;
    }
  };

  // Handle dialog confirmation for unsaved gallery changes
  const confirmSubmitWithChanges = async () => {
    setShowUnsavedDialog(false);
    
    if (!pendingFormData) return;
    
    try {
      setIsSubmitting(true);
      await saveProject(pendingFormData);
      
      // Save the gallery changes
      if (galleryManagerRef.current) {
        await galleryManagerRef.current.saveGalleryImages();
      }
      
      toast({
        title: "Success",
        description: "Project and gallery changes saved successfully",
      });
      
      onClose();
    } catch (error) {
      console.error("Error saving project with gallery changes:", error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle project close
  const handleClose = () => {
    // Check for unsaved changes
    if (form.formState.isDirty || checkUnsavedGalleryChanges()) {
      if (confirm("You have unsaved changes. Are you sure you want to leave without saving?")) {
        // Clean up any tracked files
        uploadSessions.forEach(sessionId => {
          fileUtils.cleanupFiles(sessionId);
        });
        onClose();
      }
    } else {
      onClose();
    }
  };
  
  // Set a gallery image as the feature image
  const handleSetAsPreview = (e: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, imageUrl: string) => {
    if (e) e.preventDefault();
    
    // Set the image url in the form
    form.setValue("image", imageUrl);
    
    // Show toast to confirm the action
    toast({
      title: "Feature image updated",
      description: "This image will be used as the project thumbnail and hero image"
    });
  };

  // Render gallery section for project creation/editing
  const renderGallerySection = () => {
    return (
      <div className="mt-8">
        <Separator className="my-6" />
        <h3 className="text-lg font-semibold mb-4">Project Images</h3>
      
        <div className="space-y-6">
          {/* Feature Image section removed - now handled through gallery */}
          
          {/* Gallery Images Section */}
          <div className="bg-muted/30 rounded-lg p-5 border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-base font-medium">Project Gallery</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Add additional images to showcase the project (up to 10 images)
                </p>
              </div>
              
              {/* ALWAYS VISIBLE GALLERY SAVE BUTTON - directly at the top level */}
              {projectId && (
                <Button
                  type="button"
                  size="default"
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 border-2 border-green-400 animate-pulse"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log("TOP LEVEL Save Gallery Images button clicked");
                    
                    // Get the project ID from the URL parameter
                    const projectIdFromUrl = Number(projectId);
                    console.log("Project ID from URL:", projectIdFromUrl);
                    
                    // Try to get pending images from localStorage
                    const savedPendingImages = localStorage.getItem(`pendingImages_project_${projectIdFromUrl}`);
                    
                    if (savedPendingImages) {
                      try {
                        const pendingImages = JSON.parse(savedPendingImages);
                        console.log(`Found ${pendingImages.length} pending images in localStorage:`, pendingImages);
                        
                        // Save each image one by one directly with the API
                        const savePromises = pendingImages.map((img: {url: string, caption?: string, displayOrder?: number}) => {
                          console.log("Saving image:", img.url);
                          
                          return fetch(`/api/projects/${projectIdFromUrl}/gallery`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              projectId: projectIdFromUrl,
                              imageUrl: img.url,
                              caption: img.caption || `Project image`,
                              displayOrder: img.displayOrder || 1
                            })
                          });
                        });
                        
                        Promise.all(savePromises)
                          .then(() => {
                            // Clear pending images after save
                            localStorage.removeItem(`pendingImages_project_${projectIdFromUrl}`);
                            toast({
                              title: "Gallery images saved",
                              description: `${pendingImages.length} images saved successfully.`,
                            });
                            
                            // Refresh the page to show the updated gallery
                            setTimeout(() => {
                              window.location.reload();
                            }, 1500);
                          })
                          .catch(error => {
                            console.error("Error saving gallery images:", error);
                            toast({
                              title: "Error",
                              description: "Failed to save some gallery images. Please try again.",
                              variant: "destructive"
                            });
                          });
                          
                      } catch (e) {
                        console.error("Error parsing saved pending images:", e);
                      }
                    } else {
                      console.log("No pending images found in localStorage");
                      toast({
                        title: "No images to save",
                        description: "You haven't uploaded any new images yet.",
                      });
                    }
                  }}
                >
                  <ImagePlus className="h-5 w-5 mr-2" />
                  Save Gallery Images
                </Button>
              )}
            </div>
            
            {/* Use the gallery manager for both new and existing projects */}
            <div className="space-y-4">
              <ProjectGalleryManager
                ref={galleryManagerRef}
                projectId={projectId || 0}
                onSetAsPreview={handleSetAsPreview}
                allowReordering={true}
              />
              
              {/* Emergency save button that operates independently from the gallery manager */}
              {projectId ? (
                <div className="mt-6 border-t pt-4 flex justify-center">
                  <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800 max-w-xl">
                    <h5 className="text-center text-red-700 dark:text-red-400 font-semibold mb-2">Emergency Gallery Recovery</h5>
                    <p className="text-sm text-red-600 dark:text-red-400 mb-3 text-center">
                      If your gallery images aren't showing up after uploading, use this button to force-save them.
                    </p>
                    <div className="flex justify-center">
                      <EmergencyGallerySaveButton projectId={projectId} />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={handleClose} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-montserrat font-bold">
          {projectId ? 'Edit Project' : 'Add New Project'}
        </h1>
        
        {/* Project type indicator */}
        {!projectId && (
          <div className="ml-auto flex items-center gap-3">
            <Badge 
              variant="default"
              className="flex items-center gap-1"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <Images className="h-3.5 w-3.5 ml-1" />
              New Project
            </Badge>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-pulse space-y-4 w-full max-w-xl">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded w-full"></div>
            <div className="h-6 bg-gray-200 rounded w-full"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {projectId ? (
            // Form for existing projects (all in one view)
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Form fields for existing projects */}
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Title</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter project title" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a project category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {projectCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select the category that best fits this project
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value === true}
                              onCheckedChange={(checked) => field.onChange(checked === true)}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Featured Project
                            </FormLabel>
                            <FormDescription>
                              Featured projects are displayed prominently on the homepage
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide a detailed description of the project" 
                              rows={5}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Project details section */}
                <div className="mt-8">
                  <Separator className="my-6" />
                  <h3 className="text-lg font-semibold mb-4">Project Details</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="overview"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Overview</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide an overview of the project" 
                              rows={4}
                              {...field}
                              value={field.value ?? ''} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="challenges"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Challenges and Solutions</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe challenges faced during the project and solutions implemented" 
                              rows={4}
                              {...field}
                              value={field.value ?? ''} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="results"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Results</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the project results and outcomes" 
                              rows={4}
                              {...field}
                              value={field.value ?? ''} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Project specifications section */}
                <div className="mt-8">
                  <Separator className="my-6" />
                  <h3 className="text-lg font-semibold mb-4">Project Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="client"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Client name" 
                              {...field}
                              value={field.value ?? ''} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Project location" 
                              {...field}
                              value={field.value ?? ''} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Size</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Size (e.g., sqft, acres)" 
                              {...field}
                              value={field.value ?? ''} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="completionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Completion Date</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="When was the project completed" 
                              {...field}
                              value={field.value ?? ''} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="servicesProvided"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Services Provided</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List services provided in this project" 
                              rows={2}
                              {...field}
                              value={field.value ?? ''} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Rendering the gallery section for existing projects */}
                {renderGallerySection()}

                {/* Action buttons */}
                <div className="flex justify-end space-x-4 mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="gold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Save Changes
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            // Form for new projects (unified approach)
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleNewProjectSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Title</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter project title" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value || ''}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a project category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {projectCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select the category that best fits this project
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value === true}
                              onCheckedChange={(checked) => field.onChange(checked === true)}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Featured Project
                            </FormLabel>
                            <FormDescription>
                              Featured projects are displayed prominently on the homepage
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide a detailed description of the project" 
                              rows={5}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm">
                          <span className="font-semibold block mb-1">About image uploads:</span>
                          <p className="text-muted-foreground">
                            After filling in the project details, you can add feature and gallery images. Image management appears after filling out the required fields.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Project Details Fields */}
                <div className="mt-8">
                  <Separator className="my-6" />
                  <h3 className="text-lg font-semibold mb-4">Project Details</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="overview"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Overview</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide an overview of the project" 
                              rows={4}
                              {...field}
                              value={field.value ?? ''} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="challenges"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Challenges and Solutions</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe challenges faced during the project and solutions implemented" 
                              rows={4}
                              {...field}
                              value={field.value ?? ''} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="results"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Results</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the project results and outcomes" 
                              rows={4}
                              {...field}
                              value={field.value ?? ''} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Project Specifications Fields */}
                <div className="mt-8">
                  <Separator className="my-6" />
                  <h3 className="text-lg font-semibold mb-4">Project Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="client"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Client name" 
                              {...field}
                              value={field.value ?? ''} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Project location" 
                              {...field}
                              value={field.value ?? ''} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Size</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Size (e.g., sqft, acres)" 
                              {...field}
                              value={field.value ?? ''} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="completionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Completion Date</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="When was the project completed" 
                              {...field}
                              value={field.value ?? ''} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="servicesProvided"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Services Provided</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List services provided in this project" 
                              rows={2}
                              {...field}
                              value={field.value ?? ''} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Gallery section */}
                {renderGallerySection()}

                {/* Action buttons */}
                <div className="flex justify-end space-x-4 mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="gold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Create Project
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      )}
      
      {/* Unsaved Gallery Changes Confirmation Dialog */}
      <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Gallery Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes in the project gallery. What would you like to do?
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center border rounded-md p-3 bg-amber-50 text-amber-800 mt-2">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p className="text-sm">
              If you continue without saving, your gallery changes (new images, updated captions or display orders) will be lost.
            </p>
          </div>
          
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowUnsavedDialog(false)}>
              Go Back and Save Gallery Changes
            </Button>
            <Button 
              variant="default" 
              onClick={confirmSubmitWithChanges}
            >
              Continue and Save Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectForm;