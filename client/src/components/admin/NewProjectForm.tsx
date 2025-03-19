import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProject } from '@/hooks/useProject';
import { InsertProject, insertProjectSchema, ExtendedInsertProject, ProjectGallery } from '@shared/schema';
import { useQueryClient } from '@tanstack/react-query';
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
  Image,
  ImagePlus,
  ImageIcon,
  Loader2, 
  Star,
  Trash2,
  MoveUp,
  MoveDown,
  X,
  Upload,
  UploadCloud
} from 'lucide-react';

// Helper function to safely handle string or null values
function safeString(value: string | null | undefined): string {
  return value || '';
}

// Helper function to safely handle boolean values
function safeBoolean(value: boolean | null | undefined): boolean {
  return value === true;
}
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import * as fileUtils from '@/lib/fileUtils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateId } from '@/lib/utils';
import SortableGallery, { GalleryImage } from '@/components/common/SortableGallery';

// Import file upload hooks and utilities
import { useFileUpload } from '@/hooks/useUploadThing';

// Define an interface for our locally tracked gallery image
interface TempGalleryImage {
  id: string; // Local ID for tracking
  file?: File; // Original file (if locally added)
  imageUrl?: string; // URL (if already uploaded)
  caption: string;
  displayOrder: number;
  isFeature: boolean;
  uploadProgress?: number; // Track upload progress
  uploaded: boolean; // Whether the file has been uploaded to the server
}

// Props for ProjectForm component
interface NewProjectFormProps {
  projectId?: number; // If provided, we're editing an existing project
  onClose: () => void;
}

export default function NewProjectForm({ projectId, onClose }: NewProjectFormProps) {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Project data fetching and mutations
  const { 
    getProject, 
    createProject,
    updateProject,
    getProjectGallery,
    isLoading,
    galleryLoading
  } = useProject(projectId); // Pass projectId to useProject

  // Track temporary gallery images
  const [galleryImages, setGalleryImages] = useState<TempGalleryImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // Generate a unique session ID for this form instance
  const [sessionId] = useState(() => generateId());

  // Extract project data if editing
  const project = getProject.data; // Will be undefined if no data available
  const galleryData = getProjectGallery.data || [];

  // Initialize file upload hooks
  const {
    files,
    addFiles,
    removeFile,
    clearFiles,
    upload,
    isUploading,
    uploadProgress,
    permittedFileInfo,
    maxFileSize,
    formatFileSize,
  } = useFileUpload({
    onClientUploadComplete: (urls: string[]) => {
      // When files are uploaded, update the temporary gallery images
      if (urls.length > 0) {
        setGalleryImages(prev => {
          const newGallery = [...prev];
          
          // Find unuploaded images and update them with the new URLs
          let urlIndex = 0;
          for (let i = 0; i < newGallery.length; i++) {
            if (!newGallery[i].uploaded && newGallery[i].file) {
              if (urlIndex < urls.length) {
                newGallery[i].imageUrl = urls[urlIndex];
                newGallery[i].uploaded = true;
                newGallery[i].uploadProgress = 100;
                urlIndex++;
              }
            }
          }
          
          return newGallery;
        });

        // If all images have been uploaded, submit the form
        if (isSubmitting) {
          submitWithGallery();
        }
      }
    },
    onUploadError: (error: Error) => {
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload images. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    },
    onUploadProgress: (progress: number) => {
      // Update progress for all uploading images
      setGalleryImages(prev => {
        return prev.map(img => {
          if (!img.uploaded && img.file) {
            return { ...img, uploadProgress: progress };
          }
          return img;
        });
      });
    }
  });

  // Set up form with validation
  const form = useForm<ExtendedInsertProject>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      title: '',
      category: '',
      description: '',
      image: '', // This will be set from the gallery's feature image
      featured: false,
      overview: '',
      challenges: '',
      results: '',
      client: '',
      location: '',
      size: '',
      completionDate: '',
      servicesProvided: '',
      galleryImages: [] // Will be filled from our temp gallery state
    }
  });

  // Handle file drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  // Handle file input change
  const handleFileChange = (newFiles: FileList | File[]) => {
    // Filter for only image files
    const imageFiles = Array.from(newFiles).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (imageFiles.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please select image files only.",
        variant: "destructive"
      });
      return;
    }
    
    // Add the files to our file upload hook
    addFiles(imageFiles);
    
    // Create temporary gallery images from the files
    const newGalleryImages: TempGalleryImage[] = imageFiles.map((file, index) => ({
      id: generateId(),
      file,
      caption: file.name.split('.')[0], // Use filename as initial caption
      displayOrder: galleryImages.length + index + 1,
      isFeature: galleryImages.length === 0 && index === 0, // Make first image the feature if no others exist
      uploadProgress: 0,
      uploaded: false
    }));
    
    setGalleryImages(prev => [...prev, ...newGalleryImages]);
  };

  // Set a gallery image as the feature image
  const setFeatureImage = (id: string) => {
    console.log("Setting feature image:", id);
    
    // Update the gallery images, ensuring only one has isFeature=true
    setGalleryImages(prev => {
      // Create a new copy of the gallery
      const newGallery = prev.map(img => ({
        ...img,
        isFeature: img.id === id
      }));
      
      // Debug log for verification
      const featureImage = newGallery.find(img => img.isFeature);
      console.log("New feature image:", featureImage ? 
        { id: featureImage.id, url: featureImage.imageUrl?.substring(0, 30) + '...' } : 
        'None selected');
      
      return newGallery;
    });
    
    // Show toast notification
    toast({
      title: "Feature Image Set",
      description: "This image will be used as the main project image.",
      duration: 3000
    });
  };

  // Remove a gallery image
  const removeGalleryImage = (id: string) => {
    const imageToRemove = galleryImages.find(img => img.id === id);
    
    // If this is a feature image and we're removing it, we need to set another as feature
    const wasFeature = imageToRemove?.isFeature || false;
    
    setGalleryImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      
      // If we removed the feature image and have other images, make the first one the feature
      if (wasFeature && filtered.length > 0) {
        return filtered.map((img, idx) => ({
          ...img,
          isFeature: idx === 0 // Make the first remaining image the feature
        }));
      }
      
      return filtered;
    });
    
    // Find the index of the file in our files array and remove it
    if (imageToRemove?.file) {
      const fileIndex = files.findIndex(f => 
        f.name === imageToRemove.file?.name && 
        f.size === imageToRemove.file?.size
      );
      
      if (fileIndex !== -1) {
        removeFile(fileIndex);
      }
    }
    
    // If this is an already uploaded file, we'll handle cleanup on form submission
  };

  // Update a gallery image's caption
  const updateCaption = (id: string, caption: string) => {
    setGalleryImages(prev => 
      prev.map(img => img.id === id ? { ...img, caption } : img)
    );
  };

  // Move a gallery image up in the order
  const moveImageUp = (id: string) => {
    setGalleryImages(prev => {
      const index = prev.findIndex(img => img.id === id);
      if (index <= 0) return prev; // Already at the top
      
      const newGallery = [...prev];
      const temp = newGallery[index];
      newGallery[index] = newGallery[index - 1];
      newGallery[index - 1] = temp;
      
      // Update display orders
      return newGallery.map((img, idx) => ({
        ...img,
        displayOrder: idx + 1
      }));
    });
  };

  // Move a gallery image down in the order
  const moveImageDown = (id: string) => {
    setGalleryImages(prev => {
      const index = prev.findIndex(img => img.id === id);
      if (index === -1 || index >= prev.length - 1) return prev; // Already at the bottom
      
      const newGallery = [...prev];
      const temp = newGallery[index];
      newGallery[index] = newGallery[index + 1];
      newGallery[index + 1] = temp;
      
      // Update display orders
      return newGallery.map((img, idx) => ({
        ...img,
        displayOrder: idx + 1
      }));
    });
  };

  // Track if form has been populated to avoid infinite loop
  const [formPopulated, setFormPopulated] = useState(false);

  // Load existing project data if editing
  useEffect(() => {    
    // Only populate the form if we have project data and haven't already populated it
    if (projectId && project && !formPopulated) {
      // Populate form with project data, converting null/undefined values to empty strings
      form.reset({
        title: project.title,
        category: project.category,
        description: project.description,
        image: project.image,
        featured: project.featured === true, // Ensure boolean value
        overview: project.overview || '',
        challenges: project.challenges || '',
        results: project.results || '',
        client: project.client || '',
        location: project.location || '',
        size: project.size || '',
        completionDate: project.completionDate || '',
        servicesProvided: project.servicesProvided || '',
      });
      
      // Mark form as populated to prevent infinite loop
      setFormPopulated(true);
    } else if (projectId && !project && !isLoading && !formPopulated) {
      console.warn("Project ID provided but no project data available and not loading");
    }
  }, [projectId, project, form, isLoading, formPopulated]);

  // Track if gallery has been loaded
  const [galleryLoaded, setGalleryLoaded] = useState(false);

  // Load gallery images if editing
  useEffect(() => {
    // Only load gallery if we have data and haven't already loaded it
    if (projectId && galleryData && galleryData.length > 0 && !galleryLoaded) {
      console.log("Loading gallery images with feature info:", 
        galleryData.map(img => ({ id: img.id, isFeature: img.isFeature }))
      );
      
      // Convert gallery data to our temporary format
      const tempGallery: TempGalleryImage[] = galleryData.map(img => ({
        id: `existing-${img.id}`, // Prefix to identify existing images
        imageUrl: img.imageUrl,
        caption: img.caption || '',
        displayOrder: img.displayOrder || 0,
        isFeature: img.isFeature === true, // Force boolean evaluation
        uploaded: true // These are already uploaded
      }));
      
      // Make sure at least one image is marked as a feature
      const hasFeatureImage = tempGallery.some(img => img.isFeature);
      if (!hasFeatureImage && tempGallery.length > 0) {
        // If no feature image is marked, make the first one the feature
        tempGallery[0].isFeature = true;
      }
      
      setGalleryImages(tempGallery);
      setGalleryLoaded(true);
    }
  }, [projectId, galleryData, galleryLoaded]);

  // Function to prepare form submission
  const onSubmit = async (data: ExtendedInsertProject) => {
    // First, check if we have any images
    if (galleryImages.length === 0) {
      toast({
        title: "Images Required",
        description: "Please add at least one image to the project.",
        variant: "destructive"
      });
      return;
    }
    
    // Start the submission process
    setIsSubmitting(true);
    
    // Check if we need to upload any images
    const hasUnuploadedImages = galleryImages.some(img => !img.uploaded);
    
    // Log submission state
    console.log('Starting form submission', { 
      hasUnuploadedImages, 
      galleryImagesCount: galleryImages.length,
      isSubmitting: true
    });
    
    try {
      // If we have unuploaded images, start the upload process first
      if (hasUnuploadedImages) {
        console.log('Uploading images before form submission');
        
        // Directly use the result of upload() instead of relying on callback
        const urls = await upload();
        console.log('Upload complete in onSubmit, got URLs:', urls);
        
        // After uploads complete, submit the form with uploaded URLs
        if (urls.length > 0) {
          // Update gallery images with the new URLs
          setGalleryImages(prev => {
            const newGallery = [...prev];
            
            // Find unuploaded images and update them with the new URLs
            let urlIndex = 0;
            for (let i = 0; i < newGallery.length; i++) {
              if (!newGallery[i].uploaded && newGallery[i].file) {
                if (urlIndex < urls.length) {
                  newGallery[i].imageUrl = urls[urlIndex];
                  newGallery[i].uploaded = true;
                  newGallery[i].uploadProgress = 100;
                  urlIndex++;
                }
              }
            }
            
            return newGallery;
          });
          
          // Now proceed with gallery submission
          await submitWithGallery();
        } else if (urls.length === 0 && hasUnuploadedImages) {
          // No URLs returned, handle the error
          toast({
            title: "Upload Error",
            description: "Failed to upload images. Please try again.",
            variant: "destructive"
          });
          setIsSubmitting(false);
        }
      } else {
        // All images are already uploaded, proceed with submission
        console.log('All images already uploaded, proceeding with form submission');
        await submitWithGallery();
      }
    } catch (error) {
      console.error("Error during form submission:", error);
      toast({
        title: "Error",
        description: "Failed to save the project. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  // Function to finalize submission after all images are uploaded
  const submitWithGallery = async () => {
    try {
      // Find the feature image URL
      const featureImage = galleryImages.find(img => img.isFeature);
      if (!featureImage || !featureImage.imageUrl) {
        toast({
          title: "Feature Image Required",
          description: "Please select a feature image for the project.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Prepare the form data
      const formData = form.getValues();
      
      // Set the main image to the feature image URL
      formData.image = featureImage.imageUrl;
      
      // Prepare gallery images for submission
      formData.galleryImages = galleryImages
        .filter(img => img.imageUrl) // Only include images with URLs
        .map(img => ({
          imageUrl: img.imageUrl!,
          caption: img.caption,
          displayOrder: img.displayOrder,
          isFeature: img.isFeature
        }));
      
      if (projectId) {
        // Update existing project
        await updateProject(projectId, formData);
        
        toast({
          title: "Project Updated",
          description: "The project has been successfully updated.",
          variant: "default"
        });
      } else {
        // Create new project
        await createProject(formData);
        
        toast({
          title: "Project Created",
          description: "The project has been successfully created.",
          variant: "default"
        });
      }
      
      // Reset states and redirect back to list
      setGalleryImages([]);
      clearFiles();
      setIsSubmitting(false);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      // Close the form
      onClose();
    } catch (error) {
      console.error('Error submitting project:', error);
      
      toast({
        title: "Submission Error",
        description: "Failed to save the project. Please try again.",
        variant: "destructive"
      });
      
      setIsSubmitting(false);
    }
  };

  // Reset form state when component unmounts or is closed
  const resetFormState = () => {
    setFormPopulated(false);
    setGalleryLoaded(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("Component unmounting, resetting form state");
      resetFormState();
    };
  }, []);

  // Cancel form and clean up
  const handleCancel = () => {
    // Log cleanup attempt
    console.log("Cleaning up files for session:", sessionId);
    
    // Track any files that might need to be cleaned up - both uploaded and browser files
    const filesToCleanup = galleryImages
      .filter(img => img.uploaded && img.imageUrl && !img.id.startsWith('existing-'))
      .map(img => img.imageUrl!);
    
    console.log("Files to cleanup:", filesToCleanup);
    
    // Register each file with our tracking system
    if (filesToCleanup.length > 0) {
      filesToCleanup.forEach(fileUrl => {
        fileUtils.trackUploadedFile(fileUrl, sessionId);
      });
    }
    
    // Clean all files for this session
    fileUtils.cleanupFiles(sessionId)
      .then((cleanedUrls: string[]) => {
        console.log('File cleanup completed:', cleanedUrls.length, 'files');
      })
      .catch((error: Error) => {
        console.error('Error cleaning up files:', error);
      });
    
    // Reset states and clean up any uploaded files
    setGalleryImages([]);
    clearFiles(true); // Pass true to clean up uploaded files
    resetFormState();
    
    // Close form
    onClose();
    
    // Display success message
    toast({
      title: "Form Cancelled",
      description: "All temporary files have been cleaned up.",
      duration: 3000
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-montserrat font-bold">
          {projectId ? 'Edit Project' : 'Create New Project'}
        </h1>
        <Button variant="ghost" onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading project data...</span>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Project Information */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project title" {...field} />
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
                      <FormLabel>Category*</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Commercial">Commercial</SelectItem>
                          <SelectItem value="Residential">Residential</SelectItem>
                          <SelectItem value="Institutional">Institutional</SelectItem>
                          <SelectItem value="Industrial">Industrial</SelectItem>
                          <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                          <SelectItem value="Mixed-Use">Mixed-Use</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brief Description*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter a brief description of the project" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      A short summary that will appear on the project listing page.
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
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured Project</FormLabel>
                      <FormDescription>
                        Featured projects are displayed prominently on the homepage.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            {/* Gallery Images */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">Project Gallery</h2>
                <Badge variant="outline" className="flex gap-1 items-center">
                  <ImageIcon className="h-3 w-3" />
                  {galleryImages.length} Image{galleryImages.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div
                className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary/10' 
                    : 'border-gray-300 hover:border-primary/50'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="p-3 rounded-full bg-primary/10">
                    <UploadCloud className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">
                    Drag & drop images here
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload up to 10 images in JPG, PNG, or WebP format
                    <br />
                    Maximum size: 8MB per image
                  </p>
                  <Button 
                    type="button"
                    variant="secondary"
                    disabled={isUploading}
                    onClick={() => document.getElementById('galleryInput')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? 'Uploading...' : 'Browse images'}
                  </Button>
                  <input
                    id="galleryInput"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && handleFileChange(e.target.files)}
                  />
                </div>
              </div>
              
              {/* Gallery preview */}
              {galleryImages.length > 0 && (
                <SortableGallery 
                  images={galleryImages}
                  onImagesChange={setGalleryImages}
                  onRemoveImage={removeGalleryImage}
                  onSetFeatureImage={setFeatureImage}
                  onUpdateCaption={updateCaption}
                  onMoveImageUp={moveImageUp}
                  onMoveImageDown={moveImageDown}
                />
              )}
            </div>
            
            {/* Project Details Section */}
            <div className="space-y-4">
              <div className="flex items-center">
                <h2 className="text-xl font-medium">Project Details</h2>
                <Separator className="flex-1 ml-3" />
              </div>
              
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
                          value={safeString(field.value)}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          disabled={field.disabled}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
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
                          value={safeString(field.value)}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          disabled={field.disabled}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Project size (e.g., 10,000 sq ft)" 
                          value={safeString(field.value)}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          disabled={field.disabled}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
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
                          placeholder="When the project was completed" 
                          value={safeString(field.value)}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          disabled={field.disabled}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="servicesProvided"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Services Provided</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Services provided for this project" 
                          value={safeString(field.value)}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          disabled={field.disabled}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="overview"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Overview</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed description of the project" 
                        className="min-h-[150px]"
                        value={safeString(field.value)}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        disabled={field.disabled}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="challenges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Challenges & Solutions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the challenges faced and solutions implemented" 
                        className="min-h-[150px]"
                        value={safeString(field.value)}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        disabled={field.disabled}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="results"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Results & Outcomes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the results and outcomes of the project" 
                        className="min-h-[150px]"
                        value={safeString(field.value)}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        disabled={field.disabled}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Submit and Cancel buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting || isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isUploading ? 'Uploading Images...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {projectId ? 'Update Project' : 'Create Project'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}