import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InsertProject, insertProjectSchema, Project } from '@shared/schema';
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
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  LayoutDashboard,
  Images,
  X,
  ImagePlus,
  PencilLine,
  Trash2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import SimpleProjectGallery from '@/components/admin/SimpleProjectGallery';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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

const SimpleProjectForm: React.FC<ProjectFormProps> = ({ projectId, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [galleryImages, setGalleryImages] = useState<Array<{
    id?: number;
    imageUrl: string;
    caption?: string;
    displayOrder?: number;
    isFeature?: boolean;
  }>>([]);
  const [newUploads, setNewUploads] = useState<Array<{
    imageUrl: string;
    caption?: string;
    displayOrder?: number;
    isFeature?: boolean;
  }>>([]);

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

  // Fetch project data if editing
  const { data: project, isLoading: isLoadingProject } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId || 0}`],
    enabled: !!projectId,
  });

  // Fetch gallery data if editing
  const { data: galleryData, isLoading: isLoadingGallery } = useQuery<any[]>({
    queryKey: [`/api/projects/${projectId || 0}/gallery`],
    enabled: !!projectId,
  });

  // Set form values when project data loads
  useEffect(() => {
    if (project) {
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

  // Set gallery images when gallery data loads
  useEffect(() => {
    if (galleryData) {
      setGalleryImages(galleryData);
    }
  }, [galleryData]);

  // Handle form submission for project creation
  const handleCreateProject = async (formData: InsertProject) => {
    setIsSubmitting(true);
    
    try {
      // If we have a feature image from gallery, use it
      const featureImage = [...galleryImages, ...newUploads].find(img => img.isFeature)?.imageUrl;
      if (featureImage && !formData.image) {
        formData.image = featureImage;
      }
      
      // Create extended project data with gallery images
      const projectWithGallery = {
        ...formData,
        galleryImages: newUploads.map((img, index) => ({
          imageUrl: img.imageUrl,
          caption: img.caption || `Project image ${index + 1}`,
          displayOrder: img.displayOrder || index + 1,
          isFeature: img.isFeature || false
        }))
      };
      
      // Create the project
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectWithGallery)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create project');
      }
      
      const newProject = await response.json();
      
      toast({
        title: 'Success!',
        description: 'Project created successfully',
      });
      
      // Invalidate projects query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      // Redirect to edit mode for the new project
      window.location.href = `/admin/projects?edit=${newProject.id}`;
      
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission for project update
  const handleUpdateProject = async (formData: InsertProject) => {
    if (!projectId) return;
    
    setIsSubmitting(true);
    
    try {
      // If we have a feature image from gallery, use it
      const featureImage = [...galleryImages, ...newUploads].find(img => img.isFeature)?.imageUrl;
      if (featureImage) {
        formData.image = featureImage;
      }
      
      // Update the project
      const projectResponse = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          // Include gallery changes
          galleryImages: [
            // Existing images with any changes
            ...galleryImages.map(img => ({
              id: `existing-${img.id}`,
              imageUrl: img.imageUrl,
              caption: img.caption,
              displayOrder: img.displayOrder,
              isFeature: img.isFeature
            })),
            // New uploads
            ...newUploads.map(img => ({
              imageUrl: img.imageUrl,
              caption: img.caption,
              displayOrder: img.displayOrder || (galleryImages.length + 1),
              isFeature: img.isFeature
            }))
          ]
        })
      });
      
      if (!projectResponse.ok) {
        throw new Error('Failed to update project');
      }
      
      toast({
        title: 'Success',
        description: 'Project updated successfully',
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/gallery`] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      onClose();
      
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle image upload complete
  const handleImagesUploaded = (images: Array<{ url: string }>) => {
    const newImages = images.map((img, index) => ({
      imageUrl: img.url,
      caption: `Project image ${newUploads.length + index + 1}`,
      displayOrder: galleryImages.length + newUploads.length + index + 1,
      isFeature: galleryImages.length === 0 && newUploads.length === 0
    }));
    
    setNewUploads(prev => [...prev, ...newImages]);
    
    toast({
      title: 'Images added',
      description: `${images.length} image(s) added to gallery`,
    });
  };

  // Handle gallery changes like caption updates, reordering, etc.
  const handleGalleryChange = (updatedGallery: any[]) => {
    setGalleryImages(updatedGallery);
  };

  // Handle setting an image as feature image
  const handleSetAsFeature = (imageUrl: string) => {
    // Update existing gallery images
    setGalleryImages(prev => 
      prev.map(img => ({
        ...img,
        isFeature: img.imageUrl === imageUrl
      }))
    );
    
    // Update new uploads
    setNewUploads(prev => 
      prev.map(img => ({
        ...img,
        isFeature: img.imageUrl === imageUrl
      }))
    );
    
    // Set the image URL in the form
    form.setValue('image', imageUrl);
  };

  // Handle image deletion
  const handleDeleteImage = async (imageId: number | undefined, imageUrl: string) => {
    // If it's an existing image (has ID)
    if (imageId) {
      setGalleryImages(prev => prev.filter(img => img.id !== imageId));
    } else {
      // If it's a new upload
      setNewUploads(prev => prev.filter(img => img.imageUrl !== imageUrl));
    }
  };

  // Handle project close
  const handleClose = () => {
    if (form.formState.isDirty || newUploads.length > 0) {
      if (confirm("You have unsaved changes. Are you sure you want to leave without saving?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const isLoading = isLoadingProject || isLoadingGallery;

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
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(projectId ? handleUpdateProject : handleCreateProject)}
            className="space-y-8"
          >
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

            {/* Project Gallery Section */}
            <div className="mt-8">
              <Separator className="my-6" />
              <h3 className="text-lg font-semibold mb-4">Project Images</h3>
              
              <SimpleProjectGallery
                projectId={projectId}
                existingImages={galleryImages}
                newImages={newUploads}
                onImagesUploaded={handleImagesUploaded}
                onGalleryChange={handleGalleryChange}
                onSetAsFeature={handleSetAsFeature}
                onDeleteImage={handleDeleteImage}
              />
            </div>

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
                    {projectId ? 'Saving...' : 'Creating...'}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {projectId ? 'Save Changes' : 'Create Project'}
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default SimpleProjectForm;